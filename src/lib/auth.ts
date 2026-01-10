import bcrypt from 'bcrypt';
import { defaultAuthConfig } from './default-config';

// Password configuration
const BCRYPT_ROUNDS = 12;

// Password policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * Get password enforcement setting from environment variable
 * @returns true if password complexity should be enforced, false otherwise
 */
function getPasswordEnforce(): boolean {
  const envValue = process.env.PWD_ENFORCE;
  if (!envValue) {
    return true; // Default: enforce all rules
  }
  // Case-insensitive check for 'false'
  return envValue.toLowerCase() !== 'false';
}

/**
 * Get minimum password length from environment variable
 * @returns Minimum password length (default: 8)
 */
function getPasswordMinLength(): number {
  const envValue = process.env.PWD_MIN_LEN;
  if (!envValue) {
    return 8; // Default: 8 characters
  }
  const parsed = parseInt(envValue, 10);
  if (isNaN(parsed) || parsed < 1) {
    return 8; // Fallback to default if invalid
  }
  return parsed;
}

/**
 * Get password policy based on environment variables
 * @returns Password policy configuration
 */
export function getPasswordPolicy(): PasswordPolicy {
  const enforce = getPasswordEnforce();
  return {
    minLength: getPasswordMinLength(),
    requireUppercase: enforce,
    requireLowercase: enforce,
    requireNumbers: enforce,
    requireSpecialChars: false, // Optional but accepted
  };
}

// Legacy export for backwards compatibility (deprecated, use getPasswordPolicy() instead)
export const passwordPolicy: PasswordPolicy = getPasswordPolicy();

// Password validation result
export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  errors?: string[];
}

/**
 * Validate password against policy requirements
 * @param password - The password to validate
 * @returns Validation result with any error messages
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const policy = getPasswordPolicy();

  // Prevent using the default password (always enforced for security)
  if (password === defaultAuthConfig.defaultPassword) {
    errors.push('Cannot use the default password. Please choose a different password');
  }

  // Always enforce minimum length
  if (!password || password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  // Only enforce complexity rules if PWD_ENFORCE is true (default)
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors[0], // Primary error for simple display
      errors, // All errors for detailed display
    };
  }

  return { valid: true };
}

/**
 * Hash a password using bcrypt
 * @param password - The plaintext password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a hash
 * @param password - The plaintext password to verify
 * @param hash - The hash to verify against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a random secure password
 * Useful for creating temporary passwords for new users
 * @param length - Length of the password to generate (default: uses policy minimum or 12, whichever is greater)
 * @returns A random password that meets policy requirements
 */
export function generateSecurePassword(length?: number): string {
  const policy = getPasswordPolicy();
  const minLength = policy.minLength;
  // Use provided length or default to max of policy minimum and 12
  const targetLength = length ?? Math.max(minLength, 12);
  // Ensure length is at least the policy minimum
  const finalLength = Math.max(targetLength, minLength);
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  
  // Only add required character types if enforcement is enabled
  if (policy.requireUppercase) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  if (policy.requireLowercase) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  if (policy.requireNumbers) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  // Fill the rest with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < finalLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize position of required characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if a password is strong (passes validation)
 * @param password - The password to check
 * @returns True if password is strong, false otherwise
 */
export function isStrongPassword(password: string): boolean {
  return validatePassword(password).valid;
}

