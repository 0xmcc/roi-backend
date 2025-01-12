import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// This is a test subscription object - you'll need to replace with a real one from your frontend
const subscription = {
  endpoint: "https://web.push.apple.com/QDcpB4HoYScyrmcJ8JJnylGrKM-rGyKia49dc-3WYSTG56swWBWmAQ9iRB_MtoSKua6HtZ48Njo8YA9OY_QBGdo_UFBc0t2Rq4IUt7S9M8X1ca7DQdvyLkidsEHQiNZy9Wc0OxLRpVgwHuGoALxh5T-G_ZXh0HiIetKcds8Snpk",
  keys: {
    p256dh: "BHwE69vi-sKTPNVOH2t2R8Y6p3yDj8xG0EMb9uRPip26uz3ShKGJh1wfAZX_EEbLAtAIyqiG_uS8iRCRMAecicE",
    auth: "L8Hptd0TQVCIPzBWn503SQ"
  }
};

const exampleNotification = {
  title: "Chess Move",
  body: "Your opponent just made a move!",
  icon: "/chess-icon.png",
  data: {
    url: "/games/active",
    gameId: "123"
  }
};

// Test the endpoint using fetch
async function testNotification() {
  try {
    // 1. Verify environment
    const port = process.env.PORT || 3000;
    console.log('Testing with port:', port);
    
    // 2. Prepare request
    const url = `http://localhost:${port}/send-notification`;
    console.log('Sending request to:', url);
    
    // 3. Make request with timeout
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        notification: exampleNotification
      }),
      timeout: 5000  // 5 second timeout
    });
    
    // 4. Handle response
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    if (error.type === 'request-timeout') {
      console.error('Request timed out. Is the server running on the correct port?');
    } else {
      console.error('Error:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
    }
  }
}

testNotification(); 