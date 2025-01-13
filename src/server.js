import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import webpush from 'web-push';
import notificationRoutes from './routes/notificationRoutes.js';
import safariRoutes from './routes/safariRoutes.js';

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

// 3. CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 4. VAPID setup
webpush.setVapidDetails(
  'mailto:markocalvocruz@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 5. Mount routes
app.use('/api/notifications', notificationRoutes);
app.use('/', safariRoutes);
// 6. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /test');
  console.log('- POST /send-notification');
}); 