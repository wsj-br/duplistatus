#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import { DatabaseMigrator } from '../src/lib/db-migrations';
import * as fs from 'fs';
import * as path from 'path';

// Required tables after migration to version 4.0
const REQUIRED_TABLES = [
  'servers',
  'backups',
  'configurations',
  'users',
  'sessions',
  'audit_log',
  'db_version'
];

// Required columns for each table (key columns only)
const REQUIRED_COLUMNS: Record<string, string[]> = {
  servers: ['id', 'name', 'server_url', 'server_password'],
  backups: ['id', 'server_id', 'backup_name', 'backup_id'],
  users: ['id', 'username', 'password_hash', 'is_admin'],
  sessions: ['id', 'user_id', 'expires_at'],
  audit_log: ['id', 'timestamp', 'action', 'status'],
  configurations: ['key', 'value'],
  db_version: ['version', 'applied_at']
};

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

function validateDatabase(db: Database.Database): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  // Check version
  try {
    const versionResult = db.prepare(`
      SELECT version FROM db_version ORDER BY applied_at DESC LIMIT 1
    `).get() as { version: string } | undefined;

    if (!versionResult) {
      result.errors.push('db_version table exists but contains no version record');
      result.success = false;
    } else if (versionResult.version !== '4.0') {
      result.errors.push(`Expected version 4.0, but found ${versionResult.version}`);
      result.success = false;
    } else {
      console.log(`  ✓ Database version: ${versionResult.version}`);
    }
  } catch (error) {
    result.errors.push(`Failed to check database version: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  // Check table existence
  try {
    const tablesResult = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as Array<{ name: string }>;

    const existingTables = new Set(tablesResult.map(t => t.name));
    const missingTables: string[] = [];

    for (const table of REQUIRED_TABLES) {
      if (!existingTables.has(table)) {
        missingTables.push(table);
        result.errors.push(`Required table '${table}' is missing`);
        result.success = false;
      } else {
        console.log(`  ✓ Table '${table}' exists`);
      }
    }

    // Check for unexpected tables (warnings only)
    for (const table of existingTables) {
      if (!REQUIRED_TABLES.includes(table)) {
        result.warnings.push(`Unexpected table found: '${table}'`);
      }
    }
  } catch (error) {
    result.errors.push(`Failed to check table existence: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  // Check table structure (columns)
  for (const [tableName, requiredCols] of Object.entries(REQUIRED_COLUMNS)) {
    try {
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string; type: string }>;
      const existingColumns = new Set(tableInfo.map(col => col.name));
      const missingColumns: string[] = [];

      for (const col of requiredCols) {
        if (!existingColumns.has(col)) {
          missingColumns.push(col);
          result.errors.push(`Required column '${tableName}.${col}' is missing`);
          result.success = false;
        }
      }

      if (missingColumns.length === 0) {
        console.log(`  ✓ Table '${tableName}' has all required columns`);
      }
    } catch (error) {
      // Table might not exist (already caught above), but log if it's a different error
      if (result.errors.some(e => e.includes(`table '${tableName}'`))) {
        // Already reported as missing table
      } else {
        result.errors.push(`Failed to check columns for table '${tableName}': ${error instanceof Error ? error.message : String(error)}`);
        result.success = false;
      }
    }
  }

  return result;
}

