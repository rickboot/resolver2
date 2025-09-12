import { NextRequest } from 'next/server';
import { mockBrand, mockBrandVariations } from '@/lib/mock-brand';
import { saveBrandProfile } from '@/lib/file-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'default' } = body;

    let brandToSave;
    
    switch (type) {
      case 'restaurant':
        brandToSave = mockBrandVariations.restaurant;
        break;
      case 'fitness':
        brandToSave = mockBrandVariations.fitness;
        break;
      case 'default':
      default:
        brandToSave = mockBrand;
        break;
    }

    // Save the mock brand profile
    saveBrandProfile(brandToSave.accountId, brandToSave);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Mock ${type} brand profile created successfully`,
        brandProfile: brandToSave
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding brand:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed brand profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      availableTypes: ['default', 'restaurant', 'fitness'],
      description: 'POST to this endpoint with {"type": "default|restaurant|fitness"} to seed a mock brand'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
