'use client';

import { useState } from 'react';

export default function DevToolsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedBrandType, setSelectedBrandType] = useState('default');

  const seedBrand = async (type: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/seed-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to seed brand' });
    } finally {
      setLoading(false);
    }
  };

  const createTestRequest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/content-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: 'dev-account-123',
          brief: {
            goal: 'Promote our new AI automation service to attract tech-savvy business owners',
            theme: 'Digital transformation and efficiency',
            callToAction: 'Schedule a free consultation',
            constraints: ['Keep it professional but approachable', 'Highlight ROI benefits'],
            socialPlatform: 'linkedin'
          }
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create test request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Development Tools</h1>
          <p className="mt-2 text-gray-600">Tools for testing and development</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Seeding */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seed Mock Brand</h2>
            <p className="text-gray-600 mb-4">Create a mock brand profile for testing</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Type
                </label>
                <select
                  value={selectedBrandType}
                  onChange={(e) => setSelectedBrandType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">TechFlow Solutions (Software)</option>
                  <option value="restaurant">Bella Vista Bistro (Restaurant)</option>
                  <option value="fitness">Peak Performance Gym (Fitness)</option>
                </select>
              </div>
              
              <button
                onClick={() => seedBrand(selectedBrandType)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Mock Brand'}
              </button>
            </div>
          </div>

          {/* Test Content Request */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Test Request</h2>
            <p className="text-gray-600 mb-4">Generate a sample content request for testing</p>
            
            <button
              onClick={createTestRequest}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Test Content Request'}
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a
                href="/content"
                className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                📱 View Generated Content
              </a>
              <a
                href="/dashboard"
                className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                📊 Dashboard
              </a>
              <a
                href="/onboarding"
                className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                🚀 Onboarding Flow
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Next.js Server:</span>
                <span className="text-green-600">✅ Running</span>
              </div>
              <div className="flex justify-between">
                <span>Background Worker:</span>
                <span className="text-yellow-600">⚠️ Check terminal</span>
              </div>
              <div className="flex justify-between">
                <span>File Storage:</span>
                <span className="text-green-600">✅ Active</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Make sure to run <code className="bg-gray-100 px-1 rounded">node worker.js</code> in a separate terminal
            </p>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Result</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
