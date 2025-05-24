// Simple script to test database connection
import { pool, db } from './server/db';
import { projects } from './shared/schema';

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test raw pool connection
    console.log('Testing pool connection...');
    const client = await pool.connect();
    console.log('Pool connection successful!');
    
    // Run a simple query
    const result = await client.query('SELECT NOW() as time');
    console.log('Database time:', result.rows[0].time);
    
    // Release the client
    client.release();
    
    // Test Drizzle ORM connection
    console.log('\nTesting Drizzle ORM connection...');
    const projectsResult = await db.select().from(projects).limit(5);
    console.log('Successfully fetched projects:', projectsResult.length);
    if (projectsResult.length > 0) {
      console.log('First project:', JSON.stringify(projectsResult[0], null, 2));
    }
    
    console.log('\nDatabase connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testConnection();
