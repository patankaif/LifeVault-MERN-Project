import dotenv from 'dotenv';
import { sendOTP } from './server/email-service.js';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing Resend email service...');
    console.log('🔑 API Key:', process.env.RESEND_API_KEY ? 'Loaded' : 'Missing');
    console.log('📧 From Email:', process.env.FROM_EMAIL);
    console.log('📧 From Name:', process.env.FROM_NAME);
    console.log('📧 All env vars:', Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('FROM')));
    console.log('📧 Sending test OTP to patankaif123@gmail.com...');
    
    const result = await sendOTP('patankaif123@gmail.com', '123456');
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Result:', result);
    console.log('🎉 Check your inbox for the beautiful LifeVault email!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.log('🔍 Error details:', error.message);
    console.log('🔍 Full error:', error);
  }
}

testEmail();
