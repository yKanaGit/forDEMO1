import { NextResponse } from 'next/server';
import { getModelsConfig } from '@/lib/models';
import type { ModelsResponse } from '@/types/chat';

export async function GET() {
  try {
    const models = getModelsConfig();
    
    const response: ModelsResponse = {
      models: models.map(model => ({
        id: model.id,
        label: model.label
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get models:', error);
    return NextResponse.json(
      { error: 'Failed to get models configuration' },
      { status: 500 }
    );
  }
}