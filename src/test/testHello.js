import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

async function testHello() {
  try {
    const port = process.env.PORT || 3000;
    console.log('Testing with port:', port);
    
    const url = `http://localhost:${port}/test`;
    console.log('Sending request to:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Raw response:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Parsed response:', data);
    }
  } catch (error) {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  }
}

testHello(); 