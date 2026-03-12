import dotenv from 'dotenv';
import { sendOTP } from './server/email-service.js';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing Resend email service...');
    console.log('📧 Sending test OTP to lifevault09@gmail.com (your registered email)...');
    
    const result = await sendOTP('lifevault09@gmail.com', '123456');
    
    console.log('✅ Email sent successfully!');
    console.log('🎉 Check your inbox at lifevault09@gmail.com for the beautiful LifeVault email!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testEmail();
