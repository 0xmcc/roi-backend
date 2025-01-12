import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

try {
  const cert = fs.readFileSync(process.env.SAFARI_CERT_PATH);
  console.log('Certificate loaded successfully!');
  console.log('Certificate size:', cert.length, 'bytes');
} catch (error) {
  console.error('Failed to load certificate:', error);
} 