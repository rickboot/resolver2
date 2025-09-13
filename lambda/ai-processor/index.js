const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const OpenAI = require('openai');
const { Pool } = require('pg');
const { createImageService } = require('../../src/lib/image-generation');

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

let openaiClient = null;
let dbPool = null;
let imageService = null;

async function getSecret(secretName) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);
  return response.SecretString;
}

async function initializeClients() {
  if (!openaiClient) {
    const secretValue = await getSecret('resolver2/openai-api-key');
    const secret = JSON.parse(secretValue);
    const apiKey = secret['openai-api-key'];
    openaiClient = new OpenAI({ apiKey });
  }
  
  if (!dbPool) {
    dbPool = new Pool({
      host: process.env.AWS_RDS_HOST,
      port: parseInt(process.env.AWS_RDS_PORT || '5432'),
      database: process.env.AWS_RDS_DATABASE,
      user: process.env.AWS_RDS_USER,
      password: process.env.AWS_RDS_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  
  if (!imageService) {
    const openaiApiKey = await getSecret('resolver2/openai-api-key');
    imageService = createImageService({
      defaultProvider: 'bedrock', // Use AWS Bedrock as primary (cheapest)
      openaiApiKey: openaiApiKey,  // Fallback to OpenAI
      awsRegion: process.env.AWS_REGION
    });
  }
}

async function generateContent(brand, brief) {
  const prompt = buildPrompt(brand, brief);
  
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  const content = response.choices[0]?.message?.content || '';
  return parseAIResponse(content, brief);
}

async function generateImages(drafts, brief) {
  const generatedImages = [];
  
  for (const draft of drafts) {
    try {
      console.log(`Generating image for: ${draft.imagePrompt.slice(0, 50)}...`);
      
      const imageResult = await imageService.generateImage({
        prompt: draft.imagePrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      });
      
      if (imageResult.images && imageResult.images.length > 0) {
        generatedImages.push({
          ...draft,
          imageUrl: imageResult.images[0].url,
          imageProvider: imageResult.provider,
          imageCost: imageResult.cost
        });
        
        console.log(`Image generated successfully with ${imageResult.provider}, cost: $${imageResult.cost}`);
      } else {
        // Fallback if no image generated
        generatedImages.push({
          ...draft,
          imageUrl: null,
          imageProvider: null,
          imageCost: 0
        });
      }
    } catch (error) {
      console.error('Image generation failed for draft:', error);
      // Continue with text-only content
      generatedImages.push({
        ...draft,
        imageUrl: null,
        imageProvider: null,
        imageCost: 0
      });
    }
  }
  
  return generatedImages;
}

function buildPrompt(brand, brief) {
  const platformGuidelines = {
    instagram: 'Use relevant hashtags, engaging visuals, stories-friendly format',
    twitter: 'Keep under 280 characters, use trending hashtags sparingly',
    tiktok: 'Fun, engaging, trend-aware content with strong hook',
    facebook: 'Conversational tone, community-focused, longer form OK',
    linkedin: 'Professional tone, industry insights, networking focus',
    youtube_shorts: 'Attention-grabbing, vertical video optimized'
  };

  return `
You are a professional social media content creator. Generate 3 distinct social media posts for ${brand.name} on ${brief.socialPlatform}.

BRAND IDENTITY:
- Name: ${brand.name}
- Description: ${brand.oneLineDescription}
- Brand Tone: ${Array.isArray(brand.tone) ? brand.tone.join(', ') : brand.tone}
- Target Audience: ${brand.audienceSummary}
- Value Proposition: ${brand.valueProp}

CONTENT BRIEF:
- Primary Goal: ${brief.goal}
- Theme/Topic: ${brief.theme || 'Brand promotion'}
- Call to Action: ${brief.callToAction || 'Engage with our brand'}

PLATFORM GUIDELINES (${brief.socialPlatform}):
${platformGuidelines[brief.socialPlatform] || 'Standard social media best practices'}

FORMAT YOUR RESPONSE AS JSON:
[
  {
    "caption": "Your caption here",
    "imagePrompt": "Detailed description for image generation",
    "hashtags": ["hashtag1", "hashtag2"]
  },
  {
    "caption": "Your caption here", 
    "imagePrompt": "Detailed description for image generation",
    "hashtags": ["hashtag1", "hashtag2"]
  },
  {
    "caption": "Your caption here",
    "imagePrompt": "Detailed description for image generation", 
    "hashtags": ["hashtag1", "hashtag2"]
  }
]
  `.trim();
}

function parseAIResponse(aiResponse, brief) {
  try {
    const parsed = JSON.parse(aiResponse);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        caption: item.caption || '',
        imagePrompt: item.imagePrompt || `Professional image for ${brief.socialPlatform} post`,
        hashtags: item.hashtags || [],
      }));
    }
  } catch (error) {
    console.log('Failed to parse as JSON, using fallback');
  }
  
  // Fallback parsing
  return [{
    caption: aiResponse.slice(0, 500),
    imagePrompt: `Professional image for ${brief.socialPlatform} post about ${brief.goal}`,
    hashtags: [],
  }];
}

async function processJob(job) {
  console.log('Processing job:', job);
  
  await initializeClients();
  
  // Get request from database
  const requestQuery = 'SELECT * FROM content_requests WHERE id = $1';
  const requestResult = await dbPool.query(requestQuery, [job.requestId]);
  
  if (requestResult.rows.length === 0) {
    throw new Error(`Request ${job.requestId} not found`);
  }
  
  const request = requestResult.rows[0];
  
  // Get brand from database
  const brandQuery = 'SELECT * FROM brands WHERE account_id = $1';
  const brandResult = await dbPool.query(brandQuery, [job.accountId]);
  
  if (brandResult.rows.length === 0) {
    throw new Error(`Brand for account ${job.accountId} not found`);
  }
  
  const brand = brandResult.rows[0];
  
  // Update status to processing
  await dbPool.query(
    'UPDATE content_requests SET status = $1, updated_at = NOW() WHERE id = $2',
    ['processing', job.requestId]
  );
  
  try {
    // Generate content
    const drafts = await generateContent(brand, request.brief);
    
    // Generate images for each draft
    const draftsWithImages = await generateImages(drafts, request.brief);
    
    // Save drafts to database
    for (const draft of draftsWithImages) {
      await dbPool.query(
        'INSERT INTO content_drafts (request_id, caption, image_prompt, hashtags, image_url, image_provider, image_cost, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [job.requestId, draft.caption, draft.imagePrompt, JSON.stringify(draft.hashtags), draft.imageUrl, draft.imageProvider, draft.imageCost]
      );
    }
    
    // Update status to completed
    await dbPool.query(
      'UPDATE content_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      ['completed', job.requestId]
    );
    
    console.log('Job completed successfully:', job.requestId);
    
  } catch (error) {
    console.error('Job processing failed:', error);
    
    // Update status to failed
    await dbPool.query(
      'UPDATE content_requests SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
      ['failed', error.message, job.requestId]
    );
    
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('Lambda function started');
  
  try {
    // Process SQS messages
    for (const record of event.Records) {
      const job = JSON.parse(record.body);
      await processJob(job);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Jobs processed successfully' }),
    };
    
  } catch (error) {
    console.error('Lambda execution failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