function validateAdminUser(db: Database.Database): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  try {
    // Check if admin user exists
    const adminUser = db.prepare(`
      SELECT id, username, password_hash, is_admin, must_change_password
      FROM users 
      WHERE username = 'admin'
    `).get() as {
      id: string;
      username: string;
      password_hash: string;
      is_admin: number;
      must_change_password: number;
    } | undefined;

    if (!adminUser) {
      result.errors.push('Admin user with username "admin" not found');
      result.success = false;
      return result;
    }

    console.log('  ✓ Admin user exists');

    // Validate username
    if (adminUser.username !== 'admin') {
      result.errors.push(`Admin user username is "${adminUser.username}" but expected "admin"`);
      result.success = false;
    } else {
      console.log(`  ✓ Admin username is correct: "${adminUser.username}"`);
    }

    // Validate is_admin flag
    if (adminUser.is_admin !== 1) {
      result.errors.push(`Admin user is_admin flag is ${adminUser.is_admin} but expected 1 (true)`);
      result.success = false;
    } else {
      console.log('  ✓ Admin user has is_admin = true');
    }

    // Validate must_change_password flag
    if (adminUser.must_change_password !== 1) {
      result.errors.push(`Admin user must_change_password flag is ${adminUser.must_change_password} but expected 1 (true)`);
      result.success = false;
    } else {
      console.log('  ✓ Admin user has must_change_password = true');
    }

    // Validate password_hash exists and is not empty
    if (!adminUser.password_hash || adminUser.password_hash.trim().length === 0) {
      result.errors.push('Admin user password_hash is missing or empty');
      result.success = false;
    } else {
      console.log('  ✓ Admin user has password_hash set');

      // Validate password_hash is a valid bcrypt hash format
      // Bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost parameter
      const bcryptPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
      if (!bcryptPattern.test(adminUser.password_hash)) {
        result.errors.push('Admin user password_hash does not appear to be a valid bcrypt hash');
        result.success = false;
      } else {
        console.log('  ✓ Admin user password_hash is valid bcrypt format');
      }
    }

    // Validate user ID format (should start with 'admin-')
    if (!adminUser.id.startsWith('admin-')) {
      result.warnings.push(`Admin user ID "${adminUser.id}" does not start with "admin-" prefix`);
    } else {
      console.log(`  ✓ Admin user ID format is correct: "${adminUser.id}"`);
    }

  } catch (error) {
    result.errors.push(`Failed to validate admin user: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  return result;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx scripts/test-migration.ts <database-file-path>');
    process.exit(1);
  }

  const dbPath = args[0];

  // Validate file exists
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: Database file not found: ${dbPath}`);
    process.exit(1);
  }

  // Resolve absolute path
  const absoluteDbPath = path.resolve(dbPath);
  console.log(`\n📊 Testing migration for database: ${absoluteDbPath}`);

  let db: Database.Database | null = null;

  try {
    // Open database
    console.log('  Opening database...');
    db = new Database(absoluteDbPath, { readonly: false });

    // Get initial version
    const migrator = new DatabaseMigrator(db, absoluteDbPath);
    const initialVersion = migrator.getCurrentVersion();
    console.log(`  Initial database version: ${initialVersion}`);

    // Run migrations
    console.log('  Running migrations...');
    migrator.runMigrationsSync();

    // Get final version
    const finalVersion = migrator.getCurrentVersion();
    console.log(`  Final database version: ${finalVersion}`);

    // Validate database structure
    console.log('\n  Validating database structure...');
    const structureValidation = validateDatabase(db);

    // Validate admin user
    console.log('\n  Validating admin user...');
    const adminValidation = validateAdminUser(db);

    // Combine validation results
    const allErrors = [...structureValidation.errors, ...adminValidation.errors];
    const allWarnings = [...structureValidation.warnings, ...adminValidation.warnings];
    const allSuccess = structureValidation.success && adminValidation.success;

    // Print warnings
    if (allWarnings.length > 0) {
      console.log('\n  ⚠️  Warnings:');
      for (const warning of allWarnings) {
        console.log(`    - ${warning}`);
      }
    }

    // Print errors and exit
    if (allErrors.length > 0) {
      console.log('\n  ❌ Validation errors:');
      for (const error of allErrors) {
        console.error(`    - ${error}`);
      }
      console.error('\n❌ Migration test failed');
      process.exit(1);
    }

    if (allSuccess) {
      console.log('\n✅ Migration test passed successfully');
      console.log('  ✓ Database structure is valid');
      console.log('  ✓ Admin user is correctly configured');
      process.exit(0);
    } else {
      console.error('\n❌ Migration test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error during migration test:');
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Close database connection
    if (db) {
      try {
        db.close();
      } catch (error) {
        console.warn('Warning: Error closing database:', error instanceof Error ? error.message : String(error));
      }
    }
  }
}

main();

