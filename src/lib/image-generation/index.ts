export * from "./types";
export * from "./image-service";
export * from "./base-provider";
export { OpenAIImageProvider } from "./providers/openai-provider";
export { BedrockImageProvider } from "./providers/bedrock-provider";
export { AzureImageProvider } from "./providers/azure-provider";

import { ImageGenerationConfig } from "./types";
import { ImageGenerationService } from "./image-service";

// Factory function for easy setup
export function createImageService(config: {
  defaultProvider: "openai" | "bedrock" | "azure";
  openaiApiKey?: string;
  awsRegion?: string;
  azureApiKey?: string;
  azureEndpoint?: string;
}) {
  const imageConfig: ImageGenerationConfig = {
    defaultProvider: config.defaultProvider,
    fallbackProviders: [],
    providers: {},
  };

  // Configure OpenAI
  if (config.openaiApiKey) {
    imageConfig.providers["openai"] = {
      enabled: true,
      config: { apiKey: config.openaiApiKey },
    };
    if (config.defaultProvider !== "openai") {
      imageConfig.fallbackProviders.push("openai");
    }
  }

  // Configure Bedrock
  if (config.awsRegion) {
    imageConfig.providers["bedrock"] = {
      enabled: true,
      config: { region: config.awsRegion },
    };
    if (config.defaultProvider !== "bedrock") {
      imageConfig.fallbackProviders.push("bedrock");
    }
  }

  // Configure Azure
  if (config.azureApiKey && config.azureEndpoint) {
    imageConfig.providers["azure"] = {
      enabled: true,
      config: {
        apiKey: config.azureApiKey,
        endpoint: config.azureEndpoint,
      },
    };
    if (config.defaultProvider !== "azure") {
      imageConfig.fallbackProviders.push("azure");
    }
  }

  return new ImageGenerationService(imageConfig);
}
