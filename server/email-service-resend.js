import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Resend service
export async function initEmailService() {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    
    console.log('[Email Service] Resend initialized successfully');
    return true;
  } catch (error) {
    console.error('[Email Service] Resend initialization failed:', error);
    throw error;
  }
}

export async function sendOTP(email, otp) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [email],
      subject: 'Life Vault - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">🔐 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">OTP Verification</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">Your One-Time Password (OTP) for Life Vault is:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 15px; margin: 30px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
              <h1 style="color: white; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${otp}</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="color: #666; margin: 0; text-align: center;">
                <strong>⏰ Valid for 10 minutes only</strong><br>
                <span style="font-size: 14px;">For your security, never share this code with anyone</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">If you didn't request this code, please ignore this email.</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send OTP:', error);
      throw error;
    }

    console.log('[Email Service] OTP sent successfully to', email);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send OTP:', error);
    throw error;
  }
}

export async function sendScheduledSlotNotification(recipientEmail, slotName, accessLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [recipientEmail],
      subject: `🎁 Life Vault - New Memory Shared: ${slotName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">🎁 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">You've Received a Memory! 💌</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">Someone special has shared a memory slot titled "<strong>${slotName}</strong>" with you on Life Vault.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${accessLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: transform 0.3s ease;">🎯 View Memory Slot</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="color: #666; margin: 0; text-align: center;">
                <strong>🔗 Can't click the button?</strong><br>
                <span style="font-size: 14px;">Copy and paste this link in your browser:</span><br>
                <a href="${accessLink}" style="color: #667eea; word-break: break-all; font-size: 12px;">${accessLink}</a>
              </p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <p style="color: #155724; margin: 0; text-align: center;">
                <strong>⏰ This link is valid for 30 days</strong><br>
                <span style="font-size: 14px;">Make sure to view your memory before it expires!</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">Thank you for using Life Vault to preserve precious memories!</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send notification:', error);
      throw error;
    }

    console.log('[Email Service] Notification sent successfully to', recipientEmail);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send notification:', error);
    throw error;
  }
}

export async function sendInactivityConfirmationEmail(email, confirmationLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [email],
      subject: '🔔 Life Vault - Are You Still With Us?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">🔔 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Account Security Check 🔒</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">We haven't seen you in a while. To keep your Death Vault secure, we need to confirm you're still active.</p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; text-align: center;">
                <strong>⚠️ Important:</strong> If you don't confirm your activity, your Death Vault will be automatically delivered to designated recipients after 15 days.
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${confirmationLink}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3); transition: transform 0.3s ease;">✅ Confirm I'm Active</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="color: #666; margin: 0; text-align: center;">
                <strong>🔗 Can't click the button?</strong><br>
                <span style="font-size: 14px;">Copy and paste this link in your browser:</span><br>
                <a href="${confirmationLink}" style="color: #28a745; word-break: break-all; font-size: 12px;">${confirmationLink}</a>
              </p>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #17a2b8;">
              <p style="color: #0c5460; margin: 0; text-align: center;">
                <strong>⏰ This confirmation link is valid for 15 days</strong><br>
                <span style="font-size: 14px;">Please confirm as soon as possible to ensure your Death Vault remains secure.</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">Your security is our priority at Life Vault.</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send inactivity confirmation:', error);
      throw error;
    }

    console.log('[Email Service] Inactivity confirmation sent successfully to', email);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send inactivity confirmation:', error);
    throw error;
  }
}

export async function sendDeathVaultNotification(recipientEmail, senderName, accessLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [recipientEmail],
      subject: `💔 Life Vault - Important Message from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">💔 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">An Important Message Awaits 💌</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">${senderName} has left you a special message in their Life Vault Death Vault.</p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #6c757d;">
              <p style="color: #495057; margin: 0; text-align: center;">
                <strong>📝 This message was prepared with care and love</strong><br>
                <span style="font-size: 14px;">It contains memories, thoughts, and wishes meant specifically for you.</span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${accessLink}" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(220, 53, 69, 0.3); transition: transform 0.3s ease;">💝 View Important Message</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <p style="color: #666; margin: 0; text-align: center;">
                <strong>🔗 Can't click the button?</strong><br>
                <span style="font-size: 14px;">Copy and paste this link in your browser:</span><br>
                <a href="${accessLink}" style="color: #dc3545; word-break: break-all; font-size: 12px;">${accessLink}</a>
              </p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <p style="color: #155724; margin: 0; text-align: center;">
                <strong>🔒 This is a secure, private message</strong><br>
                <span style="font-size: 14px;">Only you have access to this special memory.</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">Thank you for being part of ${senderName}'s life journey.</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send Death Vault notification:', error);
      throw error;
    }

    console.log('[Email Service] Death Vault notification sent successfully to', recipientEmail);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send Death Vault notification:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [email],
      subject: '🎉 Welcome to Life Vault!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">🎉 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Life Vault, ${name}! 🎊</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">Congratulations on creating your Life Vault account! We're thrilled to have you on board.</p>
            
            <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <p style="color: #155724; margin: 0; text-align: center;">
                <strong>🌟 Your account is now ready to use!</strong><br>
                <span style="font-size: 14px;">Start creating and sharing your precious memories right away.</span>
              </p>
            </div>
            
            <div style="margin: 40px 0;">
              <h3 style="color: #333; text-align: center; margin-bottom: 25px;">🏛️ Your Three Vaults</h3>
              
              <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; background: #e3f2fd; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">⏰</div>
                  <h4 style="color: #1976d2; margin: 10px 0 5px;">Present Vault</h4>
                  <p style="color: #666; font-size: 12px; margin: 0;">Share memories within 1 month</p>
                </div>
                
                <div style="flex: 1; background: #f3e5f5; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">📅</div>
                  <h4 style="color: #7b1fa2; margin: 10px 0 5px;">Future Vault</h4>
                  <p style="color: #666; font-size: 12px; margin: 0;">Schedule memories within 9 months</p>
                </div>
                
                <div style="flex: 1; background: #ffebee; padding: 20px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">💝</div>
                  <h4 style="color: #c62828; margin: 10px 0 5px;">Death Vault</h4>
                  <p style="color: #666; font-size: 12px; margin: 0;">Legacy messages for loved ones</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://lifevault.com'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: transform 0.3s ease;">🚀 Go to Dashboard</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h4 style="color: #333; margin: 0 0 15px; text-align: center;">🎯 Quick Start Tips</h4>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Create your first memory slot in any vault</li>
                <li>Add photos, videos, and personal messages</li>
                <li>Set delivery schedules for future memories</li>
                <li>Invite friends and family to share memories</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">If you have any questions, we're here to help!</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send welcome email:', error);
      throw error;
    }

    console.log('[Email Service] Welcome email sent successfully to', email);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendSlotDeliveryConfirmation(email, slotName, recipientEmail) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [email],
      subject: `✅ Life Vault - Slot Delivered: ${slotName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">✅ Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">Secure Digital Memory Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Memory Successfully Delivered! 🎉</h2>
            <p style="color: #666; text-align: center; margin-bottom: 30px;">Your memory slot has been successfully delivered to its recipient.</p>
            
            <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <div style="text-align: center;">
                <h4 style="color: #155724; margin: 0 0 15px;">📦 Delivery Details</h4>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 0;">
                  <p style="margin: 8px 0;"><strong>📝 Slot Name:</strong> ${slotName}</p>
                  <p style="margin: 8px 0;"><strong>👤 Delivered to:</strong> ${recipientEmail}</p>
                  <p style="margin: 8px 0;"><strong>⏰ Delivery Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #17a2b8;">
              <p style="color: #0c5460; margin: 0; text-align: center;">
                <strong>📧 What happens next?</strong><br>
                <span style="font-size: 14px;">The recipient will receive an email with access to your memory slot. They can view all the photos, videos, and messages you've shared.</span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://lifevault.com'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: transform 0.3s ease;">🎯 View Dashboard</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">Thank you for using Life Vault to share your precious memories!</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send delivery confirmation:', error);
      throw error;
    }

    console.log('[Email Service] Delivery confirmation sent successfully to', email);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send delivery confirmation:', error);
    throw error;
  }
}

// Send instant delivery email for Present Vault
export async function sendInstantDeliveryEmail({ to, subject, slotName, media, texts, senderName, deliveryDate }) {
  try {
    // Generate media URLs for email
    const mediaItems = media.map((item, index) => {
      if (item.type === 'image') {
        return `
          <div style="margin: 10px 0;">
            <img src="${item.url}" alt="Memory ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          </div>
        `;
      } else if (item.type === 'video') {
        return `
          <div style="margin: 10px 0;">
            <video controls style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <source src="${item.url}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
      }
      return '';
    }).join('');

    // Generate text content
    const textItems = texts.map((text, index) => `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #007bff;">
        <p style="margin: 0; color: #333; white-space: pre-wrap;">${text.content}</p>
      </div>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'LifeVault'} <${process.env.FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 32px; margin: 0; font-weight: 700;">🎁 Life Vault</h1>
              <p style="color: #666; margin: 10px 0 0;">A Special Memory Just for You</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 15px; margin: 30px 0; box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);">
              <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">💌 You've Received a Memory!</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${senderName} has shared something special with you</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin: 0 0 15px;">📦 Memory Details</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 0;">
                <p style="margin: 8px 0;"><strong>📝 Memory Name:</strong> ${slotName}</p>
                <p style="margin: 8px 0;"><strong>👤 From:</strong> ${senderName}</p>
                <p style="margin: 8px 0;"><strong>⏰ Delivered:</strong> ${new Date(deliveryDate).toLocaleString()}</p>
              </div>
            </div>
            
            ${mediaItems ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 15px;">📸 Photos & Videos</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                  ${mediaItems}
                </div>
              </div>
            ` : ''}
            
            ${textItems ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 15px;">📝 Messages</h3>
                ${textItems}
              </div>
            ` : ''}
            
            ${!mediaItems && !textItems ? `
              <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; text-align: center;">
                  <strong>📭 No content available</strong><br>
                  <span style="font-size: 14px;">This memory slot doesn't contain any photos, videos, or messages yet.</span>
                </p>
              </div>
            ` : ''}
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #17a2b8;">
              <p style="color: #0c5460; margin: 0; text-align: center;">
                <strong>💚 What is Life Vault?</strong><br>
                <span style="font-size: 14px;">Life Vault helps people preserve and share their precious memories with loved ones. This memory was shared instantly with you from someone who cares.</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">This memory was shared with you through Life Vault</p>
              <p style="margin: 10px 0 0;">© 2026 Life Vault. Preserving memories, connecting hearts.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Failed to send instant delivery:', error);
      throw error;
    }

    console.log('[Email Service] Instant delivery sent successfully to', to);
    return data;
  } catch (error) {
    console.error('[Email Service] Failed to send instant delivery:', error);
    throw error;
  }
}

export default {
  initEmailService,
  sendOTP,
  sendScheduledSlotNotification,
  sendInactivityConfirmationEmail,
  sendDeathVaultNotification,
  sendWelcomeEmail,
  sendSlotDeliveryConfirmation,
  sendInstantDeliveryEmail,
};
