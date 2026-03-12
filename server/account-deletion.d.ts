export function generateDeletionOTP(): string;
export function sendDeletionOTP(userId: string): Promise<{ success: boolean; message: string }>;
export function verifyAndDeleteAccount(userId: string, otp: string): Promise<{ success: boolean; message: string; deletedItems: any }>;
export function checkDeletionOTPStatus(userId: string): Promise<{ hasPendingOTP: boolean; email: string }>;
