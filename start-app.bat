@echo off
echo Setting up environment variables...
set DATABASE_URL=postgresql://postgres:6jhBNWdP9TDUqj0R@db.gkuojavspzdiszewjvho.supabase.co:5432/postgres
set NODE_ENV=development
set SESSION_SECRET=your-secret-key-here
set VITE_SUPABASE_URL=https://gkuojavspzdiszewjvho.supabase.co
set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdW9qYXZzcHpkaXN6ZXdqdmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzg1ODIsImV4cCI6MjA2Mjc1NDU4Mn0.DenFGGQiDjs8zAZijCjRY228_hSKam6bLAGlijkNm-M

echo Starting the server in API-only mode...
echo This will bypass client-side build issues and only start the API server
echo.
echo Once running, you can access the API at http://localhost:5000/api
echo.

npx tsx server/index.ts --api-only
