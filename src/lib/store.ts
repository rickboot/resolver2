import { ContentRequest, ContentRequestStatus, ContentDraft } from './types';

// Simple in-memory store for MVP/dev
const requests = new Map<string, ContentRequest>();
const drafts = new Map<string, ContentDraft[]>();

export function saveRequest(request: ContentRequest) {
  requests.set(request.id, request);
}

export function getRequest(requestId: string): ContentRequest | undefined {
  return requests.get(requestId);
}

export function listRequests(): ContentRequest[] {
  return Array.from(requests.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

export function updateRequestStatus(
  requestId: string,
  status: ContentRequestStatus,
  errorMessage?: string
) {
  const existing = requests.get(requestId);
  if (!existing) return;
  existing.status = status;
  existing.updatedAt = new Date().toISOString();
  if (errorMessage) existing.errorMessage = errorMessage;
  requests.set(requestId, existing);
}

export function saveDrafts(requestId: string, draftsList: ContentDraft[]) {
  drafts.set(requestId, draftsList);
}

export function getDrafts(requestId: string): ContentDraft[] {
  return drafts.get(requestId) || [];
}

export function getAllDrafts(): ContentDraft[] {
  return Array.from(drafts.values()).flat();
}
