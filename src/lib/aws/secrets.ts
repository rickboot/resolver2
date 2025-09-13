import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const secretsCache = new Map<string, { value: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSecret(secretName: string): Promise<string> {
  // Check cache first
  const cached = secretsCache.get(secretName);
  if (cached && Date.now() < cached.expires) {
    return cached.value;
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    const response = await client.send(command);
    const secretValue = response.SecretString;
    
    if (!secretValue) {
      throw new Error(`Secret ${secretName} is empty`);
    }

    // Cache the secret
    secretsCache.set(secretName, {
      value: secretValue,
      expires: Date.now() + CACHE_TTL,
    });

    return secretValue;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
}

export async function getOpenAIKey(): Promise<string> {
  // Fallback to environment variable for local development
  if (process.env.NODE_ENV !== 'production' && process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  return await getSecret('resolver2/openai-api-key');
}
