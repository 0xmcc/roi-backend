import express from 'express';
import PushPackage from '../models/PushPackage.js';

const router = express.Router();

// Basic configuration
const websiteConfig = {
  websiteName: "Rock Paper Scissors",
  websitePushID: "web.com.roi",
  allowedDomains: ["https://yourchessgame.com"],
  urlFormatString: "https://yourchessgame.com/%@",
  webServiceURL: "https://yourchessgame.com"
};

// 1. Push Package endpoint
router.post('/v1/pushPackages/:websitePushId', async (req, res) => {
  try {
    const pushPackage = new PushPackage(
      websiteConfig.websitePushID,
      websiteConfig
    );
    
    const packageData = await pushPackage.create();
    res.json(packageData);
  } catch (error) {
    console.error('Push Package Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Device registration endpoint
router.post('/v1/devices/:deviceToken/registrations/:websitePushId', (req, res) => {
  // Store device token for later use
  console.log('Device Token:', req.params.deviceToken);
  res.sendStatus(200);
});

// 3. Device unregistration
router.delete('/v1/devices/:deviceToken/registrations/:websitePushId', (req, res) => {
  console.log('Unregister Device Token:', req.params.deviceToken);
  res.sendStatus(200);
});

export default router; 