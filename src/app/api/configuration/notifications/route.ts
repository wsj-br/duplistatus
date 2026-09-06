import { NextResponse, NextRequest } from 'next/server';
import { getNotificationFrequencyConfig, setNotificationFrequencyConfig, getNtfyConfig, setNtfyConfig } from '@/lib/db-utils';
import { NotificationFrequencyConfig } from '@/lib/types';
import { generateDefaultNtfyTopic } from '@/lib/default-config';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const GET = withCSRF(async () => {
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
});

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
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
      
      // Log audit event
      if (authContext) {
        const ipAddress = getClientIpAddress(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        await AuditLogger.logConfigChange(
          'notification_frequency_updated',
          authContext.userId,
          authContext.username,
          'notification_frequency',
          { value },
          ipAddress,
          userAgent
        );
      }
      
      return NextResponse.json({ value });
    }
    
    // Handle NTFY configuration updates
    const { ntfy } = body;
    if (!ntfy) {
      return NextResponse.json({ error: 'ntfy config is required' }, { status: 400 });
    }
    
    // Get existing config to compare
    const existingNtfyConfig = getNtfyConfig();
    
    // Check if topic is empty and generate a random one if needed
    const updatedNtfy = {
      ...ntfy,
      topic: (!ntfy.topic || ntfy.topic.trim() === '') ? generateDefaultNtfyTopic() : ntfy.topic
    };
    
    // Track changed fields with old and new values
    const changedFields: Record<string, { old: any; new: any }> = {};
    
    // Compare old and new values
    if (!existingNtfyConfig || existingNtfyConfig.url !== updatedNtfy.url) {
      changedFields.url = {
        old: existingNtfyConfig?.url ?? null,
        new: updatedNtfy.url,
      };
    }
    if (!existingNtfyConfig || existingNtfyConfig.topic !== updatedNtfy.topic) {
      changedFields.topic = {
        old: existingNtfyConfig?.topic ?? null,
        new: updatedNtfy.topic,
      };
    }
    const oldHasAccessToken = existingNtfyConfig ? Boolean(existingNtfyConfig.accessToken && existingNtfyConfig.accessToken.trim() !== '') : false;
    const newHasAccessToken = Boolean(updatedNtfy.accessToken && updatedNtfy.accessToken.trim() !== '');
    if (!existingNtfyConfig || oldHasAccessToken !== newHasAccessToken) {
      changedFields.hasAccessToken = {
        old: oldHasAccessToken,
        new: newHasAccessToken,
      };
    }
    
    // Save ntfy directly under new key
    setNtfyConfig(updatedNtfy);
    
    // Log audit event only if there are actual changes
    if (authContext && Object.keys(changedFields).length > 0) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'ntfy_config_updated',
        authContext.userId,
        authContext.username,
        'ntfy_config',
        {
          changes: changedFields,
        },
        ipAddress,
        userAgent
      );
    }
    
    return NextResponse.json({ message: 'NTFY config updated successfully', ntfy: updatedNtfy });
  } catch (error) {
    console.error('Failed to update notification config:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification config' }, { status: 500 });
  }
}));