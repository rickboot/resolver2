export type UUID = string;

export type SocialPlatform =
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'facebook'
  | 'linkedin'
  | 'youtube_shorts';

export interface Account {
  id: UUID;
  name: string;
  contactEmail?: string;
}

export interface BrandProfile {
  accountId: UUID;
  brand: BrandIdentity;
  updatedAt: string; // ISO timestamp
}

// Brand identity for AI content generation
export type BrandIdentity = {
  // --- Basics ---
  name: string;
  oneLineDescription: string;
  tone: string[]; // up to 3 words

  // --- Audience & Product ---
  audienceSummary: string; // 1–2 sentences
  heroItems: string[]; // 1–3 SKUs or categories
  valueProp: string; // short benefit phrase

  // --- Writing Guardrails ---
  wordsWeLove?: string[];
  wordsToAvoid?: string[];

  // --- Visuals ---
  logoUrl: string; // PNG/SVG with transparent bg
  primaryColorHex: string; // e.g., "#0A84FF"
  secondaryColorHexes?: string[];
  fontName?: string;
  exampleImageUrls?: string[]; // 2–3 refs
  imageStyleNote?: string; // short descriptor
};

export type ContentRequestStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ContentBrief {
  goal: string; // e.g., drive traffic, announce sale
  theme?: string; // e.g., fall collection
  callToAction?: string; // e.g., "Shop now"
  constraints?: string[]; // e.g., avoid discounts
  socialPlatform: SocialPlatform;
}

export interface ContentRequest {
  id: UUID;
  accountId: UUID;
  brief: ContentBrief;
  status: ContentRequestStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface ContentDraft {
  id: UUID;
  requestId: UUID;
  caption: string;
  imagePrompt: string;
  hashtags?: string[];
  createdAt: string;
}

export interface JobMessage {
  requestId: UUID;
  accountId: UUID;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function generateId(prefix: string = 'id'): UUID {
  // Simple dev-friendly ID; replace with crypto UUID later
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}
