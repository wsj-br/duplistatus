import { NextResponse } from 'next/server';
import { getConfiguration, setConfiguration, getNotificationFrequencyConfig, setNotificationFrequencyConfig } from '@/lib/db-utils';
import { NotificationConfig, NotificationFrequencyConfig } from '@/lib/types';
import { generateDefaultNtfyTopic } from '@/lib/default-config';

export async function GET() {
  try {
    const value = getNotificationFrequencyConfig();
    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error fetching notification frequency config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle notification frequency updates
    if (body.hasOwnProperty('value')) {
      const value = body.value as NotificationFrequencyConfig;
      if (!['onetime', 'every_day', 'every_week', 'every_month'].includes(value)) {
        return NextResponse.json(
          { error: 'Invalid value' },
          { status: 400 }
        );
      }
      setNotificationFrequencyConfig(value);
      return NextResponse.json({ value });
    }
    
    // Handle NTFY configuration updates
    const { ntfy } = body;
    if (!ntfy) {
      return NextResponse.json({ error: 'ntfy config is required' }, { status: 400 });
    }
    
    // Check if topic is empty and generate a random one if needed
    const updatedNtfy = {
      ...ntfy,
      topic: (!ntfy.topic || ntfy.topic.trim() === '') ? generateDefaultNtfyTopic() : ntfy.topic
    };
    
    // Get current config
    const configJson = getConfiguration('notifications');
    const config: NotificationConfig = configJson ? JSON.parse(configJson) : {};
    // Update only ntfy
    config.ntfy = updatedNtfy;
    setConfiguration('notifications', JSON.stringify(config));
    return NextResponse.json({ message: 'Notification config updated successfully', ntfy: updatedNtfy });
  } catch (error) {
    console.error('Failed to update notification config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification config' }, { status: 500 });
  }
}