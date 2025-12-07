#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { setSMTPConfig, getSMTPConfig } from '../src/lib/db-utils';
import type { SMTPConfig, SMTPConnectionType } from '../src/lib/types';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file if it exists
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8666';

/**
 * Script to test SMTP configurations for all connection types
 * 
 * This script tests cross-compatibility of SMTP connection types:
 * - For each base configuration type (plain, starttls, ssl):
 *   - Reads environment variables for that type (e.g., PLAIN_*, STARTTLS_*, SSL_*)
 *   - Builds a base configuration from those variables
 *   - For each test connection type (plain, starttls, ssl):
 *     - Creates a modified config with ONLY the connectionType field changed
 *     - Sets the modified config and sends a test email via API
 *     - Records the result
 * 
 * This tests if a configuration meant for one connection type works with another.
 * Expected results:
 * - Plain config with plain connectionType: ✅ should work
 * - Plain config with starttls/ssl connectionType: ❌ should fail
 * - Starttls config with starttls connectionType: ✅ should work
 * - Starttls config with plain/ssl connectionType: ❌ should fail
 * - SSL config with ssl connectionType: ✅ should work
 * - SSL config with plain/starttls connectionType: ❌ should fail
 * 
 * Usage: pnpm test-smtp-matrix
 * 
 * Environment variables (prefix based on connectionType):
 * - {PREFIX}_SMTP_HOST: SMTP server host
 * - {PREFIX}_SMTP_PORT: SMTP server port
 * - {PREFIX}_SMTP_USERNAME: SMTP username (optional for plain, required for starttls/ssl if auth needed)
 * - {PREFIX}_SMTP_PASSWORD: SMTP password (optional for plain, required for starttls/ssl if auth needed)
 * - {PREFIX}_SMTP_MAILTO: Recipient email address
 * - {PREFIX}_SMTP_SENDER: Sender name
 * - {PREFIX}_SMTP_FROM: From address (required for plain connections)
 * 
 * Example:
 * PLAIN_SMTP_HOST="smtp.example.com"
 * PLAIN_SMTP_PORT=25
 * PLAIN_SMTP_MAILTO="test@example.com"
 * PLAIN_SMTP_SENDER="Test Sender"
 * PLAIN_SMTP_FROM="sender@example.com"
 * 
 * STARTTLS_SMTP_HOST="smtp.example.com"
 * STARTTLS_SMTP_PORT=587
 * STARTTLS_SMTP_USERNAME="user@example.com"
 * STARTTLS_SMTP_PASSWORD="password"
 * STARTTLS_SMTP_MAILTO="test@example.com"
 * STARTTLS_SMTP_SENDER="Test Sender"
 * 
 * SSL_SMTP_HOST="smtp.example.com"
 * SSL_SMTP_PORT=465
 * SSL_SMTP_USERNAME="user@example.com"
 * SSL_SMTP_PASSWORD="password"
 * SSL_SMTP_MAILTO="test@example.com"
 * SSL_SMTP_SENDER="Test Sender"
 */

type TestResult = {
  success: boolean;
  error?: string;
  timestamp: string;
};

type MatrixResult = {
  configType: SMTPConnectionType;
  testType: SMTPConnectionType;
  result: TestResult;
  configUsed: {
    host: string;
    port: number;
    connectionType: SMTPConnectionType;
    requireAuth: boolean;
    hasUsername: boolean;
    hasPassword: boolean;
    mailto: string;
    senderName: string | undefined;
    fromAddress?: string;
  };
};

const connectionTypes: SMTPConnectionType[] = ['plain', 'starttls', 'ssl'];

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
    // For starttls and ssl, username/password are optional but recommended
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

// Simple cookie storage for maintaining session across requests
let sessionCookie: string | null = null;

async function getCSRFToken(): Promise<string> {
  const headers: Record<string, string> = {};
  
  // Include existing session cookie if we have one
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  
  const response = await fetch(`${BASE_URL}/api/csrf`, {
    method: 'GET',
    headers,
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
  }
  
  // Extract and store session cookie from response
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    const sessionMatch = setCookieHeader.match(/sessionId=([^;]+)/);
    if (sessionMatch) {
      sessionCookie = `sessionId=${sessionMatch[1]}`;
    }
  }
  
  const data = await response.json();
  return data.token || data.csrfToken;
}

async function sendTestEmailViaAPI(configType: SMTPConnectionType, testType: SMTPConnectionType): Promise<TestResult> {
  try {
    // Get CSRF token (this will also establish/maintain session)
    const csrfToken = await getCSRFToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    };
    
    // Include session cookie if we have one
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    // Call the test email API
    const response = await fetch(`${BASE_URL}/api/notifications/test`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        type: 'email'
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: responseData.error || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

async function testConnectionType(configType: SMTPConnectionType): Promise<MatrixResult[]> {
  const results: MatrixResult[] = [];
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing configuration type: ${configType.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    // Build base SMTP configuration from environment variables for this configType
    console.log(`\n1. Building base SMTP configuration from ${configType.toUpperCase()}_* environment variables...`);
    const baseConfig = buildSMTPConfig(configType);
    
    console.log(`   Host: ${baseConfig.host}`);
    console.log(`   Port: ${baseConfig.port}`);
    console.log(`   Username: ${baseConfig.username ? '***' : '(not set)'}`);
    console.log(`   Password: ${baseConfig.password ? '***' : '(not set)'}`);
    console.log(`   Mailto: ${baseConfig.mailto}`);
    console.log(`   Sender Name: ${baseConfig.senderName}`);
    console.log(`   From Address: ${baseConfig.fromAddress || '(not set)'}`);
    console.log(`   Require Auth: ${baseConfig.requireAuth}`);
    
    // For each test type, modify ONLY the connectionType field and test
    for (const testType of connectionTypes) {
      console.log(`\n2. Testing with connectionType=${testType.toUpperCase()} (base config: ${configType.toUpperCase()})...`);
      
      // Create a modified config with only the connectionType changed
      const testConfig: SMTPConfig = {
        ...baseConfig,
        connectionType: testType
      };
      
      console.log(`   Setting config with connectionType=${testType.toUpperCase()}...`);
      console.log(`   Config being set:`, {
        host: testConfig.host,
        port: testConfig.port,
        connectionType: testConfig.connectionType,
        requireAuth: testConfig.requireAuth,
        username: testConfig.username ? '***' : '(not set)',
        hasPassword: !!testConfig.password,
        mailto: testConfig.mailto,
        senderName: testConfig.senderName,
        fromAddress: testConfig.fromAddress || '(not set)'
      });
      
      // Set the modified configuration in the database
      setSMTPConfig(testConfig);
      console.log(`   ✅ Configuration saved`);
      
      // Delay to ensure database write is committed and API can read fresh data
      // The API endpoint will clear its cache, but we need to ensure the DB write is committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the config was saved correctly by reading it back
      const savedConfig = getSMTPConfig();
      if (savedConfig) {
        console.log(`   Verified saved config:`, {
          host: savedConfig.host,
          port: savedConfig.port,
          connectionType: savedConfig.connectionType,
          requireAuth: savedConfig.requireAuth !== false,
          username: savedConfig.username ? '***' : '(not set)',
          hasPassword: !!savedConfig.password
        });
      } else {
        console.log(`   ⚠️  Warning: Could not read saved config from database`);
      }
      
      // Send test email via API
      console.log(`   Sending test email via API...`);
      const result = await sendTestEmailViaAPI(configType, testType);
      
      const matrixResult: MatrixResult = {
        configType,
        testType,
        result,
        configUsed: {
          host: testConfig.host,
          port: testConfig.port,
          connectionType: testConfig.connectionType,
          requireAuth: testConfig.requireAuth !== false,
          hasUsername: !!testConfig.username,
          hasPassword: !!testConfig.password,
          mailto: testConfig.mailto,
          senderName: testConfig.senderName,
          fromAddress: testConfig.fromAddress
        }
      };
      
      results.push(matrixResult);
      
      if (result.success) {
        console.log(`   ✅ Test email sent successfully`);
      } else {
        console.log(`   ❌ Test email failed: ${result.error}`);
      }
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error(`\n❌ Error testing ${configType}:`, error instanceof Error ? error.message : String(error));
    
    // Record error for all test types
    for (const testType of connectionTypes) {
      // Try to build config for error reporting
      let configUsed;
      try {
        const baseConfig = buildSMTPConfig(configType);
        const testConfig: SMTPConfig = {
          ...baseConfig,
          connectionType: testType
        };
        configUsed = {
          host: testConfig.host,
          port: testConfig.port,
          connectionType: testConfig.connectionType,
          requireAuth: testConfig.requireAuth !== false,
          hasUsername: !!testConfig.username,
          hasPassword: !!testConfig.password,
          mailto: testConfig.mailto,
          senderName: testConfig.senderName,
          fromAddress: testConfig.fromAddress
        };
      } catch {
        configUsed = {
          host: 'unknown',
          port: 0,
          connectionType: testType,
          requireAuth: false,
          hasUsername: false,
          hasPassword: false,
          mailto: 'unknown',
          senderName: 'unknown',
          fromAddress: undefined
        };
      }
      
      results.push({
        configType,
        testType,
        result: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        },
        configUsed
      });
    }
  }
  
  return results;
}

function printMatrixTable(allResults: MatrixResult[]): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST RESULTS MATRIX');
  console.log(`${'='.repeat(80)}`);
  console.log('\nRows = Base Config Type (environment variables prefix: PLAIN_*, STARTTLS_*, SSL_*)');
  console.log('Columns = Test Connection Type (connectionType field used when sending email)');
  console.log('\nNote: Each row uses the same base configuration from environment variables,');
  console.log('      but the connectionType field is changed for each column test.\n');
  
  // Print header
  const header = ['Config \\ Test', ...connectionTypes.map(t => t.toUpperCase().padEnd(10))].join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));
  
  // Print rows
  for (const configType of connectionTypes) {
    const rowResults = allResults.filter(r => r.configType === configType);
    const cells = [configType.toUpperCase().padEnd(12)];
    
    for (const testType of connectionTypes) {
      const result = rowResults.find(r => r.testType === testType);
      if (result) {
        const status = result.result.success ? '✅ PASS' : '❌ FAIL';
        cells.push(status.padEnd(10));
      } else {
        cells.push('N/A'.padEnd(10));
      }
    }
    
    console.log(cells.join(' | '));
  }
  
  console.log('\n');
}

