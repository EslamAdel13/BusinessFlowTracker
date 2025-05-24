import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add Content Security Policy headers to allow fonts and other resources
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' *.supabase.co; connect-src 'self' *.supabase.co wss://*.supabase.co; font-src 'self' data: http: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: http: https:;"
  );
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Check if we're running in API-only mode
const isApiOnly = process.argv.includes('--api-only');

(async () => {
  // Force development mode for the 'npm run dev' command
  const forceDev = true; // Set this to true for development
  app.set('env', forceDev ? 'development' : (process.env.NODE_ENV || 'production'));
  
  // Log the NODE_ENV value to debug
  log(`NODE_ENV from process.env: ${process.env.NODE_ENV}`);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Only setup Vite if we're not in API-only mode
  const isDev = app.get("env") === "development";
  log(`[DEBUG] isApiOnly: ${isApiOnly}, app.get('env'): ${app.get('env')}, isDev: ${isDev}`);
  
  if (!isApiOnly) {
    if (isDev) {
      // In development mode, use Vite's dev server
      log('Setting up Vite development server');
      try {
        await setupVite(app, server);
        log('Vite development server setup complete');
      } catch (error) {
        log(`Error setting up Vite: ${error}`);
        // Fallback to static serving if Vite setup fails
        serveStatic(app);
      }
    } else {
      // In production mode, serve static files
      log('Using static file serving (production mode)');
      serveStatic(app);
    }
  } else {
    log('Running in API-only mode. Client-side will not be served.');
    // Add a simple root route for API-only mode
    app.get('/', (_req, res) => {
      res.send('Server running in API-only mode. Access the API at /api endpoints.');
    });
  }

  // Get port from environment variable or use default
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.listen({
    port,
    host: "localhost", // Use localhost instead of 0.0.0.0 for Windows compatibility
    // Remove reusePort as it's not supported on Windows
  }, () => {
    log(`Server running at http://localhost:${port}`);
  });
})();
