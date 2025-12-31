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
      connectionType: config.connectionType,
      username: config.username,
      mailto: config.mailto,
      senderName: config.senderName,
      fromAddress: config.fromAddress,
      requireAuth: config.requireAuth !== false, // Default to true for backward compatibility
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
    const { host, port, connectionType, secure, username, mailto, senderName, fromAddress, requireAuth, password } = body;
    
    // Validate required fields (excluding password)
    // If requireAuth is false, username is not required
    const needsAuth = requireAuth !== false; // Default to true for backward compatibility
    if (host === undefined || port === undefined || mailto === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: host, port, mailto' },
        { status: 400 }
      );
    }
    
    if (needsAuth && username === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: username (required when authentication is enabled)' },
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

    // Validate email formats (must contain '@')
    if (typeof mailto === 'string' && (!mailto.includes('@') || mailto.trim() === '')) {
      return NextResponse.json(
        { error: 'Recipient email must contain "@" symbol' },
        { status: 400 }
      );
    }

    if (fromAddress !== undefined && typeof fromAddress === 'string' && fromAddress.trim() !== '') {
      if (!fromAddress.includes('@')) {
        return NextResponse.json(
          { error: 'From address must contain "@" symbol' },
          { status: 400 }
        );
      }
    }

    // Determine connection type (fall back to legacy secure flag for backward compatibility)
    let finalConnectionType: 'plain' | 'starttls' | 'ssl';
    if (connectionType && ['plain', 'starttls', 'ssl'].includes(connectionType)) {
      finalConnectionType = connectionType as 'plain' | 'starttls' | 'ssl';
    } else if (typeof secure === 'boolean') {
      finalConnectionType = secure ? 'ssl' : 'starttls';
    } else if (typeof secure === 'string') {
      finalConnectionType = secure.toLowerCase() === 'true' ? 'ssl' : 'starttls';
    } else {
      finalConnectionType = 'starttls';
    }

    // Create SMTP config object
    // If password is explicitly provided (even if empty), use it; otherwise preserve existing
    // If username is explicitly provided (even if empty), use it
    const finalPassword = password !== undefined ? password : (existingConfig?.password || '');
    const finalUsername = username !== undefined 
      ? (needsAuth ? username.trim() : (username?.trim() || ''))
      : (existingConfig?.username || '');
    
    const smtpConfig: SMTPConfig = {
      host: host.trim(),
      port: portNumber,
      connectionType: finalConnectionType,
      username: finalUsername,
      password: finalPassword,
      mailto: mailto.trim(),
      senderName: senderName !== undefined ? (senderName.trim() || undefined) : undefined,
      fromAddress: fromAddress !== undefined ? (fromAddress.trim() || undefined) : undefined,
      requireAuth: needsAuth
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
          connectionType: smtpConfig.connectionType,
          username: smtpConfig.username,
          mailto: smtpConfig.mailto,
          senderName: smtpConfig.senderName,
          fromAddress: smtpConfig.fromAddress,
          requireAuth: smtpConfig.requireAuth,
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