function saveResultsToJSON(allResults: MatrixResult[], outputPath: string): void {
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allResults.length,
      passed: allResults.filter(r => r.result.success).length,
      failed: allResults.filter(r => !r.result.success).length
    },
    results: allResults.map(r => ({
      configType: r.configType,
      testType: r.testType,
      success: r.result.success,
      error: r.result.error || null,
      timestamp: r.result.timestamp,
      configUsed: r.configUsed
    }))
  };
  
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);
}

async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.status === 'healthy' || data.status === 'degraded';
  } catch (error) {
    return false;
  }
}

async function main() {
  try {
    console.log('SMTP Connection Type Matrix Test');
    console.log('================================\n');
    
    // Check if application is running
    console.log(`Checking if application is running at ${BASE_URL}...`);
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      console.error(`❌ Application is not running or health check failed at ${BASE_URL}`);
      console.error('   Please start the application before running this test.');
      process.exit(1);
    }
    console.log('✅ Application is running\n');
    
    const allResults: MatrixResult[] = [];
    
    // Test each connection type
    for (const connectionType of connectionTypes) {
      const results = await testConnectionType(connectionType);
      allResults.push(...results);
      
      // Small delay between connection types
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Print matrix table
    printMatrixTable(allResults);
    
    // Save results to JSON
    const outputPath = join(process.cwd(), 'smtp-test-results.json');
    saveResultsToJSON(allResults, outputPath);
    
    // Print summary
    const total = allResults.length;
    const passed = allResults.filter(r => r.result.success).length;
    const failed = total - passed;
    
    console.log(`${'='.repeat(80)}`);
    console.log('SUMMARY');
    console.log(`${'='.repeat(80)}`);
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
    console.log(`${'='.repeat(80)}\n`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error running test matrix:');
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error(`  ${String(error)}`);
    }
    process.exit(1);
  }
}

main();

