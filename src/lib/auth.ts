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

export const passwordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional but accepted
};

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

  // Prevent using the default password
  if (password === defaultAuthConfig.defaultPassword) {
    errors.push('Cannot use the default password. Please choose a different password');
  }

  if (!password || password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }

  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
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
 * @param length - Length of the password to generate (default: 12)
 * @returns A random password that meets policy requirements
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure we have at least one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Fill the rest with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
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

