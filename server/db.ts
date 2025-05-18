import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { DATABASE_URL } from './env';

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a PostgreSQL pool connection
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });