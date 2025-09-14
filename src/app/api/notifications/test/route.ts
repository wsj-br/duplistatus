import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplate, NtfyConfig } from '@/lib/types';

async function sendNtfyNotificationDirect(config: NtfyConfig, message: string, title: string, priority: string, tags: string) {
  const { url, topic, accessToken } = config;
  
  if (!url || !topic) {
    throw new Error('NTFY URL and topic are required');
  }

  // Build URL with parameters to handle Unicode characters properly (same approach as main function)
  const urlObj = new URL(`${url.replace(/\/$/, '')}/${topic}`);
  
  // Add parameters to URL to avoid ByteString conversion issues with Unicode
  if (title && title.trim()) {
    urlObj.searchParams.set('title', title);
  }
  
  if (priority && priority.trim()) {
    urlObj.searchParams.set('priority', priority);
  }
  
  if (tags && tags.trim()) {
    urlObj.searchParams.set('tags', tags);
  }

  // Ensure the message is properly encoded as UTF-8 (same approach as main function)
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
  };

  // Add authorization header if access token is provided
  if (accessToken && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(urlObj.toString(), {
    method: 'POST',
    body: messageBytes,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send notification to NTFY: ${response.statusText} - ${errorBody}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, ntfyConfig, template }: { 
      type: 'simple' | 'template'; 
      ntfyConfig: NtfyConfig; 
      template?: NotificationTemplate 
    } = await request.json();

    if (!ntfyConfig) {
      return NextResponse.json({ error: 'NTFY configuration is required' }, { status: 400 });
    }

    if (!ntfyConfig.url || !ntfyConfig.topic) {
      return NextResponse.json({ error: 'NTFY URL and topic are required' }, { status: 400 });
    }

    if (type === 'template') {
      if (!template) {
        return NextResponse.json({ error: 'Template is required for template type' }, { status: 400 });
      }

      // Create sample data for testing
      const sampleData = {
        server_name: 'server_name',
        server_alias: 'server_alias',
        server_note: 'server_note',
        server_url: 'server_url',
        backup_name: 'backup_name',
        backup_date: 'backup_date',
        status: 'status',
        messages_count: 'messages_count',
        warnings_count: 'warnings_count',
        errors_count: 'errors_count',
        duration: 'duration',
        file_count: 'file_count',
        file_size: 'file_size',
        uploaded_size: 'uploaded_size',
        storage_size: 'storage_size',
        available_versions: 'available_versions',
      };

      // Process the template with sample data
      const processedTitle = template.title?.replace(/\{(\w+)\}/g, (match, key) => {
        return sampleData[key as keyof typeof sampleData] || match;
      }) || 'Test Notification';

      const processedMessage = template.message?.replace(/\{(\w+)\}/g, (match, key) => {
        return sampleData[key as keyof typeof sampleData] || match;
      }) || 'Test message';

      // Send the test notification
      await sendNtfyNotificationDirect(
        ntfyConfig,
        processedMessage + '\n(test sent at ' + new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }) + ')',
        processedTitle,
        template.priority || 'default',
        template.tags || ''
      );

      return NextResponse.json({ success: true });
    } else {
      // Simple test notification
      await sendNtfyNotificationDirect(
        ntfyConfig, 
        'This is a test notification from duplistatus.\n(test sent at ' + new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }) + ')', 
        'Test Notification', 
        'default', 
        'test'
      );
      
      return NextResponse.json({ message: 'Test notification sent successfully' });
    }
  } catch (error) {
    console.error('Failed to send test notification:', error instanceof Error ? error.message : String(error));
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to send test notification: ${errorMessage}` }, { status: 500 });
  }
}