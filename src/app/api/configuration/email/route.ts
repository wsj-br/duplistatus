import { NextResponse } from 'next/server';
import { getEmailConfigFromEnv, isEmailConfigured } from '@/lib/notifications';

export async function GET() {
  try {
    const isConfigured = isEmailConfigured();
    const config = getEmailConfigFromEnv();
    
    if (!isConfigured || !config) {
      return NextResponse.json({
        configured: false,
        config: null,
        message: 'Email is not configured. Please set the required environment variables.'
      });
    }

    // Return configuration without sensitive data (password)
    const safeConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      mailto: config.mailto,
      enabled: config.enabled,
      fromName: config.fromName,
      fromEmail: config.fromEmail
    };

    return NextResponse.json({
      configured: true,
      config: safeConfig,
      message: 'Email is configured and ready to use.'
    });
  } catch (error) {
    console.error('Failed to get email configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: 'Failed to get email configuration',
        configured: false,
        config: null
      },
      { status: 500 }
    );
  }
}
