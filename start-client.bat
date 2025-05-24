@echo off
echo Setting up environment variables...
set VITE_SUPABASE_URL=https://gkuojavspzdiszewjvho.supabase.co
set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdW9qYXZzcHpkaXN6ZXdqdmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzg1ODIsImV4cCI6MjA2Mjc1NDU4Mn0.DenFGGQiDjs8zAZijCjRY228_hSKam6bLAGlijkNm-M

echo Starting the client application...
echo.
echo Once running, you can access the application at http://localhost:3000
echo.

cd client
npx vite --config vite.config.ts
