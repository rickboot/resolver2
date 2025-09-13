import { BaseImageProvider } from "../base-provider";
import { ImageGenerationRequest, ImageGenerationResponse } from "../types";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export class BedrockImageProvider extends BaseImageProvider {
  name = "bedrock";
  private client: BedrockRuntimeClient;

  constructor(config: { region: string; model?: string }) {
    super(config);
    this.client = new BedrockRuntimeClient({ region: config.region });
  }

  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    this.validateRequest(request);

    const modelId =
      (this.config.model as string) || "amazon.titan-image-generator-v1";

    try {
      if (modelId.includes("titan")) {
        return this.generateWithTitan(request);
      } else if (modelId.includes("stability")) {
        return this.generateWithStableDiffusion(request);
      } else {
        throw new Error(`Unsupported Bedrock model: ${modelId}`);
      }
    } catch (error) {
      return this.handleProviderError(error, "AWS Bedrock");
    }
  }

  private async generateWithTitan(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const body = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: request.prompt,
        negativeText: "low quality, blurry, distorted",
      },
      imageGenerationConfig: {
        numberOfImages: Math.min(request.n || 1, 5),
        height: this.getDimensions(request.size).height,
        width: this.getDimensions(request.size).width,
        cfgScale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
      },
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.titan-image-generator-v1",
      body: JSON.stringify(body),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      images: responseBody.images.map((img: string) => ({
        url: `data:image/png;base64,${img}`,
        size: request.size || "1024x1024",
      })),
      provider: this.name,
      model: "amazon.titan-image-generator-v1",
      cost: this.estimateCost(request),
    };
  }

  private async generateWithStableDiffusion(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const body = {
      text_prompts: [
        {
          text: request.prompt,
          weight: 1,
        },
        {
          text: "low quality, blurry, distorted",
          weight: -1,
        },
      ],
      cfg_scale: 7,
      steps: 30,
      seed: Math.floor(Math.random() * 1000000),
      width: this.getDimensions(request.size).width,
      height: this.getDimensions(request.size).height,
      samples: Math.min(request.n || 1, 10),
    };

    const command = new InvokeModelCommand({
      modelId: "stability.stable-diffusion-xl-v1",
      body: JSON.stringify(body),
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      images: responseBody.artifacts.map((artifact: { base64: string }) => ({
        url: `data:image/png;base64,${artifact.base64}`,
        size: request.size || "1024x1024",
      })),
      provider: this.name,
      model: "stability.stable-diffusion-xl-v1",
      cost: this.estimateCost(request),
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a minimal request to check if service is available
      const testBody = {
        taskType: "TEXT_IMAGE",
        textToImageParams: { text: "test" },
        imageGenerationConfig: {
          numberOfImages: 1,
          height: 512,
          width: 512,
        },
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.titan-image-generator-v1",
        body: JSON.stringify(testBody),
        contentType: "application/json",
        accept: "application/json",
      });

      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  estimateCost(request: ImageGenerationRequest): number {
    const modelId =
      (this.config.model as string) || "amazon.titan-image-generator-v1";
    const n = request.n || 1;

    if (modelId.includes("titan")) {
      // Titan pricing: ~$0.008 per image
      return 0.008 * n;
    } else if (modelId.includes("stability")) {
      // Stable Diffusion XL pricing: ~$0.018 per image
      return 0.018 * n;
    }

    return 0.01 * n; // Default estimate
  }

  private getDimensions(size?: string): { width: number; height: number } {
    switch (size) {
      case "256x256":
        return { width: 256, height: 256 };
      case "512x512":
        return { width: 512, height: 512 };
      case "1792x1024":
        return { width: 1792, height: 1024 };
      case "1024x1792":
        return { width: 1024, height: 1792 };
      default:
        return { width: 1024, height: 1024 };
    }
  }
}
