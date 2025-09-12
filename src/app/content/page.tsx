'use client';

import { useState, useEffect } from 'react';
import { ContentRequest, ContentDraft } from '@/lib/types';

interface RequestWithDrafts extends ContentRequest {
  drafts: ContentDraft[];
}

export default function ContentPage() {
  const [requests, setRequests] = useState<RequestWithDrafts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch all requests
      const requestsResponse = await fetch('/api/content-requests');
      const requestsData = await requestsResponse.json();
      
      // Fetch drafts for each request
      const requestsWithDrafts = await Promise.all(
        requestsData.requests.map(async (request: ContentRequest) => {
          const draftsResponse = await fetch(`/api/drafts?requestId=${request.id}`);
          const draftsData = await draftsResponse.json();
          return {
            ...request,
            drafts: draftsData.drafts || []
          };
        })
      );

      setRequests(requestsWithDrafts);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👥';
      case 'tiktok': return '🎵';
      case 'youtube_shorts': return '📹';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generated Content</h1>
          <p className="mt-2 text-gray-600">View and manage your AI-generated social media content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Content Requests</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedRequest === request.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedRequest(request.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getPlatformIcon(request.brief.socialPlatform)} {request.brief.socialPlatform}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.brief.goal}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      <span>{request.drafts.length} drafts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <ContentDisplay request={requests.find(r => r.id === selectedRequest)!} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Content Request</h3>
                <p className="text-gray-600">Choose a request from the list to view generated content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentDisplay({ request }: { request: RequestWithDrafts }) {
  const [selectedDraft, setSelectedDraft] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getPlatformIcon(request.brief.socialPlatform)} {request.brief.socialPlatform} Content
            </h2>
            <p className="text-sm text-gray-600">{request.brief.goal}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      {request.status === 'completed' && request.drafts.length > 0 ? (
        <div>
          {/* Draft Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {request.drafts.map((draft, index) => (
                <button
                  key={index}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedDraft === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDraft(index)}
                >
                  Draft {index + 1}
                </button>
              ))}
            </nav>
          </div>

          {/* Draft Content */}
          <div className="p-6">
            {request.drafts[selectedDraft] && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Caption</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {request.drafts[selectedDraft].caption}
                    </p>
                  </div>
                </div>

                {request.drafts[selectedDraft].imagePrompt && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Image Prompt</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800">
                        {request.drafts[selectedDraft].imagePrompt}
                      </p>
                    </div>
                  </div>
                )}

                {request.drafts[selectedDraft].hashtags && request.drafts[selectedDraft].hashtags!.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {request.drafts[selectedDraft].hashtags!.map((hashtag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : request.status === 'processing' ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating content...</p>
        </div>
      ) : request.status === 'failed' ? (
        <div className="p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
          <p className="text-gray-600">{request.errorMessage || 'An error occurred while generating content'}</p>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">⏳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Queued for Processing</h3>
          <p className="text-gray-600">Your content request is waiting to be processed</p>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'instagram': return '📷';
    case 'twitter': return '🐦';
    case 'linkedin': return '💼';
    case 'facebook': return '👥';
    case 'tiktok': return '🎵';
    case 'youtube_shorts': return '📹';
    default: return '📱';
  }
}
