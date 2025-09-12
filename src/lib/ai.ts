import OpenAI from 'openai';
import {
  BrandIdentity,
  ContentBrief,
  ContentDraft,
  generateId,
  nowIso,
} from './types';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openai;
}

export interface AIGenerationResult {
  drafts: ContentDraft[];
  error?: string;
}

export async function generateContent(
  brand: BrandIdentity,
  brief: ContentBrief
): Promise<AIGenerationResult> {
  console.log('=== AI CONTENT GENERATION START ===');
  console.log('Brand:', brand.name);
  console.log('Platform:', brief.socialPlatform);
  console.log('Goal:', brief.goal);
  
  try {
    // Check if OpenAI API key is available
    const client = getOpenAIClient();
    if (!client) {
      console.log('⚠️ OpenAI API key not found, falling back to mock generation');
      const drafts = generateMockDrafts(brief, brand);
      console.log('✅ Mock generation completed, created', drafts.length, 'drafts');
      return { drafts };
    }

    console.log('🤖 Using OpenAI API for content generation');
    
    // Use real OpenAI API
    const prompt = buildPrompt(brand, brief);
    console.log('📝 Built prompt, length:', prompt.length, 'characters');
    
    const aiResponse = await generateWithOpenAI(prompt);
    console.log('🎯 OpenAI response received, length:', aiResponse.length, 'characters');
    
    // Parse the AI response into drafts
    const drafts = parseAIResponse(aiResponse, brief);
    console.log('✅ AI generation completed, created', drafts.length, 'drafts');
    
    return { drafts };
  } catch (error) {
    console.error('❌ AI generation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Fallback to mock generation on error
    console.log('🔄 Falling back to mock generation due to error');
    const drafts = generateMockDrafts(brief, brand);
    console.log('✅ Fallback generation completed, created', drafts.length, 'drafts');
    
    return {
      drafts,
      error: error instanceof Error ? error.message : 'AI generation failed, using fallback',
    };
  } finally {
    console.log('=== AI CONTENT GENERATION END ===');
  }
}

function buildPrompt(brand: BrandIdentity, brief: ContentBrief): string {
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
- Key Products/Services: ${brand.heroItems?.join(', ') || 'General services'}
- Words to Use: ${brand.wordsWeLove?.join(', ') || 'N/A'}
- Words to Avoid: ${brand.wordsToAvoid?.join(', ') || 'N/A'}

CONTENT BRIEF:
- Primary Goal: ${brief.goal}
- Theme/Topic: ${brief.theme || 'Brand promotion'}
- Call to Action: ${brief.callToAction || 'Engage with our brand'}
- Constraints: ${brief.constraints?.join(', ') || 'None'}

PLATFORM GUIDELINES (${brief.socialPlatform}):
${platformGuidelines[brief.socialPlatform] || 'Standard social media best practices'}

INSTRUCTIONS:
1. Create 3 different approaches: Educational, Story-driven, and Direct promotional
2. Each post must maintain the brand's ${Array.isArray(brand.tone) ? brand.tone.join(', ') : brand.tone} tone
3. Target the specified audience: ${brand.audienceSummary}
4. Include platform-appropriate formatting and elements
5. Each variation should feel distinct but on-brand

FORMAT YOUR RESPONSE AS:
---
1.
Caption: [Your caption here]
Image Prompt: [Detailed description for image generation]

---
2.
Caption: [Your caption here]
Image Prompt: [Detailed description for image generation]

---
3.
Caption: [Your caption here]
Image Prompt: [Detailed description for image generation]

Ensure each caption is optimized for ${brief.socialPlatform} and aligns with the goal: ${brief.goal}
  `.trim();
}

function generateMockDrafts(
  brief: ContentBrief,
  brand: BrandIdentity
): ContentDraft[] {
  const baseApproaches = [
    'Educational approach focusing on benefits',
    'Engaging story-driven content',
    'Direct promotional message with clear CTA',
  ];

  return baseApproaches.map((approach, index) => {
    const requestId = 'temp'; // Will be set by caller
    const id = generateId('draft');

    return {
      id,
      requestId,
      caption: generateMockCaption(brief, brand, approach),
      imagePrompt: generateMockImagePrompt(brief, brand, approach),
      createdAt: nowIso(),
    };
  });
}

function generateMockCaption(
  brief: ContentBrief,
  brand: BrandIdentity,
  approach: string
): string {
  const platform = brief.socialPlatform;
  const goal = brief.goal;
  const theme = brief.theme;
  const cta = brief.callToAction;

  // Platform-specific formatting
  const hashtags =
    platform === 'instagram'
      ? `\n\n#${brand.name.replace(/\s+/g, '')} #${
          theme?.replace(/\s+/g, '') || 'content'
        }`
      : '';
  const emoji = platform === 'tiktok' ? '✨ ' : '';

  // Generate approach-specific content
  let caption = '';

  if (approach.includes('Educational')) {
    caption = `${emoji}Did you know? ${goal.toLowerCase()} is easier than you think! ${
      brand.oneLineDescription
    } ${cta ? `\n\n${cta}` : ''}${hashtags}`;
  } else if (approach.includes('story')) {
    caption = `${emoji}Here's what happened when we ${goal.toLowerCase()}... The results? Amazing! ${
      brand.valueProp
    } ${cta ? `\n\n${cta}` : ''}${hashtags}`;
  } else {
    caption = `${emoji}${goal}! ${brand.valueProp} ${
      cta ? `\n\n${cta}` : ''
    }${hashtags}`;
  }

  return caption;
}

function generateMockImagePrompt(
  brief: ContentBrief,
  brand: BrandIdentity,
  approach: string
): string {
  const style = brand.imageStyleNote || 'professional, clean';
  const colors = brand.primaryColorHex;
  const theme = brief.theme || 'modern';

  let prompt = `A ${style} image for ${brand.name}, ${theme} theme, ${colors} color scheme`;

  if (approach.includes('Educational')) {
    prompt += ', showing helpful information or before/after comparison';
  } else if (approach.includes('story')) {
    prompt += ', featuring people or customers in a relatable situation';
  } else {
    prompt += ', with clear call-to-action text overlay';
  }

  if (brand.heroItems && brand.heroItems.length > 0) {
    prompt += `, highlighting ${brand.heroItems[0]}`;
  }

  return prompt;
}

// Real OpenAI integration
export async function generateWithOpenAI(prompt: string): Promise<string> {
  console.log('🔄 Initializing OpenAI client...');
  const client = getOpenAIClient();
  if (!client) {
    console.error('❌ OpenAI client not available - API key missing');
    throw new Error('OpenAI client not available - API key missing');
  }

  console.log('📡 Making OpenAI API request...');
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    console.log('✅ OpenAI API request successful');
    console.log('Response choices:', response.choices?.length || 0);
    
    const content = response.choices[0]?.message?.content || '';
    if (!content) {
      console.warn('⚠️ OpenAI returned empty content');
    }
    
    return content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if ('status' in error) {
        console.error('HTTP status:', (error as { status: number }).status);
      }
    }
    throw new Error(`OpenAI API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse AI response into structured drafts
