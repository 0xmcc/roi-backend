import express from 'express';
import webpush from 'web-push';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Add a test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

router.get('/vapid-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/send', async (req, res) => {
  try {
    // 1. First validate we have a body
    if (!req.body) {
      throw new Error('No request body received');
    }

    const { userId, gameId, title, body, url } = req.body;
    if (!userId) {
        return res.status(500).json({ error: 'userId is required' });
    }
    if (!url && !gameId) {
        throw new Error('url or gameId is required');
    }
    if (!title) {
        throw new Error('title is required');
    }
    if (!body) {
        throw new Error('body is required');
    }
   
    // 2. Get user's push_subscription from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('web_push_subscription')
      .eq('did', userId)
      .single();

    if (!user?.web_push_subscription) {
      return res.status(500).json({ error: 'No push subscription found' });
    }
    if (!user.web_push_subscription.endpoint) {
        return res.status(500).json({ error: 'Invalid push subscription structure' });
    }
    const notification = {
        title,
        body,
        icon: "/chess-icon.png",
        data: {
            url: url || `/games/${gameId}`,
            gameId
        }
    }

    // Add detailed VAPID validation
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        throw new Error('VAPID keys are not configured');
    }
    // Log full VAPID configuration
    console.log('Full configuration:', {
        subscription: user.web_push_subscription,
        vapidKeys: {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY
        },
        notification: notification
    });

    // 3. Debug logs (after we have the variables)
    console.log('Received subscription:', JSON.stringify(user.web_push_subscription, null, 2));
    console.log('Received notification:', JSON.stringify(notification, null, 2));
    console.log('VAPID keys loaded:', {
        public: process.env.VAPID_PUBLIC_KEY?.slice(0, 10) + '...',
        private: process.env.VAPID_PRIVATE_KEY?.slice(0, 10) + '...'
    });

// Add explicit options for web-push
    const options = {
        vapidDetails: {
            subject: 'mailto:markocalvocruz@gmail.com',
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY
        },
        TTL: 60 // Time To Live in seconds
     };
    // 4. Send notification - Web Push format 
    await webpush.sendNotification(
        user.web_push_subscription,
        JSON.stringify(notification),
        options
    );
    

    return res.json({ success: true });
  } catch (error) {
    console.error('Detailed Error:', {
      message: error.message,
      statusCode: error?.statusCode,
      body: error?.body,
//      endpoint: req.body?.subscription?.endpoint,
      vapidPublicKeyExists: !!process.env.VAPID_PUBLIC_KEY,
      vapidPrivateKeyExists: !!process.env.VAPID_PRIVATE_KEY
    });

    return res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message,
      statusCode: error?.statusCode,
      body: error?.body
    });
  }
});

// Add the subscribe endpoint
router.post('/subscribe', async (req, res) => {
    console.log('Received request:', JSON.stringify(req.body, null, 2));
    try {
      // Validate the request body
      if (!req.body) {
        return res.status(400).json({ error: 'No request body received' });
      }
  
      const { userId, subscription } = req.body;
      console.log('Received subscription:', JSON.stringify(subscription, null, 2), 'userId:', userId);
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Valid subscription is required' });
      }
  
      // Store the subscription in Supabase
      const { error } = await supabase
        .from('users')
        .update({ web_push_subscription: subscription })
        .eq('did', userId);
  
      if (error) {
        console.error('Failed to store subscription:', error);
        return res.status(500).json({ error: 'Failed to store subscription' });
      }
  
      console.log('Successfully stored subscription:', subscription);
      return res.json({ success: true, message: 'Subscription saved successfully' });
    } catch (error) {
      console.error('Detailed Error:', {
        message: error.message,
        statusCode: error?.statusCode,
      });
  
      return res.status(500).json({
        error: 'Failed to save subscription',
        details: error.message,
      });
    }
  });

export default router; 


    // // 2. Determine if it's Safari or other browser
    // // const isSafari = user.safari_push_subscription ? true : false; // .endpoint.includes('web.push.apple.com');
    // // const noPushSubscription = user.safari_push_subscription ? false : user.web_push_subscription ? false : true;
    // // if (noPushSubscription) {
    // //   return res.status(404).json({ error: 'No push subscription found' });
    // // }
    //  // 3. Send notification based on type
    //   if (isSafari) {
    // //     // Safari format
    // //     // const notification = {
    // //     //   title,
    // //     //   body,
    // //     //   url: url || `/games/${gameId}`
    // //     // };
    // //     const deviceToken = user.safari_push_subscription.endpoint.split('/').pop();
      
    // //     // Load certificate
    // //     const cert = fs.readFileSync(process.env.SAFARI_CERT_PATH);
        
    // //     // Create connection to Apple's server
    // //     const apns = new apn.Provider({
    // //       cert: cert,
    // //       key: cert,  // The .p12 file contains both cert and key
    // //       production: true // Use false for development
    // //     });
  
    // //     // Prepare notification
    // //     const notification = new apn.Notification();
    // //     notification.title = title;
    // //     notification.body = body;
    // //     notification.urlArgs = [url || `/games/${gameId}`];
    // //     notification.topic = process.env.WEBSITE_PUSH_ID;
  
    // //     // Send
    // //     const result = await apns.send(notification, deviceToken);
        
    // //     if (result.failed.length > 0) {
    // //       throw new Error(`Safari Push failed: ${result.failed[0].response.reason}`);
    // //     }
    //    } 
    //    else {