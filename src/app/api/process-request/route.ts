import { NextRequest } from 'next/server';
import { generateContent } from '@/lib/ai';
import { getRequest, updateRequestStatus, saveDrafts } from '@/lib/file-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, accountId } = body;

    console.log(' Processing request:', requestId, 'for account:', accountId);

    // Get the request
    const request = getRequest(requestId);
    if (!request) {
      console.log(' Request not found:', requestId);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(' Found request:', {
      id: request.id,
      status: request.status,
      platform: request.brief.socialPlatform,
      goal: request.brief.goal.slice(0, 50) + '...'
    });

    // Update status to processing
    console.log(' Updating status to processing...');
    updateRequestStatus(requestId, 'processing');

    // Get brand profile
    console.log(' Fetching brand profile for account:', accountId);
    const brandResponse = await fetch(
      `http://localhost:3000/api/brand-profile?accountId=${accountId}`
    );
    
    if (!brandResponse.ok) {
      console.log(' Brand profile fetch failed:', brandResponse.status, brandResponse.statusText);
      updateRequestStatus(requestId, 'failed', 'Brand profile not found');
      return new Response(
        JSON.stringify({ error: 'Brand profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const brandData = await brandResponse.json();
    const brand = brandData.brandProfile.brand;
    console.log(' Brand profile loaded:', brand.name, '- Industry:', brand.industry);

    // Generate content
    console.log(' Starting AI content generation...');
    const result = await generateContent(brand, request.brief);

    if (result.error) {
      console.log(' Content generation failed:', result.error);
      updateRequestStatus(requestId, 'failed', result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(' Content generation successful, created', result.drafts.length, 'drafts');

    // Update drafts with request ID
    const draftsWithRequestId = result.drafts.map((draft) => ({
      ...draft,
      requestId: requestId,
    }));

    // Save drafts and mark as completed
    console.log(' Saving drafts to storage...');
    saveDrafts(requestId, draftsWithRequestId);
    
    console.log(' Marking request as completed...');
    updateRequestStatus(requestId, 'completed');

    console.log(' Request processing completed successfully!');
    return new Response(
      JSON.stringify({ 
        success: true, 
        drafts: draftsWithRequestId.length,
        message: 'Content generated successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(' Error processing request:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    console.log('=== PROCESS REQUEST API END ===');
  }
}
