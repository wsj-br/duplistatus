import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSMTPConfig, setSMTPConfig } from '@/lib/db-utils';
import { getSessionIdFromRequest, validateSession, generateCSRFToken } from '@/lib/session-csrf';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const { password, config } = await request.json();

    // Validate password type (allow empty string)
    if (typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password must be a string' },
        { status: 400 }
      );
    }

    // Get existing SMTP configuration
    let existingConfig = getSMTPConfig();
    
    // If no existing config, create a minimal one from the provided config
    if (!existingConfig) {
      if (!config || !config.host || !config.port || !config.username || !config.mailto) {
        return NextResponse.json(
          { error: 'SMTP configuration not found. Please save the basic SMTP settings first (host, port, username, mailto).' },
          { status: 400 }
        );
      }
      
      // Create minimal config with provided values
      const connectionType = config.connectionType || 'starttls';
      existingConfig = {
        host: config.host,
        port: config.port,
        connectionType,
        username: config.username || '',
        password: '', // Will be set below
        mailto: config.mailto,
        senderName: config.senderName,
        fromAddress: config.fromAddress,
        requireAuth: config.requireAuth !== false // Default to true for backward compatibility
      };
    } else if (config) {
      // If existing config exists but config is provided, update senderName, fromAddress, and requireAuth if provided
      existingConfig = {
        ...existingConfig,
        senderName: config.senderName !== undefined ? config.senderName : existingConfig.senderName,
        fromAddress: config.fromAddress !== undefined ? config.fromAddress : existingConfig.fromAddress,
        requireAuth: config.requireAuth !== undefined ? (config.requireAuth !== false) : existingConfig.requireAuth
      };
    }

    // Update only the password in the existing configuration
    const updatedConfig = {
      ...existingConfig,
      password: password
    };

    // Save the updated configuration
    setSMTPConfig(updatedConfig);

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'email_password_updated',
        authContext.userId,
        authContext.username,
        'smtp_password',
        {
          hasPassword: Boolean(password && password.trim() !== ''),
        },
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({
      message: 'Email password updated successfully'
    });
  } catch (error) {
    console.error('Error updating email password:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update email password' },
      { status: 500 }
    );
  }
}));

// GET endpoint to retrieve CSRF token
export const GET = withCSRF(async (request: NextRequest) => {
  try {
    // Get session ID and validate session
    const sessionId = getSessionIdFromRequest(request);
    if (!sessionId || !validateSession(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    // Generate CSRF token
    const csrfToken = generateCSRFToken(sessionId);
    
    return NextResponse.json({
      csrfToken
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
});
