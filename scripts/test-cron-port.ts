#!/usr/bin/env tsx

import { checkAndUpdateCronPort, getCronConfig } from '../src/lib/db-utils';

/**
 * Test script to verify CRON_PORT checking functionality
 */
async function testCronPortChecker() {
  console.log('🧪 Testing CRON_PORT checker functionality...\n');

  // Test case 1: CRON_PORT is defined
  console.log('Test Case 1: CRON_PORT=9668');
  process.env.CRON_PORT = '9668';
  delete process.env.PORT;
  checkAndUpdateCronPort();
  let config = getCronConfig();
  console.log(`Result: Cron port is ${config.port} (expected: 9668)\n`);

  // Test case 2: CRON_PORT not defined, PORT is defined
  console.log('Test Case 2: PORT=8666 (should use 8667)');
  delete process.env.CRON_PORT;
  process.env.PORT = '8666';
  checkAndUpdateCronPort();
  config = getCronConfig();
  console.log(`Result: Cron port is ${config.port} (expected: 8667)\n`);

  // Test case 3: Neither CRON_PORT nor PORT defined (should use 9667)
  console.log('Test Case 3: No environment variables (should use 9667)');
  delete process.env.CRON_PORT;
  delete process.env.PORT;
  checkAndUpdateCronPort();
  config = getCronConfig();
  console.log(`Result: Cron port is ${config.port} (expected: 9667)\n`);

  // Test case 4: CRON_PORT takes precedence over PORT
  console.log('Test Case 4: CRON_PORT=9669, PORT=8666 (CRON_PORT should take precedence)');
  process.env.CRON_PORT = '9669';
  process.env.PORT = '8666';
  checkAndUpdateCronPort();
  config = getCronConfig();
  console.log(`Result: Cron port is ${config.port} (expected: 9669)\n`);

  console.log('✅ CRON_PORT checker tests completed!');
}

// Run the test
testCronPortChecker().catch(error => {
  console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 