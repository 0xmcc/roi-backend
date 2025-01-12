import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

async function testSafariPushPackage() {
  try {
    const port = process.env.PORT || 3000;
    const websitePushId = process.env.WEBSITE_PUSH_ID;
    
    console.log('Testing Safari Push Package');
    console.log('Port:', port);
    console.log('Website Push ID:', websitePushId);
    
    const url = `http://localhost:${port}/v1/pushPackages/${websitePushId}`;
    console.log('Sending request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  }
}

testSafariPushPackage(); 