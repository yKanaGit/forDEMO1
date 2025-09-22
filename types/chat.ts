export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  modelId: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  content: string;
  error?: string;
}

export interface ModelConfig {
  id: string;
  label: string;
  mode: 'v2' | 'openai';
  baseUrl: string;
  authHeader: string;
  authToken: string;
}

export interface ModelsResponse {
  models: Array<{ id: string; label: string }>;
}

export interface KServeV2InferRequest {
  inputs: Array<{
    name: string;
    shape: number[];
    datatype: string;
    data: string[];
  }>;
}

export interface KServeV2InferResponse {
  outputs: Array<{
    name: string;
    shape: number[];
    datatype: string;
    data: string[];
  }>;
}

export interface OpenAICompatRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAICompatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}