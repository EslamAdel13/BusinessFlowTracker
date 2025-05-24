@echo off
setlocal enabledelayedexpansion

:: Set environment variables directly
echo Setting up environment variables...
set DATABASE_URL=postgresql://postgres:6jhBNWdP9TDUqj0R@db.gkuojavspzdiszewjvho.supabase.co:5432/postgres
set NODE_ENV=development
set SESSION_SECRET=your-secret-key-here
set VITE_SUPABASE_URL=https://gkuojavspzdiszewjvho.supabase.co
set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdW9qYXZzcHpkaXN6ZXdqdmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzg1ODIsImV4cCI6MjA2Mjc1NDU4Mn0.DenFGGQiDjs8zAZijCjRY228_hSKam6bLAGlijkNm-M

:: Parse command line arguments
set MODE=full
set ENV=development

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="--api-only" (
    set MODE=api-only
    shift
    goto :parse_args
)
if /i "%~1"=="--client-only" (
    set MODE=client-only
    shift
    goto :parse_args
)
if /i "%~1"=="--prod" (
    set ENV=production
    shift
    goto :parse_args
)
shift
goto :parse_args
:end_parse

:: Set NODE_ENV based on environment parameter
set NODE_ENV=%ENV%

:: Display startup information
echo.
echo Business Flow Tracker
echo =====================
echo Environment: %ENV%
echo.

if "%MODE%"=="api-only" (
    echo Starting the server in API-only mode...
    echo This will bypass client-side build issues and only start the API server
    echo.
    echo Once running, you can access the API at http://localhost:5000/api
    echo.
    npx tsx server/index.ts --api-only
) else if "%MODE%"=="client-only" (
    echo Starting the client application only...
    echo.
    echo Once running, you can access the application at http://localhost:3000
    echo.
    cd client
    npx vite --config vite.config.ts
) else (
    echo Starting the full application (server + client)...
    echo.
    echo Once running, you can access the application at http://localhost:5000
    echo.
    npx tsx server/index.ts
)

endlocal
