import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSMTPConfig, setSMTPConfig } from '@/lib/db-utils';
import { getSessionIdFromRequest, validateSession, generateCSRFToken } from '@/lib/session-csrf';

export const PATCH = withCSRF(async (request: NextRequest) => {
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
      existingConfig = {
        host: config.host,
        port: config.port,
        secure: config.secure || false,
        username: config.username,
        password: '', // Will be set below
        mailto: config.mailto
      };
    }

    // Update only the password in the existing configuration
    const updatedConfig = {
      ...existingConfig,
      password: password
    };

    // Save the updated configuration
    setSMTPConfig(updatedConfig);

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
});

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
