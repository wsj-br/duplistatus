import { NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { getSMTPConfig, setSMTPConfig, deleteSMTPConfig } from '@/lib/db-utils';
import type { SMTPConfig } from '@/lib/types';

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

export const POST = withCSRF(async (request: Request) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { host, port, secure, username, password, mailto } = body;
    
    if (!host || !port || !username || !password || !mailto) {
      return NextResponse.json(
        { error: 'Missing required fields: host, port, username, password, mailto' },
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

    // Create SMTP config object
    const smtpConfig: SMTPConfig = {
      host: host.trim(),
      port: portNumber,
      secure: Boolean(secure),
      username: username.trim(),
      password: password,
      mailto: mailto.trim()
    };

    // Save configuration
    setSMTPConfig(smtpConfig);

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
});

export const DELETE = withCSRF(async () => {
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
});
