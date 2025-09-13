import { BaseImageProvider } from '../base-provider';
import { ImageGenerationRequest, ImageGenerationResponse } from '../types';
import OpenAI from 'openai';

export class OpenAIImageProvider extends BaseImageProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(config: { apiKey: string }) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.validateRequest(request);

    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: request.prompt,
        size: this.mapSize(request.size),
        quality: request.quality || 'standard',
        style: request.style || 'vivid',
        n: Math.min(request.n || 1, 1), // DALL-E 3 only supports n=1
      });

      return {
        images: (response.data || []).map(img => ({
          url: img.url!,
          revisedPrompt: img.revised_prompt,
          size: request.size || '1024x1024',
        })),
        provider: this.name,
        model: 'dall-e-3',
        cost: this.estimateCost(request),
      };
    } catch (error) {
      return this.handleProviderError(error, 'OpenAI DALL-E');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.models.retrieve('dall-e-3');
      return true;
    } catch {
      return false;
    }
  }

  estimateCost(request: ImageGenerationRequest): number {
    const size = request.size || '1024x1024';
    const quality = request.quality || 'standard';
    const n = request.n || 1;

    // DALL-E 3 pricing (as of 2024)
    const baseCost = size === '1024x1024' 
      ? (quality === 'hd' ? 0.080 : 0.040)
      : 0.040; // Other sizes

    return baseCost * n;
  }

  private mapSize(size?: string): '1024x1024' | '1792x1024' | '1024x1792' {
    switch (size) {
      case '1792x1024':
      case '1024x1792':
        return size;
      default:
        return '1024x1024';
    }
  }
}
