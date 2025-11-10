import { validatePassword, hashPassword, verifyPassword, generateSecurePassword } from '../src/lib/auth';

async function testPasswords() {
  console.log('Testing password utilities...\n');
  
  // Test 1: Password validation
  console.log('1. Testing password validation:');
  const tests = [
    { password: 'short', valid: false, reason: 'Too short' },
    { password: 'lowercase1', valid: false, reason: 'No uppercase' },
    { password: 'UPPERCASE1', valid: false, reason: 'No lowercase' },
    { password: 'NoNumbers', valid: false, reason: 'No numbers' },
    { password: 'Duplistatus09', valid: true, reason: 'Valid' },
    { password: 'StrongP@ss1', valid: true, reason: 'Valid with special chars' },
  ];
  
  for (const test of tests) {
    const result = validatePassword(test.password);
    const status = result.valid === test.valid ? '✅' : '❌';
    console.log(`  ${status} "${test.password}": ${test.reason}`);
    if (!result.valid) {
      console.log(`     Error: ${result.error}`);
    }
  }
  
  // Test 2: Password hashing
  console.log('\n2. Testing password hashing:');
  const password = 'Duplistatus09';
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);
  console.log(`  ✅ Hash 1: ${hash1.substring(0, 20)}...`);
  console.log(`  ✅ Hash 2: ${hash2.substring(0, 20)}...`);
  console.log(`  ${hash1 !== hash2 ? '✅' : '❌'} Hashes are different (salt working)`);
  
  // Test 3: Password verification
  console.log('\n3. Testing password verification:');
  const correctVerify = await verifyPassword(password, hash1);
  const wrongVerify = await verifyPassword('WrongPassword1', hash1);
  console.log(`  ${correctVerify ? '✅' : '❌'} Correct password verified`);
  console.log(`  ${!wrongVerify ? '✅' : '❌'} Wrong password rejected`);
  
  // Test 4: Secure password generation
  console.log('\n4. Testing secure password generation:');
  const generated = generateSecurePassword(12);
  console.log(`  Generated: ${generated}`);
  const genResult = validatePassword(generated);
  console.log(`  ${genResult.valid ? '✅' : '❌'} Generated password meets policy`);
}

testPasswords().catch(console.error);