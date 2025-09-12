'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ContentRequest } from '@/lib/types';

const statusColors = {
  queued: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const platformIcons = {
  instagram: '📷',
  twitter: '🐦',
  tiktok: '🎵',
  facebook: '📘',
  linkedin: '💼',
  youtube_shorts: '📺',
};

export default function DashboardPage() {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = requests.length;
    const completed = requests.filter((r) => r.status === 'completed').length;
    const processing = requests.filter((r) => r.status === 'processing').length;
    const queued = requests.filter((r) => r.status === 'queued').length;
    return { total, completed, processing, queued };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading requests...</p>
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
            Error loading requests
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={fetchRequests}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Content Dashboard
          </h1>
          <p className='mt-2 text-gray-600'>
            Manage your AI-generated content requests
          </p>
        </div>

        {/* Actions */}
        <div className='mb-8 flex gap-4'>
          <Link
            href='/onboarding'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Set Up Brand
          </Link>
          <Link
            href='/brand'
            className='inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700'
          >
            View Brand Profile
          </Link>
          <Link
            href='/create-request'
            className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
          >
            New Content Request
          </Link>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.total}
            </div>
            <div className='text-sm text-gray-600'>Total Requests</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.completed}
            </div>
            <div className='text-sm text-gray-600'>Completed</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.processing}
            </div>
            <div className='text-sm text-gray-600'>Processing</div>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.queued}
            </div>
            <div className='text-sm text-gray-600'>Queued</div>
          </div>
        </div>

        {/* Requests Table */}
        <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-medium text-gray-900'>
              Recent Requests
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Platform
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Goal
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {requests.map((request) => (
                  <tr key={request.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <span className='text-lg mr-2'>
                          {platformIcons[request.brief.socialPlatform]}
                        </span>
                        <span className='text-sm font-medium text-gray-900 capitalize'>
                          {request.brief.socialPlatform}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {request.brief.goal}
                      </div>
                      {request.brief.theme && (
                        <div className='text-sm text-gray-500'>
                          {request.brief.theme}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[request.status]
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {request.status === 'completed' ? (
                        <button className='text-blue-600 hover:text-blue-900'>
                          View Content
                        </button>
                      ) : (
                        <span className='text-gray-400'>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-6xl mb-4'>📝</div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No content requests yet
            </h3>
            <p className='text-gray-600 mb-4'>
              Create your first content request to get started
            </p>
            <Link
              href='/create-request'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Create Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
