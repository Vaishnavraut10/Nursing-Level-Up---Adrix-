const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Executing ${filePath}...`);
    
    await pool.query(sql);
    console.log(`✓ Successfully executed ${filePath}`);
  } catch (error) {
    console.error(`✗ Error executing ${filePath}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test connection
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
    
    // Execute schema
    const schemaPath = path.join(__dirname, 'src/config/schema.sql');
    await executeSQLFile(schemaPath);
    
    // Execute seed data
    const seedPath = path.join(__dirname, 'src/config/seed.sql');
    await executeSQLFile(seedPath);
    
    // Verify data
    console.log('\nVerifying seeded data...');
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✓ Users: ${usersResult.rows[0].count}`);
    
    const testSeriesResult = await pool.query('SELECT COUNT(*) FROM test_series');
    console.log(`✓ Test Series: ${testSeriesResult.rows[0].count}`);
    
    const questionsResult = await pool.query('SELECT COUNT(*) FROM questions');
    console.log(`✓ Questions: ${questionsResult.rows[0].count}`);
    
    console.log('\n✓ Database setup complete!');
  } catch (error) {
    console.error('\n✗ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();