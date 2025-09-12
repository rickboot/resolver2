# Resolver2 - AI Content Generator

An AI-powered social media content generator for businesses. Create on-brand content across multiple platforms with intelligent brand consistency.

## Features

- 🎨 **Brand Identity Setup** - Define your brand voice, visual style, and messaging
- 📱 **Multi-Platform Support** - Instagram, Twitter, TikTok, Facebook, LinkedIn, YouTube Shorts
- 🤖 **AI-Powered Generation** - OpenAI GPT-4 creates tailored content
- ⚡ **Async Processing** - Queue system handles content generation in background
- 📊 **Dashboard** - Monitor and manage all content requests

## Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## How It Works

1. **Onboarding** - Set up your brand profile with identity, tone, and visual guidelines
2. **Create Requests** - Specify platform, goal, theme, and constraints for content
3. **AI Generation** - System generates 3 content variations with captions and image prompts
4. **Review & Use** - Access completed content from the dashboard

## Fallback Behavior

If no OpenAI API key is provided, the system automatically falls back to mock content generation for development and testing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# resolver2
