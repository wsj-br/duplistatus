import { NextResponse } from 'next/server';
import { NtfyConfig } from '@/lib/types';

async function sendNtfyNotification(config: NtfyConfig, message: string, title: string, priority: string, tags: string) {
  const { url, topic } = config;
  
  if (!url || !topic) {
    throw new Error('NTFY URL and topic are required');
  }

  const response = await fetch(`${url.replace(/\/$/, '')}/${topic}`, {
    method: 'POST',
    body: message,
    headers: {
      'Title': title,
      'Priority': priority,
      'Tags': tags,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send notification to NTFY: ${response.statusText} - ${errorBody}`);
  }
}

export async function POST(request: Request) {
  try {
    const { ntfyConfig } = await request.json();
    
    if (!ntfyConfig) {
      return NextResponse.json({ error: 'NTFY configuration is required' }, { status: 400 });
    }

    await sendNtfyNotification(ntfyConfig, 'This is a test notification from duplistatus.', 'Test Notification', 'default', 'test');
    
    return NextResponse.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to send test notification: ${errorMessage}` }, { status: 500 });
  }
} 