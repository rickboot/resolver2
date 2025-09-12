import { NextRequest } from 'next/server';
import { BrandProfile, nowIso } from '@/lib/types';
import { saveBrandProfile, getBrandProfile } from '@/lib/file-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, brand } = body;

    if (!accountId || !brand) {
      return new Response(
        JSON.stringify({
          error: 'accountId and brand are required',
        }),
        { status: 400 }
      );
    }

    // Validate required brand fields
    const requiredFields = [
      'name',
      'oneLineDescription',
      'tone',
      'audienceSummary',
      'valueProp',
      'primaryColorHex',
    ];
    const missingFields = requiredFields.filter((field) => !brand[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
        }),
        { status: 400 }
      );
    }

    const brandProfile: BrandProfile = {
      accountId,
      brand,
      updatedAt: nowIso(),
    };

    saveBrandProfile(accountId, brandProfile);

    return new Response(JSON.stringify({ brandProfile }), {
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return new Response(JSON.stringify({ error: 'accountId is required' }), {
        status: 400,
      });
    }

    const brandProfile = getBrandProfile(accountId);

    if (!brandProfile) {
      return new Response(
        JSON.stringify({ error: 'Brand profile not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ brandProfile }), {
      status: 200,
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
