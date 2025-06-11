import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Removed top-level await

(async () => {
  await registerRoutes(app); // Register routes on the app

  const server = createServer(app); // Create the server using the app with registered routes
  
  // Create WebSocket server for browser events
  const wss = new WebSocketServer({ server, path: '/browser-events' });
  
  // Connect to MCP server for terminal events
  let mcpWs: WebSocket | null = null;
  
  const connectToMCP = () => {
    try {
      mcpWs = new WebSocket('ws://localhost:8765');
      
      mcpWs.on('open', () => {
        log('Connected to MCP server for terminal events');
        setupTerminalCapture(); // Call setupTerminalCapture here
      });

      mcpWs.on('error', (error) => {
        log(`MCP WebSocket error: ${error}`);
      });

      mcpWs.on('close', () => {
        log('MCP WebSocket disconnected, attempting reconnect...');
        setTimeout(connectToMCP, 5000);
      });
    } catch (error) {
      log(`Failed to connect to MCP: ${error}`);
      setTimeout(connectToMCP, 5000);
    }
  };

  const sendTerminalEvent = (eventType: string, data: any) => {
    if (mcpWs && mcpWs.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'terminal_event',
        eventType: eventType,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        cwd: process.cwd(),
        ...data
      };
      
      try {
        mcpWs.send(JSON.stringify(payload));
      } catch (error) {
        log(`Failed to send terminal event: ${error}`);
      }
    }
  };

  // Setup terminal event capture and MCP message handling
  const setupTerminalCapture = () => {
    // Handle incoming messages from MCP server
    if (mcpWs) {
      mcpWs.on('message', (data) => {
        log(`[MCP Message Received] Raw data: ${data.toString().substring(0, 100)}...`); // Log raw data for debugging
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'console') {
            // Display browser console logs in local terminal
            const logIcon = message.level === 'error' ? '❌' :
                           message.level === 'warn' ? '⚠️' :
                           message.level === 'info' ? 'ℹ️' : '🔍';
            log(`${logIcon} [BROWSER ${message.level.toUpperCase()}] ${message.message}`);
            if (message.url) {
              log(`   📍 URL: ${message.url}:${message.line || '?'}:${message.column || '?'}`);
            }
          } else if (message.type === 'network') {
            // Display network requests in local terminal
            const statusIcon = message.status >= 400 ? '❌' : message.status >= 300 ? '⚠️' : '✅';
            log(`${statusIcon} [NETWORK] ${message.method} ${message.url} - ${message.status} ${message.statusText} (${message.responseTime}ms)`);
          }
        } catch (error) {
          log(`Error parsing MCP message: ${error}`);
        }
      });
    }

    log('Terminal event capture setup complete');
  };

  // Setup WebSocket server for browser events
  wss.on('connection', (ws) => {
    log('Browser client connected to local WebSocket server');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different types of browser events
        if (message.type === 'console') {
          const logIcon = message.level === 'error' ? '❌' :
                         message.level === 'warn' ? '⚠️' :
                         message.level === 'info' ? 'ℹ️' : '🔍';
          log(`${logIcon} [BROWSER ${message.level.toUpperCase()}] ${message.message}`);
          if (message.url) {
            log(`   📍 URL: ${message.url}`);
          }
        } else if (message.type === 'network') {
          const statusIcon = message.status >= 400 ? '❌' : message.status >= 300 ? '⚠️' : '✅';
          log(`${statusIcon} [NETWORK] ${message.method} ${message.url} - ${message.status} ${message.statusText} (${message.responseTime}ms)`);
        } else if (message.type === 'dom_event') {
          // Only log important DOM events to avoid spam
          if (['click', 'submit', 'error'].includes(message.eventType)) {
            log(`🖱️ [DOM] ${message.eventType} on ${message.target?.tagName}${message.target?.id ? '#' + message.target.id : ''}`);
          }
        } else if (message.type === 'javascript_error') {
          log(`❌ [JS ERROR] ${message.message} at ${message.filename}:${message.lineno}:${message.colno}`);
        } else if (message.type === 'page_ready' || message.type === 'page_loaded') {
          log(`📄 [PAGE] ${message.type} - ${message.readyState}`);
        }
      } catch (error) {
        log(`Error parsing browser WebSocket message: ${error}`);
      }
    });
    
    ws.on('close', () => {
      log('Browser client disconnected from local WebSocket server');
    });
  });

  // Initialize MCP connection
  connectToMCP();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 3000 for development
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
