import nodemailer from 'nodemailer';

let transporter = null;

export async function initEmailService() {
  try {
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('[Email Service] SMTP connection verified');
    return true;
  } catch (error) {
    console.error('[Email Service] SMTP connection failed:', error);
    throw error;
  }
}

export async function sendOTP(email, otp) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Life Vault - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Life Vault OTP Verification</h2>
          <p>Your One-Time Password (OTP) for Life Vault is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP is valid for 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] OTP sent to', email);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send OTP:', error);
    throw error;
  }
}

export async function sendScheduledSlotNotification(recipientEmail, slotName, accessLink) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    console.log('[Email Service] sendScheduledSlotNotification called with:', {
      recipientEmail,
      slotName,
      accessLink
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Life Vault - New Memory Shared: ${slotName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #333;">Hello!</h2>
          <p>We hope this email finds you well.</p>
          <p>Someone has shared a special memory slot titled "<strong>${slotName}</strong>" with you on Life Vault.</p>
          <p>Click the button below to view this memory:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Memory Slot</a>
          </div>
          <p style="color: #666;">If the button doesn't work, you can also use this link:</p>
          <p style="color: #007bff; word-break: break-all;">${accessLink}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">This link is valid for 30 days. Thank you for using Life Vault.</p>
        </div>
      `,
    };

    console.log('[Email Service] Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Notification sent to', recipientEmail);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send notification:', error);
    throw error;
  }
}

export async function sendInactivityConfirmationEmail(email, confirmationLink) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Life Vault - Are You Still With Us?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Life Vault - Inactivity Confirmation</h2>
          <p>We haven't seen you in a while. To keep your account secure and your Death Vault safe, we need to confirm you're still active.</p>
          <p>Click the link below to confirm you're still with us:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm I'm Active</a>
          </div>
          <p style="color: #666;">Or copy and paste this link in your browser:</p>
          <p style="color: #007bff; word-break: break-all;">${confirmationLink}</p>
          <p style="color: #999; font-size: 12px;">This link is valid for 15 days. If you don't confirm, your Death Vault will be automatically delivered to designated recipients.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Inactivity confirmation sent to', email);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send inactivity confirmation:', error);
    throw error;
  }
}

export async function sendDeathVaultNotification(recipientEmail, senderName, accessLink) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Life Vault - Important Message from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">An Important Message</h2>
          <p>${senderName} has left you a message in their Life Vault.</p>
          <p>Click the link below to view this important message:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessLink}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a>
          </div>
          <p style="color: #666;">Or copy and paste this link in your browser:</p>
          <p style="color: #007bff; word-break: break-all;">${accessLink}</p>
          <p style="color: #999; font-size: 12px;">This is a secure message from Life Vault.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Death Vault notification sent to', recipientEmail);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send Death Vault notification:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to Life Vault!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #333;">Welcome to Life Vault, ${name}!</h2>
          <p>Congratulations on creating your Life Vault account! We're thrilled to have you on board.</p>
          <p>Life Vault is a secure platform where you can:</p>
          <ul style="color: #666;">
            <li><strong>Present Vault:</strong> Share memories within 1 month</li>
            <li><strong>Future Vault:</strong> Schedule memories to be shared within 9 months</li>
            <li><strong>Death Vault:</strong> Leave important messages for your loved ones</li>
          </ul>
          <p>Your account is now ready to use. Log in to start creating and sharing your memories.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://lifevault.com'}/dashboard" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">If you have any questions, please contact our support team. Thank you for using Life Vault!</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Welcome email sent to', email);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendSlotDeliveryConfirmation(email, slotName, recipientEmail) {
  try {
    if (!transporter) {
      await initEmailService();
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Life Vault - Slot Delivered: ${slotName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #333;">Slot Delivery Confirmation</h2>
          <p>Your memory slot has been successfully delivered!</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Slot Name:</strong> ${slotName}</p>
            <p style="margin: 5px 0;"><strong>Delivered to:</strong> ${recipientEmail}</p>
            <p style="margin: 5px 0;"><strong>Delivery Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #666;">The recipient will receive an email with access to your memory slot.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Thank you for using Life Vault to share your memories!</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Delivery confirmation sent to', email);
    return result;
  } catch (error) {
    console.error('[Email Service] Failed to send delivery confirmation:', error);
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
};
