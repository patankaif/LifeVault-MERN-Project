import { sendScheduledSlotNotification } from './server/email-service-resend.js';

const testEmail = 'patankaif23@gmail.com';
const testSlotName = 'Test Memory';
const testLink = 'https://lifevault-api-cmmw.onrender.com/shared-vault/test-token';

console.log('Testing scheduled delivery email...');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

try {
  const result = await sendScheduledSlotNotification(testEmail, testSlotName, testLink);
  console.log('✅ Email sent successfully:', result);
} catch (error) {
  console.error('❌ Email failed:', error);
  console.error('Error details:', JSON.stringify(error, null, 2));
}
