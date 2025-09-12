import { getRequest, updateRequestStatus, saveDrafts } from './store';
import { generateContent } from './ai';
import { dequeueMessage, getQueueSize } from './shared-queue';

let started = false;

async function processOnce() {
  console.log('=== DEV WORKER PROCESS ONCE ===');
  console.log('Queue size:', getQueueSize());
  
  const message = dequeueMessage();
  if (!message) {
    console.log('No messages in queue');
    return;
  }

  console.log('Processing queue message:', message);

  const req = getRequest(message.requestId);
  if (!req) {
    console.log('Request not found:', message.requestId);
    return;
  }

  console.log('Found request:', req);

  // Idempotency: if already terminal, skip
  if (req.status === 'completed' || req.status === 'failed') {
    console.log('Request already terminal:', req.status);
    return;
  }

  console.log('Updating status to processing');
  updateRequestStatus(req.id, 'processing');

  try {
    // Get brand profile for AI generation
    const brandResponse = await fetch(
      `http://localhost:3000/api/brand-profile?accountId=${message.accountId}`
    );
    if (!brandResponse.ok) {
      throw new Error('Brand profile not found');
    }
    const brandData = await brandResponse.json();
    const brand = brandData.brandProfile.brand;

    // Generate content using AI
    const result = await generateContent(brand, req.brief);

    if (result.error) {
      throw new Error(result.error);
    }

    // Update drafts with request ID
    const draftsWithRequestId = result.drafts.map((draft) => ({
      ...draft,
      requestId: req.id,
    }));

    // Save generated drafts
    saveDrafts(req.id, draftsWithRequestId);

    // Mark request as completed
    updateRequestStatus(req.id, 'completed');
    console.log('Request completed successfully:', req.id);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log('Error processing request:', errorMessage);
    updateRequestStatus(req.id, 'failed', errorMessage);
  }
}

async function loop() {
  console.log('Dev worker loop started');
  while (true) {
    try {
      await processOnce();
    } catch (error) {
      console.error('Error in dev worker loop:', error);
      // swallow to keep loop alive in dev
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

export function startDevWorker() {
  console.log('startDevWorker called, started:', started, 'NODE_ENV:', process.env.NODE_ENV);
  if (started) {
    console.log('Dev worker already started, skipping');
    return;
  }
  if (process.env.NODE_ENV !== 'development') {
    console.log('Not in development mode, skipping dev worker');
    return;
  }
  started = true;
  console.log('Starting dev worker...');
  // Fire and forget
  loop();
}
