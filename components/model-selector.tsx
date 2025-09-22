'use client';

import { useState, useEffect } from 'react';
import type { ModelsResponse } from '@/types/chat';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data: ModelsResponse = await response.json();
          setModels(data.models);
          
          // Select first model if none selected
          if (!selectedModel && data.models.length > 0) {
            onModelChange(data.models[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, [selectedModel, onModelChange]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md w-48"></div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
        No models configured
      </div>
    );
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.label}
        </option>
      ))}
    </select>
  );
}