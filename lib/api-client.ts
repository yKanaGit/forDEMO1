import type { 
  KServeV2InferRequest, 
  KServeV2InferResponse, 
  OpenAICompatRequest, 
  OpenAICompatResponse,
  ModelConfig,
  ChatMessage 
} from '@/types/chat';

export class OpenShiftAIClient {
  private model: ModelConfig;

  constructor(model: ModelConfig) {
    this.model = model;
  }

  async sendChatRequest(messages: ChatMessage[]): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      [this.model.authHeader]: this.model.authToken,
    };

    let requestBody: any;
    let responseParser: (response: any) => string;

    if (this.model.mode === 'v2') {
      // KServe V2 format
      const prompt = this.formatMessagesAsPrompt(messages);
      requestBody = {
        inputs: [{
          name: 'text',
          shape: [1],
          datatype: 'BYTES',
          data: [prompt]
        }]
      } as KServeV2InferRequest;

      responseParser = (response: KServeV2InferResponse) => {
        if (response.outputs && response.outputs.length > 0 && response.outputs[0].data) {
          return response.outputs[0].data[0] || '';
        }
        throw new Error('Invalid V2 response format');
      };
    } else {
      // OpenAI compatible format
      requestBody = {
        model: this.model.id,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 1000,
        temperature: 0.7
      } as OpenAICompatRequest;

      responseParser = (response: OpenAICompatResponse) => {
        if (response.choices && response.choices.length > 0) {
          return response.choices[0].message.content || '';
        }
        throw new Error('Invalid OpenAI response format');
      };
    }

    try {
      const response = await fetch(this.model.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed (${response.status}): ${errorText}`);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseParser(responseData);
    } catch (error) {
      console.error('OpenShift AI request failed:', error);
      throw error;
    }
  }

  private formatMessagesAsPrompt(messages: ChatMessage[]): string {
    // Simple prompt formatting for V2 mode
    return messages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n') + '\nAssistant:';
  }
}