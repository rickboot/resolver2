import fs from 'fs';
import path from 'path';
import { ContentRequest, ContentRequestStatus, ContentDraft, BrandProfile } from './types';

const STORE_DIR = path.join(process.cwd(), '.store');
const REQUESTS_FILE = path.join(STORE_DIR, 'requests.json');
const DRAFTS_FILE = path.join(STORE_DIR, 'drafts.json');
const BRANDS_FILE = path.join(STORE_DIR, 'brands.json');

// Ensure store directory exists
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

function readRequests(): Map<string, ContentRequest> {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
      const obj = JSON.parse(data);
      return new Map(Object.entries(obj));
    }
  } catch (error) {
    console.error('Error reading requests file:', error);
  }
  return new Map();
}

function writeRequests(requests: Map<string, ContentRequest>): void {
  try {
    const obj = Object.fromEntries(requests);
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('Error writing requests file:', error);
  }
}

function readDrafts(): Map<string, ContentDraft[]> {
  try {
    if (fs.existsSync(DRAFTS_FILE)) {
      const data = fs.readFileSync(DRAFTS_FILE, 'utf8');
      const obj = JSON.parse(data);
      return new Map(Object.entries(obj));
    }
  } catch (error) {
    console.error('Error reading drafts file:', error);
  }
  return new Map();
}

function writeDrafts(drafts: Map<string, ContentDraft[]>): void {
  try {
    const obj = Object.fromEntries(drafts);
    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('Error writing drafts file:', error);
  }
}

export function saveRequest(request: ContentRequest) {
  const requests = readRequests();
  requests.set(request.id, request);
  writeRequests(requests);
  console.log('Saved request to file:', request.id);
}

export function getRequest(requestId: string): ContentRequest | undefined {
  const requests = readRequests();
  const request = requests.get(requestId);
  console.log('Retrieved request from file:', requestId, request ? 'found' : 'not found');
  return request;
}

export function listRequests(): ContentRequest[] {
  const requests = readRequests();
  return Array.from(requests.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

export function updateRequestStatus(
  requestId: string,
  status: ContentRequestStatus,
  errorMessage?: string
) {
  const requests = readRequests();
  const existing = requests.get(requestId);
  if (!existing) {
    console.log('Request not found for status update:', requestId);
    return;
  }
  existing.status = status;
  existing.updatedAt = new Date().toISOString();
  if (errorMessage) existing.errorMessage = errorMessage;
  requests.set(requestId, existing);
  writeRequests(requests);
  console.log('Updated request status:', requestId, status);
}

export function saveDrafts(requestId: string, draftsList: ContentDraft[]) {
  const drafts = readDrafts();
  drafts.set(requestId, draftsList);
  writeDrafts(drafts);
  console.log('Saved drafts for request:', requestId, draftsList.length);
}

export function getDrafts(requestId: string): ContentDraft[] {
  const drafts = readDrafts();
  return drafts.get(requestId) || [];
}

export function getAllDrafts(): ContentDraft[] {
  const drafts = readDrafts();
  return Array.from(drafts.values()).flat();
}

// Brand profile storage functions
function readBrands(): Map<string, BrandProfile> {
  try {
    if (fs.existsSync(BRANDS_FILE)) {
      const data = fs.readFileSync(BRANDS_FILE, 'utf8');
      const obj = JSON.parse(data);
      return new Map(Object.entries(obj));
    }
  } catch (error) {
    console.error('Error reading brands file:', error);
  }
  return new Map();
}

function writeBrands(brands: Map<string, BrandProfile>): void {
  try {
    const obj = Object.fromEntries(brands);
    fs.writeFileSync(BRANDS_FILE, JSON.stringify(obj, null, 2));
  } catch (error) {
    console.error('Error writing brands file:', error);
  }
}

export function saveBrandProfile(accountId: string, brandProfile: BrandProfile) {
  const brands = readBrands();
  brands.set(accountId, brandProfile);
  writeBrands(brands);
  console.log('Saved brand profile for account:', accountId);
}

export function getBrandProfile(accountId: string): BrandProfile | null {
  const brands = readBrands();
  return brands.get(accountId) || null;
}
