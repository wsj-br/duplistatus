import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getConfigNotifications, setConfigNotifications } from '@/lib/db-utils';

export const POST = withCSRF(async (request: NextRequest) => {
  try {
    
    const body = await request.json();
    const { templates } = body;
    if (!templates) {
      return NextResponse.json({ error: 'templates are required' }, { status: 400 });
    }
    // Get current config
    const config = getConfigNotifications();
    // Update only templates
    config.templates = templates;
    setConfigNotifications(config);
    return NextResponse.json({ message: 'Notification templates updated successfully' });
  } catch (error) {
    console.error('Failed to update notification templates:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification templates' }, { status: 500 });
  }
});