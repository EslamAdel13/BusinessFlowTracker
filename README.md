# Business Flow Tracker

A project management application for tracking business workflows and project timelines. Built with React, Express, and Supabase.

## Project Structure

```
BusinessFlowTracker/
├── client/             # React frontend
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Page components
│   │   └── utils/      # Utility functions
│   ├── index.html      # HTML entry point
│   ├── vite.config.ts  # Vite configuration
│   └── tsconfig.json   # TypeScript configuration
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── db.ts           # Database connection
│   └── env.ts          # Environment configuration
├── shared/             # Shared code between client and server
├── migrations/         # Database migrations
├── .env                # Environment variables
└── start.bat           # Startup script
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Running the Application

Use the provided `start.bat` script with the following options:

```
# Start both server and client (default)
start.bat

# Start only the API server
start.bat --api-only

# Start only the client
start.bat --client-only

# Run in production mode
start.bat --prod
```

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
- `SESSION_SECRET`: Secret for session management
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Database

This application uses Supabase as its database. The database schema uses snake_case for all column names.

## Development Notes

- Originally developed for Replit environment
- Uses Supabase for database and authentication
- Frontend built with React, Tailwind CSS, and shadcn/ui components
