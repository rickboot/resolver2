'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentBrief, SocialPlatform } from '@/lib/types';

export default function CreateRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContentBrief>({
    goal: '',
    theme: '',
    callToAction: '',
    constraints: [],
    socialPlatform: 'instagram',
  });

  const [constraintsInput, setConstraintsInput] = useState('');

  const handleInputChange = (field: keyof ContentBrief, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConstraintsChange = (value: string) => {
    setConstraintsInput(value);
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, constraints: items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/content-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: 'demo_1', // TODO: Get from auth context
          brief: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create content request');
      }

      const result = await response.json();
      console.log('Content request created:', result);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating content request:', error);
      alert('Failed to create content request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-sm p-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Create Content Request
          </h1>
          <p className='text-gray-600 mb-8'>
            Tell us what kind of content you want to generate.
          </p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>
                Social Platform *
              </label>
              <select
                required
                value={formData.socialPlatform}
                onChange={(e) =>
                  handleInputChange(
                    'socialPlatform',
                    e.target.value as SocialPlatform
                  )
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
              >
                <option value='instagram'>Instagram</option>
                <option value='twitter'>Twitter</option>
                <option value='tiktok'>TikTok</option>
                <option value='facebook'>Facebook</option>
                <option value='linkedin'>LinkedIn</option>
                <option value='youtube_shorts'>YouTube Shorts</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>
                Content Goal *
              </label>
              <textarea
                required
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                rows={3}
                placeholder='e.g., Drive traffic to our new teeth whitening service, announce our fall promotion, educate patients about oral health'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>
                Theme (optional)
              </label>
              <input
                type='text'
                value={formData.theme || ''}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                placeholder='e.g., fall collection, holiday special, new patient welcome'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>
                Call to Action (optional)
              </label>
              <input
                type='text'
                value={formData.callToAction || ''}
                onChange={(e) =>
                  handleInputChange('callToAction', e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                placeholder='e.g., Book now, Learn more, Shop today'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-900 mb-2'>
                Constraints (optional)
              </label>
              <input
                type='text'
                value={constraintsInput}
                onChange={(e) => handleConstraintsChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                placeholder='e.g., avoid discounts, keep it professional, no medical jargon'
              />
              <p className='text-sm text-gray-500 mt-1'>
                Separate multiple constraints with commas
              </p>
            </div>

            <div className='flex justify-between pt-6 border-t'>
              <button
                type='button'
                onClick={() => router.back()}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={isSubmitting}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
