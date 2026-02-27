/**
 * Database Setup Script
 * This script helps set up the database for the Citizen Services Intake System
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database first
  password: process.env.DB_PASSWORD || 'yourpassword',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');

    // Check if database exists
    const dbName = process.env.DB_DATABASE || 'citizen_intake';
    const checkDbResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbResult.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully!`);
    } else {
      console.log(`✅ Database ${dbName} already exists.`);
    }

    // Close connection to default database
    await pool.end();

    // Connect to the new database
    const dbPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'yourpassword',
      port: process.env.DB_PORT || 5432,
    });

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../frontend/database/citizen-services-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`);
      console.log('Please make sure the schema file exists.');
      await dbPool.end();
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Running database schema...');
    await dbPool.query(schema);
    console.log('✅ Database schema applied successfully!');

    // Test connection
    const testResult = await dbPool.query('SELECT COUNT(*) FROM form_templates');
    console.log('✅ Database connection test successful!');
    console.log(`📊 Tables created and ready to use.`);

    await dbPool.end();
    console.log('\n🎉 Database setup complete!');
    console.log('You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running and accessible.');
      console.error('   Check your connection settings in .env file.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your DB_PASSWORD in .env file.');
    } else {
      console.error('\n💡 Error details:', error);
    }
    process.exit(1);
  }
}

setupDatabase();
