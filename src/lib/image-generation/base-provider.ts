import { ImageGenerationProvider, ImageGenerationRequest, ImageGenerationResponse } from './types';

export abstract class BaseImageProvider implements ImageGenerationProvider {
  abstract name: string;
  protected config: Record<string, unknown>;

  constructor(config: Record<string, unknown> = {}) {
    this.config = config;
  }

  abstract generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  
  abstract isAvailable(): Promise<boolean>;
  
  abstract estimateCost(request: ImageGenerationRequest): number;

  protected validateRequest(request: ImageGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Image generation prompt is required');
    }
    
    if (request.prompt.length > 4000) {
      throw new Error('Image generation prompt is too long (max 4000 characters)');
    }

    const validSizes = ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'];
    if (request.size && !validSizes.includes(request.size)) {
      throw new Error(`Invalid image size. Must be one of: ${validSizes.join(', ')}`);
    }

    if (request.n && (request.n < 1 || request.n > 10)) {
      throw new Error('Number of images must be between 1 and 10');
    }
  }

  protected normalizeSize(size?: string): string {
    return size || '1024x1024';
  }

  protected async handleProviderError(error: unknown, providerName: string): Promise<never> {
    console.error(`${providerName} image generation error:`, error);
    
    const errorWithResponse = error as { response?: { status: number } };
    const errorWithMessage = error as { message?: string };
    
    if (errorWithResponse.response?.status === 429) {
      throw new Error(`${providerName} rate limit exceeded. Please try again later.`);
    }
    
    if (errorWithResponse.response?.status === 401) {
      throw new Error(`${providerName} authentication failed. Check API key.`);
    }
    
    if (errorWithResponse.response?.status && errorWithResponse.response.status >= 500) {
      throw new Error(`${providerName} service temporarily unavailable.`);
    }
    
    throw new Error(`${providerName} image generation failed: ${errorWithMessage.message || 'Unknown error'}`);
  }
}
