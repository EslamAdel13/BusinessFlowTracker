import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Path to the .env file
const envPath = join(rootDir, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  // Load environment variables from .env file
  config({ path: envPath });
  console.log('Environment variables loaded from:', envPath);
} else {
  console.warn('No .env file found at:', envPath);
}

// Export environment variables for easy access
export const DATABASE_URL = process.env.DATABASE_URL;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-key';
