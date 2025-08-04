import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templates } = body;
    if (!templates) {
      return NextResponse.json({ error: 'templates are required' }, { status: 400 });
    }
    // Get current config
    const configJson = getConfiguration('notifications');
    const config: NotificationConfig = configJson ? JSON.parse(configJson) : {};
    // Update only templates
    config.templates = templates;
    setConfiguration('notifications', JSON.stringify(config));
    return NextResponse.json({ message: 'Notification templates updated successfully' });
  } catch (error) {
    console.error('Failed to update notification templates:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification templates' }, { status: 500 });
  }
}