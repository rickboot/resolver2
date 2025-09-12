import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-4xl mx-auto px-4 py-16'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>
            AI Content Generator
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            Create on-brand social media content for your business. Perfect for
            dentists, merchants, and any professional service.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/onboarding'
              className='inline-flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors'
            >
              Get Started
            </Link>
            <Link
              href='/dashboard'
              className='inline-flex items-center px-8 py-3 bg-white text-blue-600 text-lg font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors'
            >
              View Dashboard
            </Link>
            <Link
              href='/content'
              className='inline-flex items-center px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors'
            >
              View Content
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'>
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='text-3xl mb-4'>🎨</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Brand Identity
              </h3>
              <p className='text-gray-600'>
                Set up your brand voice, visual style, and messaging guidelines
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='text-3xl mb-4'>📱</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Social Platforms
              </h3>
              <p className='text-gray-600'>
                Generate content for Instagram, Twitter, TikTok, and more
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='text-3xl mb-4'>⚡</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                AI-Powered
              </h3>
              <p className='text-gray-600'>
                Advanced AI creates on-brand content tailored to your audience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
