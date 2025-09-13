import { eq, desc } from 'drizzle-orm';
import { getDb } from './connection';
import { brands, contentRequests, contentDrafts, type Brand, type ContentRequest, type ContentDraft, type NewBrand, type NewContentRequest, type NewContentDraft } from './schema';
import { BrandProfile, ContentBrief, ContentRequestStatus } from '../types';

// Brand operations
export async function saveBrandProfile(accountId: string, brandProfile: BrandProfile): Promise<void> {
  const db = getDb();
  
  const brandData: NewBrand = {
    accountId,
    name: brandProfile.brand.name,
    oneLineDescription: brandProfile.brand.oneLineDescription,
    industry: brandProfile.brand.industry,
    tone: brandProfile.brand.tone,
    audienceSummary: brandProfile.brand.audienceSummary,
    valueProp: brandProfile.brand.valueProp,
    heroItems: brandProfile.brand.heroItems,
    wordsWeLove: brandProfile.brand.wordsWeLove,
    wordsToAvoid: brandProfile.brand.wordsToAvoid,
    primaryColorHex: brandProfile.brand.primaryColorHex,
    imageStyleNote: brandProfile.brand.imageStyleNote,
  };

  await db.insert(brands)
    .values(brandData)
    .onConflictDoUpdate({
      target: brands.accountId,
      set: {
        ...brandData,
        updatedAt: new Date(),
      },
    });
    
  console.log('✅ Brand profile saved to database:', accountId);
}

export async function getBrandProfile(accountId: string): Promise<BrandProfile | null> {
  const db = getDb();
  
  const result = await db.select()
    .from(brands)
    .where(eq(brands.accountId, accountId))
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  const brand = result[0];
  return {
    brand: {
      name: brand.name,
      oneLineDescription: brand.oneLineDescription || '',
      industry: brand.industry || '',
      tone: brand.tone as string[] || [],
      audienceSummary: brand.audienceSummary || '',
      valueProp: brand.valueProp || '',
      heroItems: brand.heroItems as string[] || [],
      wordsWeLove: brand.wordsWeLove as string[] || [],
      wordsToAvoid: brand.wordsToAvoid as string[] || [],
      primaryColorHex: brand.primaryColorHex || '#000000',
      imageStyleNote: brand.imageStyleNote || '',
    },
  };
}

// Content request operations
export async function saveRequest(request: ContentRequest): Promise<void> {
  const db = getDb();
  
  const requestData: NewContentRequest = {
    id: request.id,
    accountId: request.accountId,
    status: request.status,
    brief: request.brief,
    errorMessage: request.errorMessage,
  };

  await db.insert(contentRequests).values(requestData);
  console.log('✅ Request saved to database:', request.id);
}

export async function getRequest(requestId: string): Promise<ContentRequest | null> {
  const db = getDb();
  
  const result = await db.select()
    .from(contentRequests)
    .where(eq(contentRequests.id, requestId))
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  const request = result[0];
  return {
    id: request.id,
    accountId: request.accountId,
    status: request.status as ContentRequestStatus,
    brief: request.brief as ContentBrief,
    errorMessage: request.errorMessage || undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export async function listRequests(): Promise<ContentRequest[]> {
  const db = getDb();
  
  const results = await db.select()
    .from(contentRequests)
    .orderBy(desc(contentRequests.createdAt));
    
  return results.map(request => ({
    id: request.id,
    accountId: request.accountId,
    status: request.status as ContentRequestStatus,
    brief: request.brief as ContentBrief,
    errorMessage: request.errorMessage || undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  }));
}

export async function updateRequestStatus(
  requestId: string,
  status: ContentRequestStatus,
  errorMessage?: string
): Promise<void> {
  const db = getDb();
  
  await db.update(contentRequests)
    .set({
      status,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(contentRequests.id, requestId));
    
  console.log('✅ Request status updated:', requestId, status);
}

// Content draft operations
export async function saveDrafts(requestId: string, draftsList: ContentDraft[]): Promise<void> {
  const db = getDb();
  
  const draftsData: NewContentDraft[] = draftsList.map(draft => ({
    id: draft.id,
    requestId,
    caption: draft.caption,
    imagePrompt: draft.imagePrompt,
    hashtags: draft.hashtags,
  }));

  await db.insert(contentDrafts).values(draftsData);
  console.log('✅ Drafts saved to database:', requestId, draftsList.length);
}

export async function getDrafts(requestId: string): Promise<ContentDraft[]> {
  const db = getDb();
  
  const results = await db.select()
    .from(contentDrafts)
    .where(eq(contentDrafts.requestId, requestId))
    .orderBy(contentDrafts.createdAt);
    
  return results.map(draft => ({
    id: draft.id,
    requestId: draft.requestId,
    caption: draft.caption,
    imagePrompt: draft.imagePrompt || undefined,
    hashtags: draft.hashtags as string[] || undefined,
    createdAt: draft.createdAt.toISOString(),
  }));
}

export async function getAllDrafts(): Promise<ContentDraft[]> {
  const db = getDb();
  
  const results = await db.select()
    .from(contentDrafts)
    .orderBy(desc(contentDrafts.createdAt));
    
  return results.map(draft => ({
    id: draft.id,
    requestId: draft.requestId,
    caption: draft.caption,
    imagePrompt: draft.imagePrompt || undefined,
    hashtags: draft.hashtags as string[] || undefined,
    createdAt: draft.createdAt.toISOString(),
  }));
}
