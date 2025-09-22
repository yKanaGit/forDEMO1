'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import ModelSelector from './model-selector';
import ChatMessageComponent from './chat-message';
import ChatInput from './chat-input';
import type { ChatMessage, ChatRequest, ChatResponse } from '@/types/chat';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedModel) {
      showToast('Please select a model first', 'error');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const request: ChatRequest = {
        modelId: selectedModel,
        messages: newMessages
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: data.content 
      };
      setMessages([...newMessages, assistantMessage]);
      showToast('Response received successfully', 'success');
      
    } catch (error) {
      console.error('Chat request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    showToast('Chat cleared', 'info');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">OpenShift AI Chat</h1>
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel} 
          />
        </div>
        <button
          onClick={handleClearChat}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Welcome to OpenShift AI Chat</p>
              <p className="text-sm">Select a model and start chatting!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessageComponent key={index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={loading || !selectedModel} 
      />
    </div>
  );
}