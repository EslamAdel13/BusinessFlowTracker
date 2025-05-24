// Database connection check
import './server/env';
import { pool } from './server/db';

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
  
  try {
    // Get a client from the pool
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Database server time:', result.rows[0].current_time);
    
    // Test database access by querying table information
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nAvailable tables:');
    tablesResult.rows.forEach((row, i) => {
      console.log(`${i+1}. ${row.table_name}`);
    });
    
    // Release the client back to the pool
    client.release();
    console.log('\nDatabase connection check completed successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

checkDatabaseConnection();
