'use client';

import { useState } from 'react';
import { BrandIdentity } from '@/lib/types';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BrandIdentity>>({
    name: '',
    oneLineDescription: '',
    tone: [],
    audienceSummary: '',
    heroItems: [],
    valueProp: '',
    wordsWeLove: [],
    wordsToAvoid: [],
    logoUrl: '',
    primaryColorHex: '#000000',
    secondaryColorHexes: [],
    fontName: '',
    exampleImageUrls: [],
    imageStyleNote: '',
  });

  const [toneInput, setToneInput] = useState('');
  const [heroItemsInput, setHeroItemsInput] = useState('');

  // Debug logging
  console.log('Current step:', step);
  console.log('Form data:', formData);

  const handleInputChange = (field: keyof BrandIdentity, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    console.log('handleSubmit called, current step:', step);
    
    // Only submit if we're on step 3
    if (step !== 3) {
      console.log('Not on step 3, returning');
      return;
    }

    // Validate required fields before submission
    const requiredFields = {
      name: 'Brand Name',
      oneLineDescription: 'One-line Description',
      tone: 'Tone',
      audienceSummary: 'Target Audience',
      valueProp: 'Value Proposition',
      primaryColorHex: 'Primary Color'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      const fieldValue = formData[field as keyof BrandIdentity];
      if (!fieldValue || 
          (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      console.log('Submitting brand profile:', formData);
      const response = await fetch('/api/brand-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: 'demo_1', // TODO: Get from auth context
          brand: formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save brand profile');
      }

      const result = await response.json();
      console.log('Brand profile saved:', result);
      alert('Brand profile saved successfully!');

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving brand profile:', error);
      alert(
        `Failed to save brand profile: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-sm p-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Set Up Your Brand
          </h1>
          <p className='text-gray-600 mb-8'>
            Tell us about your brand so we can create on-brand content for you.
          </p>

          <form onSubmit={handleSubmit} className='space-y-8' noValidate>
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className='space-y-6'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Basic Info
                </h2>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Brand Name *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., Acme Dental'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    One-line Description *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.oneLineDescription || ''}
                    onChange={(e) =>
                      handleInputChange('oneLineDescription', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., Modern dental care for busy professionals'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Tone (up to 3 words) *
                  </label>
                  <input
                    type='text'
                    required
                    value={toneInput}
                    onChange={(e) => {
                      setToneInput(e.target.value);
                      const items = e.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      setFormData((prev) => ({ ...prev, tone: items }));
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., professional, friendly, trustworthy'
                  />
                </div>
              </div>
            )}

            {/* Step 2: Audience & Product */}
            {step === 2 && (
              <div className='space-y-6'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Audience & Product
                </h2>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Target Audience (1-2 sentences) *
                  </label>
                  <textarea
                    required
                    value={formData.audienceSummary || ''}
                    onChange={(e) =>
                      handleInputChange('audienceSummary', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    rows={3}
                    placeholder='e.g., Busy professionals aged 25-45 who value convenience and quality care'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Hero Items/Services (1-3 items)
                  </label>
                  <input
                    type='text'
                    value={heroItemsInput}
                    onChange={(e) => {
                      setHeroItemsInput(e.target.value);
                      const items = e.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      setFormData((prev) => ({ ...prev, heroItems: items }));
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., teeth whitening, Invisalign, emergency care'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Value Proposition *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.valueProp || ''}
                    onChange={(e) =>
                      handleInputChange('valueProp', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., Pain-free dentistry with same-day appointments'
                  />
                </div>
              </div>
            )}

            {/* Step 3: Visual Identity */}
            {step === 3 && (
              <div className='space-y-6'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Visual Identity
                </h2>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Logo URL
                  </label>
                  <input
                    type='url'
                    value={formData.logoUrl || ''}
                    onChange={(e) =>
                      handleInputChange('logoUrl', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='https://example.com/logo.png'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Primary Color *
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='color'
                      value={formData.primaryColorHex || '#000000'}
                      onChange={(e) =>
                        handleInputChange('primaryColorHex', e.target.value)
                      }
                      className='w-12 h-10 border border-gray-300 rounded'
                    />
                    <input
                      type='text'
                      required
                      value={formData.primaryColorHex || ''}
                      onChange={(e) =>
                        handleInputChange('primaryColorHex', e.target.value)
                      }
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                      placeholder='#0A84FF'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Image Style Note
                  </label>
                  <input
                    type='text'
                    value={formData.imageStyleNote || ''}
                    onChange={(e) =>
                      handleInputChange('imageStyleNote', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
                    placeholder='e.g., clean, medical, professional'
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className='flex justify-between pt-6 border-t'>
              <button
                type='button'
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>

              {step < 3 ? (
                <button
                  type='button'
                  onClick={() => {
                    console.log('Next button clicked, current step:', step);
                    // Validate current step before proceeding
                    if (step === 1) {
                      if (!formData.name || !formData.oneLineDescription || !formData.tone || formData.tone.length === 0) {
                        alert('Please fill in all required fields on this step.');
                        return;
                      }
                    }
                    if (step === 2) {
                      if (!formData.audienceSummary || !formData.valueProp) {
                        alert('Please fill in all required fields on this step.');
                        return;
                      }
                    }
                    console.log('Setting step to:', step + 1);
                    setStep(step + 1);
                  }}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                >
                  Next
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleSubmit}
                  className='px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
                >
                  Save Brand Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
