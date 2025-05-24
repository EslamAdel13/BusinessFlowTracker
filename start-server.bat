@echo off
echo Setting up environment variables...
set DATABASE_URL=postgresql://postgres:6jhBNWdP9TDUqj0R@db.gkuojavspzdiszewjvho.supabase.co:5432/postgres
set NODE_ENV=development
set SESSION_SECRET=your-secret-key-here

echo Starting the server...
echo.
echo Once running, you can access the API at http://localhost:5000/api
echo.

npx tsx server/index.ts
