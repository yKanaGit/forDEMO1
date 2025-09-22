import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig } from '@/lib/models';
import { OpenShiftAIClient } from '@/lib/api-client';
import type { ChatRequest, ChatResponse } from '@/types/chat';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.modelId || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: modelId and messages are required' },
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(body.modelId);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model ${body.modelId} not found` },
        { status: 404 }
      );
    }

    console.log(`Processing chat request for model: ${body.modelId}, messages: ${body.messages.length}`);

    const client = new OpenShiftAIClient(modelConfig);
    const content = await client.sendChatRequest(body.messages);

    const response: ChatResponse = { content };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Determine appropriate error code
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        statusCode = 401;
        errorMessage = 'Authentication failed';
      } else if (error.message.includes('timeout') || error.message.includes('network')) {
        statusCode = 502;
        errorMessage = 'Service unavailable';
      } else {
        errorMessage = error.message;
      }
    }

    const response: ChatResponse = { 
      content: '', 
      error: errorMessage 
    };
    
    return NextResponse.json(response, { status: statusCode });
  }
}