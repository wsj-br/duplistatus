import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSMTPConfig, setSMTPConfig, deleteSMTPConfig } from '@/lib/db-utils';
import type { SMTPConfig } from '@/lib/types';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const GET = withCSRF(async () => {
  try {
    const config = getSMTPConfig();
    
    if (!config) {
      return NextResponse.json({
        configured: false,
        config: null,
        message: 'Email is not configured. Please configure SMTP settings.'
      });
    }

    // Return configuration without password, only indicate if password is set
    const configWithoutPassword = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      mailto: config.mailto,
      hasPassword: config.password && config.password.trim() !== ''
    };

    return NextResponse.json({
      configured: true,
      config: configWithoutPassword,
      message: 'Email is configured and ready to use.'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to get email configuration:', errorMessage);
    
    // Check if this is a master key error
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      return NextResponse.json(
        { 
          error: 'The master key is no longer valid. All encrypted passwords and settings must be reconfigured.',
          masterKeyInvalid: true,
          configured: false,
          config: null
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get email configuration',
        configured: false,
        config: null
      },
      { status: 500 }
    );
  }
});

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const body = await request.json();
    
    // Get existing config to preserve password
    const existingConfig = getSMTPConfig();
    
    // Extract fields from request body
    const { host, port, secure, username, mailto } = body;
    
    // Validate required fields (excluding password)
    if (host === undefined || port === undefined || username === undefined || mailto === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: host, port, username, mailto' },
        { status: 400 }
      );
    }

    // Validate port is a number
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return NextResponse.json(
        { error: 'Port must be a valid number between 1 and 65535' },
        { status: 400 }
      );
    }

    // Create SMTP config object, preserving existing password
    const smtpConfig: SMTPConfig = {
      host: host.trim(),
      port: portNumber,
      secure: Boolean(secure),
      username: username.trim(),
      password: existingConfig?.password || '', // Preserve existing password or use empty string
      mailto: mailto.trim()
    };

    // Save configuration
    setSMTPConfig(smtpConfig);

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'email_config_updated',
        authContext.userId,
        authContext.username,
        'smtp_config',
        {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          username: smtpConfig.username,
          mailto: smtpConfig.mailto,
          hasPassword: Boolean(smtpConfig.password && smtpConfig.password.trim() !== ''),
        },
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration saved successfully'
    });
  } catch (error) {
    console.error('Failed to save SMTP configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to save SMTP configuration' },
      { status: 500 }
    );
  }
}));

export const DELETE = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    // Check if configuration exists
    const config = getSMTPConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'No SMTP configuration found to delete' },
        { status: 404 }
      );
    }

    // Delete configuration
    deleteSMTPConfig();

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'email_config_deleted',
        authContext.userId,
        authContext.username,
        'smtp_config',
        {},
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete SMTP configuration:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to delete SMTP configuration' },
      { status: 500 }
    );
  }
}));
