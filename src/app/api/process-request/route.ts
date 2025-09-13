import { NextRequest } from 'next/server';
import { enqueueProcessingJob } from '@/lib/aws/sqs';
import { getRequest, updateRequestStatus } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, accountId } = body;

    console.log('🚀 Processing request:', requestId, 'for account:', accountId);

    // Get the request to validate it exists
    const request = await getRequest(requestId);
    if (!request) {
      console.log('❌ Request not found:', requestId);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Found request:', {
      id: request.id,
      status: request.status,
      platform: request.brief?.socialPlatform || 'unknown',
      goal: request.brief?.goal?.slice(0, 50) + '...' || 'no goal'
    });

    // Update status to queued for Lambda processing
    console.log('📝 Updating status to queued...');
    await updateRequestStatus(requestId, 'queued');

    // Enqueue job for Lambda processing with image generation
    console.log('📤 Enqueuing job for AWS Lambda processing...');
    await enqueueProcessingJob({
      requestId,
      accountId,
      priority: 'normal'
    });

    console.log('✅ Job enqueued successfully! Lambda will process with image generation.');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Content generation job queued successfully',
        status: 'queued',
        note: 'Lambda function will generate content with images'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing request:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Try to update request status to failed
    try {
      const { requestId } = await req.json();
      if (requestId) {
        await updateRequestStatus(requestId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      }
    } catch (updateError) {
      console.error('Failed to update request status:', updateError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
