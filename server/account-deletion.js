import { getDB } from './db-mongo.js';
import { sendOTP } from './email-service-resend.js';

// Generate deletion OTP
export function generateDeletionOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send deletion OTP to user's email
export async function sendDeletionOTP(userId) {
  try {
    const db = await getDB();
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateDeletionOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          deletionOTP: otp,
          deletionOTPExpiry: otpExpiry
        } 
      }
    );

    // Send OTP email
    await sendOTP(user.email, otp);
    
    console.log(`[Account Deletion] OTP sent to ${user.email}`);
    
    return { success: true, message: 'Deletion OTP sent to your email' };
  } catch (error) {
    console.error('[Account Deletion] Failed to send OTP:', error);
    throw error;
  }
}

// Verify deletion OTP and delete account
export async function verifyAndDeleteAccount(userId, otp) {
  try {
    const db = await getDB();
    const user = await db.collection('users').findOne({ _id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify OTP
    if (!user.deletionOTP || user.deletionOTP !== otp) {
      throw new Error('Invalid OTP');
    }

    // Check OTP expiry
    if (new Date() > new Date(user.deletionOTPExpiry)) {
      throw new Error('OTP has expired');
    }

    console.log(`[Account Deletion] Starting deletion for user: ${user.email}`);

    // Delete all user data in order
    const deletionResults = {
      slots: 0,
      vaults: 0,
      schedulings: 0,
      inactivityLogs: 0,
      mediaFiles: 0,
      user: false
    };

    // Import file system utilities
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // 1. Get all slots before deletion to clean up media files
    const userSlots = await db.collection('slots').find({ userId }).toArray();
    const slotIds = userSlots.map(s => s._id);

    // 2. Delete all media files from disk
    for (const slot of userSlots) {
      if (slot.media && slot.media.length > 0) {
        for (const media of slot.media) {
          if (media.url) {
            try {
              const urlParts = media.url.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const filePath = path.join(uploadsDir, fileName);
              
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deletionResults.mediaFiles++;
                console.log(`[Account Deletion] Deleted file: ${fileName}`);
              }
            } catch (fileError) {
              console.error(`[Account Deletion] Failed to delete file:`, fileError);
            }
          }
        }
      }
    }

    // 3. Delete all slots (this will also delete media and texts within slots)
    const slotsResult = await db.collection('slots').deleteMany({ userId });
    deletionResults.slots = slotsResult.deletedCount;

    // 4. Delete all vaults
    const vaultsResult = await db.collection('vaults').deleteMany({ userId });
    deletionResults.vaults = vaultsResult.deletedCount;

    // 5. Delete all schedulings for the user's slots
    if (slotIds.length > 0) {
      const schedulingsResult = await db.collection('scheduling').deleteMany({ 
        slotId: { $in: slotIds } 
      });
      deletionResults.schedulings = schedulingsResult.deletedCount;
    }

    // 6. Delete inactivity logs
    const inactivityResult = await db.collection('inactivityLogs').deleteMany({ userId });
    deletionResults.inactivityLogs = inactivityResult.deletedCount;

    // 7. Finally delete the user
    const userResult = await db.collection('users').deleteOne({ _id: userId });
    deletionResults.user = userResult.deletedCount > 0;

    console.log(`[Account Deletion] Completed for user ${user.email}:`, deletionResults);

    return { 
      success: true, 
      message: 'Account permanently deleted',
      deletedItems: deletionResults
    };
  } catch (error) {
    console.error('[Account Deletion] Failed:', error);
    throw error;
  }
}

// Check if user has deletion OTP pending
export async function checkDeletionOTPStatus(userId) {
  try {
    const db = await getDB();
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { deletionOTPExpiry: 1, email: 1 } }
    );
    
    if (!user) {
      throw new Error('User not found');
    }

    const hasPendingOTP = user.deletionOTPExpiry && new Date() < new Date(user.deletionOTPExpiry);
    
    return {
      hasPendingOTP,
      email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email
    };
  } catch (error) {
    console.error('[Account Deletion] Failed to check OTP status:', error);
    throw error;
  }
}
