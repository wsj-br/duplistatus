import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { dbOps } from './db';
import { getConfiguration, setConfiguration } from './db-utils';
import { getDataDir } from './paths';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits is optimal for GCM
const SALT_LENGTH = 32; // For key derivation 
const TAG_LENGTH = 16; // For GCM
const KEY_DERIVATION_ITERATIONS = 100000; // For key derivation

// Key file name
const KeyFileName = '.duplistatus.key';

// Configuration key for storing key fingerprint (used for reliable change detection)
const KEY_FINGERPRINT_CONFIG = 'master_key_fingerprint';

// Key file path - uses same path resolution as database (handles standalone mode)
const getKeyFilePath = (): string => {
  return path.join(getDataDir(), KeyFileName);
};

// Secure key reading with memory cleanup
function readEncryptionKey(): Buffer {
  const keyPath = getKeyFilePath();
  
  try {
    const keyData = fs.readFileSync(keyPath);
    
    // Validate key length (should be 32 bytes for AES-256)
    if (keyData.length !== 32) {
      throw new Error(`Invalid key length. Expected 32 bytes, got ${keyData.length}`);
    }
    
    return keyData;
  } catch (error) {
    throw new Error(`Failed to read encryption key: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get a deterministic fingerprint of the current key file.
 * Used for reliable key change detection (avoids false positives from decryption failures).
 */
function getKeyFingerprint(): string {
  const keyPath = getKeyFilePath();
  const keyData = fs.readFileSync(keyPath);
  try {
    return crypto.createHash('sha256').update(keyData).digest('hex');
  } finally {
    secureCleanup(keyData);
  }
}

/**
 * Store the key fingerprint in the database if not already set.
 * Called when we encrypt data to establish the fingerprint for future change detection.
 */
function storeKeyFingerprintIfMissing(): void {
  const existing = getConfiguration(KEY_FINGERPRINT_CONFIG);
  if (existing && existing.trim() !== '') {
    return; // Already have a fingerprint
  }
  try {
    const fingerprint = getKeyFingerprint();
    setConfiguration(KEY_FINGERPRINT_CONFIG, fingerprint);
  } catch (error) {
    console.error('Failed to store key fingerprint:', error instanceof Error ? error.message : String(error));
  }
}

// Secure memory cleanup
export function secureCleanup(buffer: Buffer): void {
  if (buffer && buffer.length > 0) {
    // Overwrite the buffer with random data
    crypto.randomFillSync(buffer);
    buffer.fill(0);
  }
}

// Derive key from master key and salt
function deriveKey(masterKey: Buffer, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, KEY_DERIVATION_ITERATIONS, 32, 'sha256');
}

// Encrypt data
export function encryptData(plaintext: string): string {
  let key: Buffer | null = null;
  
  try {
    // Read the encryption key
    key = readEncryptionKey();
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from master key and salt
    const derivedKey = deriveKey(key, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = salt.toString('hex') + ':' + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
    // Clean up sensitive data
    secureCleanup(salt);
    secureCleanup(iv);
    secureCleanup(derivedKey);
    
    // Store key fingerprint for reliable change detection (avoids false positives on restore)
    storeKeyFingerprintIfMissing();
    
    return result;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up the key from memory
    if (key) {
      secureCleanup(key);
    }
  }
}

/**
 * Check if an error indicates that the master key is invalid
 * @param error - The error to check
 * @returns true if the error indicates an invalid master key
 */
export function isInvalidMasterKeyError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  return errorMessage.includes('unsupported state') || 
         errorMessage.includes('unable to authenticate data') ||
         errorMessage.includes('bad decrypt') ||
         errorMessage.includes('wrong final block length') ||
         errorMessage.includes('authentication tag verification failed');
}

// Decrypt data
export function decryptData(encryptedData: string): string {
  let key: Buffer | null = null;
  
  try {
    // Read the encryption key
    key = readEncryptionKey();
    
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltHex, ivHex, tagHex, encryptedHex] = parts;
    
    // Validate lengths (hex strings are 2x the byte length)
    if (saltHex.length !== SALT_LENGTH * 2) throw new Error('Invalid salt length');
    if (ivHex.length !== IV_LENGTH * 2) throw new Error('Invalid IV length');
    if (tagHex.length !== TAG_LENGTH * 2) throw new Error('Invalid tag length');
    
    // Convert hex strings back to buffers
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    // Derive key from master key and salt
    const derivedKey = deriveKey(key, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    // Clean up sensitive data
    secureCleanup(salt);
    secureCleanup(iv);
    secureCleanup(tag);
    secureCleanup(derivedKey);
    
    return decrypted;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Check if this is a master key authentication failure
    if (isInvalidMasterKeyError(err)) {
      throw new Error('MASTER_KEY_INVALID: The master key is no longer valid. All encrypted passwords and settings must be reconfigured.');
    }
    
    throw new Error(`Decryption failed: ${err.message}`);
  } finally {
    // Clean up the key from memory
    if (key) {
      secureCleanup(key);
    }
  }
}

/**
 * Get the decrypted password for a server
 * @param serverId - The server ID
 * @returns The decrypted password, or null if not found
 * @throws Error with MASTER_KEY_INVALID prefix if master key is invalid
 */
export function getServerPassword(serverId: string): string | null {
  try {
    // Get the encrypted password from database
    const result = dbOps.getServerPassword.get(serverId) as { server_password: string } | undefined;
    
    if (!result || !result.server_password) {
      return null;
    }
    
    // If the password is empty, return null
    if (result.server_password.trim() === '') {
      return null;
    }
    
    // Decrypt the password
    return decryptData(result.server_password);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If this is a master key error, re-throw it to be handled by the caller
    if (errorMessage.includes('MASTER_KEY_INVALID')) {
      throw error;
    }
    
    console.error(`Failed to get server password for ${serverId}:`, errorMessage);
    return null;
  }
}

/**
 * Set the encrypted password for a server
 * @param serverId - The server ID
 * @param password - The plaintext password to encrypt and store
 * @returns true if successful, false otherwise
 */
export function setServerPassword(serverId: string, password: string): boolean {
  try {
    // Encrypt the password
    const encryptedPassword = (password && password.trim() !== '') ? encryptData(password) : '';
    
    // Update the database
    const result = dbOps.setServerPassword.run(encryptedPassword, serverId);
    
    return result.changes > 0;
  } catch (error) {
    console.error(`Failed to set server password for ${serverId}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Check if the key file has changed.
 * Uses key fingerprint comparison when available (reliable, no false positives on restore).
 * Falls back to decryption attempt for legacy databases without a stored fingerprint.
 * @returns true if the key file has changed, false otherwise
 */
export function hasKeyFileChanged(): boolean {
  try {
    const storedFingerprint = getConfiguration(KEY_FINGERPRINT_CONFIG);
    const currentFingerprint = getKeyFingerprint();

    // Primary check: fingerprint comparison (reliable, avoids false positives)
    if (storedFingerprint && storedFingerprint.trim() !== '') {
      return currentFingerprint !== storedFingerprint;
    }

    // Legacy fallback: no fingerprint stored, try decryption
    // (decryption failures can have false positives from data corruption, but we have no fingerprint)
    const allServers = dbOps.getAllServers.all() as Array<{ id: string }>;
    for (const server of allServers) {
      const result = dbOps.getServerPassword.get(server.id) as { server_password: string } | undefined;
      if (result && result.server_password && result.server_password.trim() !== '') {
        try {
          decryptData(result.server_password);
          // Decryption succeeded - store fingerprint for future checks
          setConfiguration(KEY_FINGERPRINT_CONFIG, currentFingerprint);
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('MASTER_KEY_INVALID') || isInvalidMasterKeyError(error instanceof Error ? error : new Error(errorMessage))) {
            return true;
          }
        }
      }
    }

    const smtpConfigJson = getConfiguration('smtp_config');
    if (smtpConfigJson) {
      try {
        const smtpConfig = JSON.parse(smtpConfigJson) as { password?: string; username?: string };
        const toCheck = [smtpConfig.password, smtpConfig.username].filter((v): v is string => !!v && v.trim() !== '');
        for (const encrypted of toCheck) {
          try {
            decryptData(encrypted);
            setConfiguration(KEY_FINGERPRINT_CONFIG, currentFingerprint);
            return false;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('MASTER_KEY_INVALID') || isInvalidMasterKeyError(error instanceof Error ? error : new Error(errorMessage))) {
              return true;
            }
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking if key file changed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Clear all encrypted passwords (server passwords and SMTP passwords)
 * This should be called when the master key changes.
 * Also updates the stored fingerprint to the current key so we don't repeatedly detect a change.
 */
export function clearAllPasswords(): void {
  try {
    // Update fingerprint to current key so future logins don't keep detecting a change
    try {
      setConfiguration(KEY_FINGERPRINT_CONFIG, getKeyFingerprint());
    } catch (error) {
      console.error('Failed to update key fingerprint after clear:', error instanceof Error ? error.message : String(error));
    }

    // Clear all server passwords
    const allServers = dbOps.getAllServers.all() as Array<{ id: string }>;
    for (const server of allServers) {
      dbOps.setServerPassword.run('', server.id);
    }
    
    // Clear SMTP password (but keep other SMTP config)
    const smtpConfigJson = getConfiguration('smtp_config');
    if (smtpConfigJson) {
      try {
        const smtpConfig = JSON.parse(smtpConfigJson) as {
          host?: string;
          port?: number;
          connectionType?: string;
          secure?: boolean;
          username?: string;
          password?: string;
          mailto?: string;
          senderName?: string;
          fromAddress?: string;
          requireAuth?: boolean;
        };
        
        // Clear password and username (they're encrypted and can't be decrypted with new key)
        smtpConfig.password = '';
        smtpConfig.username = '';
        
        setConfiguration('smtp_config', JSON.stringify(smtpConfig));
      } catch (error) {
        console.error('Failed to clear SMTP password:', error instanceof Error ? error.message : String(error));
        // If we can't parse the config, delete it entirely
        setConfiguration('smtp_config', '');
      }
    }
  } catch (error) {
    console.error('Failed to clear all passwords:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

