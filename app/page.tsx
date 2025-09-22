'use client';

import ChatInterface from '@/components/chat-interface';
import { ToastProvider } from '@/components/ui/toast';

export default function Home() {
  return (
    <ToastProvider>
      <ChatInterface />
    </ToastProvider>
  );
}