export interface ImageGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images to generate
}

export interface ImageGenerationResponse {
  images: GeneratedImage[];
  provider: string;
  model: string;
  cost?: number;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  size: string;
}

export interface ImageGenerationProvider {
  name: string;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  isAvailable(): Promise<boolean>;
  estimateCost(request: ImageGenerationRequest): number;
}

export interface ImageGenerationConfig {
  defaultProvider: string;
  fallbackProviders: string[];
  providers: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}
