import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { NotificationConfig } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ntfy } = body;
    if (!ntfy) {
      return NextResponse.json({ error: 'ntfy config is required' }, { status: 400 });
    }
    // Get current config
    const configJson = getConfiguration('notifications');
    const config: NotificationConfig = configJson ? JSON.parse(configJson) : {};
    // Update only ntfy
    config.ntfy = ntfy;
    setConfiguration('notifications', JSON.stringify(config));
    return NextResponse.json({ message: 'Notification config updated successfully' });
  } catch (error) {
    console.error('Failed to update notification config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification config' }, { status: 500 });
  }
}