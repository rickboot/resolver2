import { NextRequest } from 'next/server';
import {
  ContentBrief,
  ContentRequest,
  ContentRequestStatus,
  generateId,
  JobMessage,
  nowIso,
} from '@/lib/types';
import { saveRequest, listRequests } from '@/lib/file-store';
import { enqueueMessage } from '@/lib/shared-queue';

export async function POST(req: NextRequest) {
  console.log('=== API ROUTE POST CALLED ===');
  try {
    const body = await req.json();
    const brief = body?.brief as ContentBrief;
    const accountId = body?.accountId as string;
    if (!accountId || !brief || !brief.goal || !brief.socialPlatform) {
      return new Response(
        JSON.stringify({
          error: 'accountId, brief.goal, and brief.socialPlatform are required',
        }),
        { status: 400 }
      );
    }

    const id = generateId('req');
    const createdAt = nowIso();
    const request: ContentRequest = {
      id,
      accountId,
      brief,
      status: 'queued' satisfies ContentRequestStatus,
      createdAt,
      updatedAt: createdAt,
    };
    saveRequest(request);

    const message: JobMessage = { requestId: id, accountId };
    enqueueMessage(message);

    return new Response(JSON.stringify({ request }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
}

export async function GET() {
  const list = listRequests();
  return new Response(JSON.stringify({ requests: list }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
