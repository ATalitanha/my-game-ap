/**
 * Custom server to initialize Socket.IO alongside Next.js
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeSocketServer } from '@/lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url!, true);
      
      // Handle Next.js requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO server
  initializeSocketServer(server);

  // Start the server
  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server initialized`);
  });

}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});