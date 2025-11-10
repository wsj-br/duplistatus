#!/usr/bin/env tsx
/**
 * Admin Recovery Tool
 * 
 * Allows recovery of admin accounts if locked out or password forgotten.
 * 
 * Usage:
 *   tsx scripts/admin-recovery.ts <username> <new-password>
 * 
 * Example:
 *   tsx scripts/admin-recovery.ts admin NewPassword123
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { validatePassword } from '../src/lib/auth';

const dbPath = path.join(process.cwd(), 'data', 'backups.db');

async function resetAdminPassword(username: string, newPassword: string) {
  // Validate inputs
  if (!username || !newPassword) {
    console.error('❌ Error: Missing required arguments');
    console.error('');
    console.error('Usage: tsx scripts/admin-recovery.ts <username> <new-password>');
    console.error('');
    console.error('Example:');
    console.error('  tsx scripts/admin-recovery.ts admin NewPassword123');
    process.exit(1);
  }

  // Validate password meets policy
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    console.error('❌ Error: Password does not meet requirements');
    console.error('');
    if (validation.errors) {
      validation.errors.forEach(err => console.error(`  - ${err}`));
    } else if (validation.error) {
      console.error(`  - ${validation.error}`);
    }
    console.error('');
    console.error('Password requirements:');
    console.error('  - Minimum 8 characters');
    console.error('  - At least one uppercase letter (A-Z)');
    console.error('  - At least one lowercase letter (a-z)');
    console.error('  - At least one number (0-9)');
    console.error('  - Special characters are optional');
    process.exit(1);
  }

  // Check if database exists
  if (!require('fs').existsSync(dbPath)) {
    console.error(`❌ Error: Database not found at ${dbPath}`);
    console.error('Make sure the application has been initialized.');
    process.exit(1);
  }

  // Open database
  let db: Database.Database;
  try {
    db = new Database(dbPath, { readonly: false });
  } catch (error) {
    console.error('❌ Error: Failed to open database');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    // Check if users table exists
    const tableCheck = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();

    if (!tableCheck) {
      console.error('❌ Error: Users table not found');
      console.error('The database may not have been migrated to version 4.0 yet.');
      db.close();
      process.exit(1);
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
      id: string;
      username: string;
      is_admin: number;
      locked_until: string | null;
      failed_login_attempts: number;
    } | undefined;

    if (!user) {
      console.error(`❌ Error: User '${username}' not found`);
      db.close();
      process.exit(1);
    }

    // Hash new password
    console.log('🔐 Hashing new password...');
    const hash = await bcrypt.hash(newPassword, 12);

    // Update user
    console.log(`📝 Resetting password for user '${username}'...`);
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, 
          must_change_password = 0,
          failed_login_attempts = 0,
          locked_until = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `).run(hash, username);

    // Log to audit log (if table exists)
    try {
      const auditCheck = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='audit_log'
      `).get();

      if (auditCheck) {
        db.prepare(`
          INSERT INTO audit_log (
            action, category, status, username, details, timestamp
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(
          'admin_password_reset_cli',
          'system',
          'success',
          'system',
          JSON.stringify({ 
            targetUser: username, 
            method: 'cli',
            isAdmin: user.is_admin === 1
          })
        );
      }
    } catch (auditError) {
      // Don't fail if audit logging fails
      console.warn('⚠️  Warning: Could not log to audit log:', auditError instanceof Error ? auditError.message : String(auditError));
    }

    console.log('');
    console.log('✅ Password reset successfully!');
    console.log('');
    console.log(`   User: ${username}`);
    console.log(`   Status: ${user.locked_until ? 'Unlocked' : 'Active'}`);
    console.log(`   Admin: ${user.is_admin === 1 ? 'Yes' : 'No'}`);
    console.log('');
    console.log('The user can now login with the new password.');
    console.log('');

  } catch (error) {
    console.error('❌ Error: Failed to reset password');
    console.error(error instanceof Error ? error.message : String(error));
    db.close();
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run
const [,, username, password] = process.argv;
if (!username || !password) {
  console.error('❌ Error: Missing required arguments');
  console.error('');
  console.error('Usage: tsx scripts/admin-recovery.ts <username> <new-password>');
  console.error('');
  console.error('Example:');
  console.error('  tsx scripts/admin-recovery.ts admin NewPassword123');
  process.exit(1);
}

resetAdminPassword(username, password).catch((error) => {
  console.error('❌ Unexpected error:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

