import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import webpush from 'web-push';
import notificationRoutes from './routes/notificationRoutes.js';
import safariRoutes from './routes/safariRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import cors from 'cors';

const app = express();

// 1. Debug logging
console.log('Starting server...');
console.log('VAPID public key exists:', !!process.env.VAPID_PUBLIC_KEY);
console.log('VAPID private key exists:', !!process.env.VAPID_PRIVATE_KEY);
console.log('Port:', process.env.PORT);

// 2. Middleware (order matters)
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);  // Log all requests
  next();
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://10.0.0.253:8080',
    'https://10.103.6.64:8080',
    'https://roi-game.vercel.app',
    // Add other allowed origins as needed
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware before other middleware and routes
app.use(cors(corsOptions));

// 4. VAPID setup
webpush.setVapidDetails(
  'mailto:markocalvocruz@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 5. Mount routes
app.use('/api/notifications', notificationRoutes);
app.use('/', safariRoutes);
app.use('/api/inventory', inventoryRoutes);

// 6. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /test');
  console.log('- POST /send-notification');
  console.log('- GET /vapid-key');
}); 