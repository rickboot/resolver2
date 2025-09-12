'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandProfile } from '@/lib/types';

export default function BrandPage() {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrandProfile();
  }, []);

  const fetchBrandProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand-profile?accountId=demo_1');
      if (!response.ok) {
        if (response.status === 404) {
          setError('No brand profile found');
          return;
        }
        throw new Error('Failed to fetch brand profile');
      }
      const data = await response.json();
      setBrandProfile(data.brandProfile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch brand profile'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading brand profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-6xl mb-4'>⚠️</div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            {error === 'No brand profile found'
              ? 'No Brand Profile'
              : 'Error loading brand profile'}
          </h3>
          <p className='text-gray-600 mb-4'>
            {error === 'No brand profile found'
              ? 'You need to set up your brand profile first.'
              : error}
          </p>
          <Link
            href='/onboarding'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Set Up Brand Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!brandProfile) return null;

  const { brand } = brandProfile;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Brand Profile
          </h1>
          <p className='text-gray-600'>Your brand identity and guidelines</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Basic Info */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Basic Info
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Brand Name
                </label>
                <p className='mt-1 text-gray-900'>{brand.name}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Description
                </label>
                <p className='mt-1 text-gray-900'>{brand.oneLineDescription}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Tone
                </label>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {brand.tone.map((tone, index) => (
                    <span
                      key={index}
                      className='inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audience & Product */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Audience & Product
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Target Audience
                </label>
                <p className='mt-1 text-gray-900'>{brand.audienceSummary}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Hero Items
                </label>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {brand.heroItems?.map((item, index) => (
                    <span
                      key={index}
                      className='inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Value Proposition
                </label>
                <p className='mt-1 text-gray-900'>{brand.valueProp}</p>
              </div>
            </div>
          </div>

          {/* Writing Guidelines */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Writing Guidelines
            </h2>
            <div className='space-y-4'>
              {brand.wordsWeLove && brand.wordsWeLove.length > 0 && (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Words We Love
                  </label>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {brand.wordsWeLove.map((word, index) => (
                      <span
                        key={index}
                        className='inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {brand.wordsToAvoid && brand.wordsToAvoid.length > 0 && (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Words to Avoid
                  </label>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {brand.wordsToAvoid.map((word, index) => (
                      <span
                        key={index}
                        className='inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Identity */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Visual Identity
            </h2>
            <div className='space-y-4'>
              {brand.logoUrl && (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Logo
                  </label>
                  <div className='mt-1'>
                    <img
                      src={brand.logoUrl}
                      alt='Brand logo'
                      className='h-16 w-auto object-contain'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Primary Color
                </label>
                <div className='mt-1 flex items-center gap-3'>
                  <div
                    className='w-8 h-8 rounded border border-gray-300'
                    style={{ backgroundColor: brand.primaryColorHex }}
                  ></div>
                  <span className='text-sm text-gray-900 font-mono'>
                    {brand.primaryColorHex}
                  </span>
                </div>
              </div>
              {brand.secondaryColorHexes &&
                brand.secondaryColorHexes.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Secondary Colors
                    </label>
                    <div className='mt-1 flex items-center gap-2'>
                      {brand.secondaryColorHexes.map((color, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <div
                            className='w-6 h-6 rounded border border-gray-300'
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className='text-xs text-gray-600 font-mono'>
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {brand.fontName && (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Font
                  </label>
                  <p className='mt-1 text-gray-900'>{brand.fontName}</p>
                </div>
              )}
              {brand.imageStyleNote && (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Image Style
                  </label>
                  <p className='mt-1 text-gray-900'>{brand.imageStyleNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-8 flex justify-between'>
          <Link
            href='/dashboard'
            className='inline-flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Back to Dashboard
          </Link>
          <Link
            href='/onboarding'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Edit Brand Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
