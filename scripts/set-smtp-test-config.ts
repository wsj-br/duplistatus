#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { setSMTPConfig } from '../src/lib/db-utils';
import type { SMTPConfig, SMTPConnectionType } from '../src/lib/types';

// Load environment variables from .env file if it exists
dotenv.config();

/**
 * Script to set SMTP test configuration from environment variables
 * 
 * Usage: pnpm set-smtp-test-config <connectionType>
 * 
 * connectionType: 'plain' | 'starttls' | 'ssl'
 * 
 * The script automatically loads environment variables from a .env file if it exists
 * in the project root. Environment variables can also be set directly in the shell.
 * 
 * Environment variables (prefix based on connectionType):
 * - {PREFIX}_SMTP_HOST: SMTP server host
 * - {PREFIX}_SMTP_PORT: SMTP server port
 * - {PREFIX}_SMTP_USERNAME: SMTP username (optional for plain, required for starttls/ssl)
 * - {PREFIX}_SMTP_PASSWORD: SMTP password (optional for plain, required for starttls/ssl)
 * - {PREFIX}_SMTP_MAILTO: Recipient email address
 * - {PREFIX}_SMTP_SENDER: Sender name
 * - {PREFIX}_SMTP_FROM: From address (required for plain connections)
 * 
 * Example for starttls:
 * STARTTLS_SMTP_HOST="smtp.ethereal.email"
 * STARTTLS_SMTP_PORT=587
 * STARTTLS_SMTP_USERNAME="user@example.com"
 * STARTTLS_SMTP_PASSWORD="password"
 * STARTTLS_SMTP_MAILTO="recipient@example.com"
 * STARTTLS_SMTP_SENDER="Test Sender"
 */

function getEnvVar(prefix: string, name: string): string | undefined {
  return process.env[`${prefix}_${name}`];
}

function getEnvVarRequired(prefix: string, name: string): string {
  const value = getEnvVar(prefix, name);
  if (!value) {
    throw new Error(`Required environment variable ${prefix}_${name} is not set`);
  }
  return value;
}

function getEnvVarNumber(prefix: string, name: string): number {
  const value = getEnvVarRequired(prefix, name);
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${prefix}_${name} must be a valid number, got: ${value}`);
  }
  return num;
}

function validateConnectionType(connectionType: string): connectionType is SMTPConnectionType {
  const validTypes: SMTPConnectionType[] = ['plain', 'starttls', 'ssl'];
  if (!validTypes.includes(connectionType as SMTPConnectionType)) {
    throw new Error(`Invalid connectionType: ${connectionType}. Must be one of: ${validTypes.join(', ')}`);
  }
  return true;
}

function buildSMTPConfig(connectionType: SMTPConnectionType): SMTPConfig {
  const prefix = connectionType.toUpperCase();
  
  // Required for all connection types
  const host = getEnvVarRequired(prefix, 'SMTP_HOST');
  const port = getEnvVarNumber(prefix, 'SMTP_PORT');
  const mailto = getEnvVarRequired(prefix, 'SMTP_MAILTO');
  const senderName = getEnvVarRequired(prefix, 'SMTP_SENDER');
  
  // Username and password handling
  let username = '';
  let password = '';
  let requireAuth = false;
  let fromAddress: string | undefined = undefined;
  
  if (connectionType === 'plain') {
    // For plain connections, username/password are optional
    // If not provided, requireAuth will be false
    const envUsername = getEnvVar(prefix, 'SMTP_USERNAME');
    const envPassword = getEnvVar(prefix, 'SMTP_PASSWORD');
    
    if (envUsername && envPassword) {
      username = envUsername;
      password = envPassword;
      requireAuth = true;
    }
    
    // For plain connections, FROM address is required
    fromAddress = getEnvVar(prefix, 'SMTP_FROM');
    if (!fromAddress || !fromAddress.trim()) {
      throw new Error(`Required environment variable ${prefix}_SMTP_FROM is not set. From address is required for plain SMTP connections.`);
    }
  } else {
    // For starttls and ssl, username/password are required if authentication is needed
    // Based on the user's requirement: "If the username and password is provided, the server requires authentication"
    const envUsername = getEnvVar(prefix, 'SMTP_USERNAME');
    const envPassword = getEnvVar(prefix, 'SMTP_PASSWORD');
    
    if (envUsername && envPassword) {
      username = envUsername;
      password = envPassword;
      requireAuth = true;
    }
    
    // For starttls and ssl, FROM address is optional (can use username as fallback)
    fromAddress = getEnvVar(prefix, 'SMTP_FROM');
  }
  
  return {
    host,
    port,
    connectionType,
    username,
    password,
    mailto,
    senderName,
    fromAddress: fromAddress?.trim() || undefined,
    requireAuth
  };
}

function main() {
  try {
    // Get connectionType from command line arguments
    const connectionTypeArg = process.argv[2];
    
    if (!connectionTypeArg) {
      console.error('Error: connectionType parameter is required');
      console.error('Usage: pnpm set-smtp-test-config <connectionType>');
      console.error('connectionType must be one of: plain, starttls, ssl');
      process.exit(1);
    }
    
    // Validate connectionType
    if (!validateConnectionType(connectionTypeArg)) {
      process.exit(1);
    }
    
    const connectionType = connectionTypeArg as SMTPConnectionType;
    
    console.log(`Setting SMTP configuration for connection type: ${connectionType}`);
    console.log(`Reading environment variables with prefix: ${connectionType.toUpperCase()}_`);
    
    // Build SMTP configuration from environment variables
    const config = buildSMTPConfig(connectionType);
    
    console.log('Configuration loaded:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Connection Type: ${config.connectionType}`);
    console.log(`  Username: ${config.username ? '***' : '(not set)'}`);
    console.log(`  Password: ${config.password ? '***' : '(not set)'}`);
    console.log(`  Mailto: ${config.mailto}`);
    console.log(`  Sender Name: ${config.senderName}`);
    console.log(`  From Address: ${config.fromAddress || '(not set)'}`);
    console.log(`  Require Auth: ${config.requireAuth}`);
    
    // Save to database
    setSMTPConfig(config);
    
    console.log('✅ SMTP configuration saved successfully!');
    
  } catch (error) {
    console.error('❌ Error setting SMTP configuration:');
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error(`  ${String(error)}`);
    }
    process.exit(1);
  }
}

main();

