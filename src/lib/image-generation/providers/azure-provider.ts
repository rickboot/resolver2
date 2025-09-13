import { BaseImageProvider } from '../base-provider';
import { ImageGenerationRequest, ImageGenerationResponse } from '../types';

export class AzureImageProvider extends BaseImageProvider {
  name = 'azure';
  private apiKey: string;
  private endpoint: string;
  private apiVersion: string;

  constructor(config: { apiKey: string; endpoint: string; apiVersion?: string }) {
    super(config);
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.apiVersion = config.apiVersion || '2024-02-01';
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.validateRequest(request);

    try {
      const response = await fetch(
        `${this.endpoint}/openai/deployments/dall-e-3/images/generations?api-version=${this.apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify({
            prompt: request.prompt,
            size: this.mapSize(request.size),
            quality: request.quality || 'standard',
            style: request.style || 'vivid',
            n: Math.min(request.n || 1, 1), // Azure DALL-E 3 only supports n=1
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        images: data.data.map((img: any) => ({
          url: img.url,
          revisedPrompt: img.revised_prompt,
          size: request.size || '1024x1024',
        })),
        provider: this.name,
        model: 'dall-e-3',
        cost: this.estimateCost(request),
      };
    } catch (error) {
      return this.handleProviderError(error, 'Azure OpenAI');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.endpoint}/openai/deployments?api-version=${this.apiVersion}`,
        {
          method: 'GET',
          headers: {
            'api-key': this.apiKey,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  estimateCost(request: ImageGenerationRequest): number {
    const size = request.size || '1024x1024';
    const quality = request.quality || 'standard';
    const n = request.n || 1;

    // Azure OpenAI pricing is similar to OpenAI
    const baseCost = size === '1024x1024' 
      ? (quality === 'hd' ? 0.080 : 0.040)
      : 0.040;

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
