import { NextRequest, NextResponse } from 'next/server';
import { sendNtfyNotification } from '@/lib/notifications';
import { NotificationTemplate, NtfyConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { template, ntfyConfig }: { template: NotificationTemplate; ntfyConfig: NtfyConfig } = await request.json();

    if (!template || !ntfyConfig) {
      return NextResponse.json(
        { error: 'Template and NTFY configuration are required' },
        { status: 400 }
      );
    }

    if (!ntfyConfig.url || !ntfyConfig.topic) {
      return NextResponse.json(
        { error: 'NTFY URL and topic are required' },
        { status: 400 }
      );
    }

    // Create sample data for testing
    const sampleData = {
      machine_name: 'machine_name',
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
    await sendNtfyNotification(
      ntfyConfig.url,
      ntfyConfig.topic,
      processedTitle,
      processedMessage,
      template.priority || 'default',
      template.tags || '',
      ntfyConfig.accessToken
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test template notification:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
} 