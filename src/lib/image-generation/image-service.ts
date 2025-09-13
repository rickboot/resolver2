import {
  ImageGenerationProvider,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationConfig,
} from "./types";
import { OpenAIImageProvider } from "./providers/openai-provider";
import { BedrockImageProvider } from "./providers/bedrock-provider";
import { AzureImageProvider } from "./providers/azure-provider";

export class ImageGenerationService {
  private providers: Map<string, ImageGenerationProvider> = new Map();
  private config: ImageGenerationConfig;

  constructor(config: ImageGenerationConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize enabled providers
    Object.entries(this.config.providers).forEach(([name, providerConfig]) => {
      if (!providerConfig.enabled) return;

      try {
        switch (name) {
          case "openai":
            this.providers.set(
              name,
              new OpenAIImageProvider(providerConfig.config as { apiKey: string })
            );
            break;
          case "bedrock":
            this.providers.set(
              name,
              new BedrockImageProvider(providerConfig.config as { region: string; model?: string })
            );
            break;
          case "azure":
            this.providers.set(
              name,
              new AzureImageProvider(providerConfig.config as { apiKey: string; endpoint: string; apiVersion?: string })
            );
            break;
          default:
            console.warn(`Unknown image provider: ${name}`);
        }
      } catch (error) {
        console.error(`Failed to initialize ${name} provider:`, error);
      }
    });
  }

  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const providersToTry = [
      this.config.defaultProvider,
      ...this.config.fallbackProviders,
    ].filter((name) => this.providers.has(name));

    if (providersToTry.length === 0) {
      throw new Error("No image generation providers available");
    }

    let lastError: Error | null = null;

    for (const providerName of providersToTry) {
      const provider = this.providers.get(providerName)!;

      try {
        // Check if provider is available
        const isAvailable = await provider.isAvailable();
        if (!isAvailable) {
          console.warn(
            `Provider ${providerName} is not available, trying next...`
          );
          continue;
        }

        console.log(`Generating image with ${providerName} provider`);
        const result = await provider.generateImage(request);

        // Log successful generation
        console.log(`Image generated successfully with ${providerName}:`, {
          provider: result.provider,
          model: result.model,
          imageCount: result.images.length,
          estimatedCost: result.cost,
        });

        return result;
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All image generation providers failed. Last error: ${
        lastError?.message || "Unknown error"
      }`
    );
  }

  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          available.push(name);
        }
      } catch (error) {
        console.error(`Error checking availability for ${name}:`, error);
      }
    }

    return available;
  }

  estimateCost(request: ImageGenerationRequest, providerName?: string): number {
    const targetProvider = providerName || this.config.defaultProvider;
    const provider = this.providers.get(targetProvider);

    if (!provider) {
      throw new Error(`Provider ${targetProvider} not found`);
    }

    return provider.estimateCost(request);
  }

  getProviderInfo(): Array<{
    name: string;
    available: boolean;
    estimatedCost: number;
  }> {
    const testRequest: ImageGenerationRequest = {
      prompt: "test",
      size: "1024x1024",
      n: 1,
    };

    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      available: false, // Would need async call to check
      estimatedCost: provider.estimateCost(testRequest),
    }));
  }

  updateConfig(newConfig: Partial<ImageGenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize providers if provider config changed
    if (newConfig.providers) {
      this.providers.clear();
      this.initializeProviders();
    }
  }
}
