// Import Resend service (production-ready)
import emailService from './email-service-resend.js';

// Re-export all functions for backward compatibility
export const initEmailService = emailService.initEmailService;
export const sendOTP = emailService.sendOTP;
export const sendScheduledSlotNotification = emailService.sendScheduledSlotNotification;
export const sendInactivityConfirmationEmail = emailService.sendInactivityConfirmationEmail;
export const sendDeathVaultNotification = emailService.sendDeathVaultNotification;
export const sendWelcomeEmail = emailService.sendWelcomeEmail;
export const sendSlotDeliveryConfirmation = emailService.sendSlotDeliveryConfirmation;

export default emailService;
