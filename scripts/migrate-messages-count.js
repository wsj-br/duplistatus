const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database path
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'backups.db');

console.log('🔄 Starting database migration...');
console.log(`📁 Database path: ${dbPath}`);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found. No migration needed.');
  process.exit(0);
}

try {
  // Open database connection
  const db = new Database(dbPath);
  
  // Check if the column already exists
  const tableInfo = db.prepare("PRAGMA table_info(backups)").all();
  const hasMessagesActualLength = tableInfo.some(col => col.name === 'messages_actual_length');
  
  if (hasMessagesActualLength) {
    console.log('✅ Column messages_actual_length already exists. No migration needed.');
    db.close();
    process.exit(0);
  }
  
  console.log('📊 Adding messages_actual_length column...');
  
  // Add the new column
  db.exec(`ALTER TABLE backups ADD COLUMN messages_actual_length INTEGER NOT NULL DEFAULT 0`);
  
  console.log('🔄 Updating existing records...');
  
  // Update existing records to calculate messages count from JSON arrays
  const updateStmt = db.prepare(`
    UPDATE backups 
    SET messages_actual_length = (
      CASE 
        WHEN messages_array IS NULL OR messages_array = '' THEN 0
        ELSE json_array_length(messages_array)
      END
    )
    WHERE messages_actual_length = 0
  `);
  
  const result = updateStmt.run();
  
  console.log(`✅ Migration completed successfully!`);
  console.log(`📈 Updated ${result.changes} records`);
  
  // Verify the migration
  const sampleRecord = db.prepare(`
    SELECT messages_actual_length, 
           CASE 
             WHEN messages_array IS NULL OR messages_array = '' THEN 0
             ELSE json_array_length(messages_array)
           END as calculated_length
    FROM backups 
    WHERE messages_array IS NOT NULL 
    LIMIT 1
  `).get();
  
  if (sampleRecord) {
    console.log(`🔍 Verification: messages_actual_length=${sampleRecord.messages_actual_length}, calculated=${sampleRecord.calculated_length}`);
    if (sampleRecord.messages_actual_length === sampleRecord.calculated_length) {
      console.log('✅ Migration verification passed!');
    } else {
      console.log('⚠️  Migration verification failed - values don\'t match');
    }
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} 