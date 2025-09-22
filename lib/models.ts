import type { ModelConfig } from '@/types/chat';

export function getModelsConfig(): ModelConfig[] {
  const modelsEnv = process.env.MODELS;
  
  if (!modelsEnv) {
    console.warn('MODELS environment variable not set, using empty array');
    return [];
  }

  try {
    const models = JSON.parse(modelsEnv) as ModelConfig[];
    return models;
  } catch (error) {
    console.error('Failed to parse MODELS environment variable:', error);
    return [];
  }
}

export function getModelConfig(modelId: string): ModelConfig | null {
  const models = getModelsConfig();
  return models.find(model => model.id === modelId) || null;
}