function parseAIResponse(aiResponse: string, brief: ContentBrief): ContentDraft[] {
  console.log('🔍 Parsing AI response...');
  console.log('Response preview:', aiResponse.slice(0, 200) + '...');
  
  try {
    // Try to parse as JSON first
    console.log('🧪 Attempting JSON parse...');
    const parsed = JSON.parse(aiResponse);
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('✅ Successfully parsed as JSON array with', parsed.length, 'items');
      return parsed.map((item, index) => ({
        id: generateId('draft'),
        requestId: 'temp', // Will be set by caller
        caption: item.caption || item.text || '',
        imagePrompt: item.imagePrompt || item.image_prompt || `Professional image for ${brief.socialPlatform} post`,
        createdAt: nowIso(),
      }));
    }
  } catch {
    console.log('📝 Not JSON format, parsing as structured text...');
  }
  
  // Fallback: split response into sections and create drafts
  const sections = aiResponse.split(/\n\s*---\s*\n|\n\s*\d+\.\s*/).filter(s => s.trim());
  console.log('📋 Found', sections.length, 'sections in response');
  
  const drafts: ContentDraft[] = [];
  
  for (let i = 0; i < Math.min(sections.length, 3); i++) {
    const section = sections[i].trim();
    if (!section) continue;
    
    console.log(`🔍 Processing section ${i + 1}:`, section.slice(0, 100) + '...');
    
    // Try to extract caption and image prompt from the section
    const lines = section.split('\n').filter(l => l.trim());
    let caption = '';
    let imagePrompt = '';
    
    // Look for structured format
    const captionMatch = section.match(/(?:caption|text):\s*([\s\S]*?)(?=\n(?:image|prompt):|$)/i);
    const imageMatch = section.match(/(?:image|prompt):\s*([\s\S]*?)$/i);
    
    if (captionMatch && imageMatch) {
      caption = captionMatch[1].trim();
      imagePrompt = imageMatch[1].trim();
      console.log('✅ Found structured format - Caption:', caption.slice(0, 50) + '...');
    } else {
      // Use first part as caption, generate image prompt
      caption = lines.slice(0, Math.ceil(lines.length / 2)).join('\n').trim();
      imagePrompt = `Professional ${brief.socialPlatform} image that complements: ${caption.slice(0, 100)}...`;
      console.log('📝 Using fallback format - Caption:', caption.slice(0, 50) + '...');
    }
    
    if (caption) {
      drafts.push({
        id: generateId('draft'),
        requestId: 'temp',
        caption,
        imagePrompt,
        createdAt: nowIso(),
      });
      console.log('✅ Created draft', i + 1, 'with caption length:', caption.length);
    }
  }
  
  // Ensure we have at least one draft
  if (drafts.length === 0) {
    console.log('⚠️ No drafts created, using fallback draft');
    drafts.push({
      id: generateId('draft'),
      requestId: 'temp',
      caption: aiResponse.slice(0, 500) + (aiResponse.length > 500 ? '...' : ''),
      imagePrompt: `Professional image for ${brief.socialPlatform} post about ${brief.goal}`,
      createdAt: nowIso(),
    });
  }
  
  console.log('🎯 Final result:', drafts.length, 'drafts created');
  return drafts.slice(0, 3); // Limit to 3 drafts
}
