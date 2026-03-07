import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailConnectivity() {
  console.log('Testing email connectivity...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Test sending an email
    const testMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send test email to self
      subject: 'Life Vault - Email Connectivity Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Connectivity Test</h2>
          <p>This is a test email from Life Vault to verify email sending is working.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Status:</strong> If you receive this email, email connectivity is working!</p>
        </div>
      `,
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email connectivity test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      command: error.command
    });
  }
}

testEmailConnectivity();
