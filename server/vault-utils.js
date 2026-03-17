import { v4 as uuidv4 } from 'uuid';
import { getDB } from './db-mongo.js';
import { sendScheduledSlotNotification, sendDeathVaultNotification, sendSlotDeliveryConfirmation } from './email-service.js';
import { getCurrentISTTime, getCurrentISTISOString, getISTDateForDB, convertISTToUTC } from './timezone-utils.js';

const PRESENT_VAULT_LIMIT_DAYS = 30;
const FUTURE_VAULT_LIMIT_DAYS = 270; // 9 months
const SHARE_LINK_VALIDITY_DAYS = 30;

export async function getVault(userId, vaultType) {
  try {
    const db = await getDB();
    const vault = await db.collection('vaults').findOne({
      userId,
      type: vaultType,
    });
    return vault;
  } catch (error) {
    console.error('[Vault] Failed to get vault:', error);
    throw error;
  }
}

export async function createSlot(userId, vaultId, slotName, parentSlotId = null) {
  try {
    const db = await getDB();

    // Check if slot name already exists at this level
    const existingSlot = await db.collection('slots').findOne({
      vaultId,
      parentSlotId,
      name: slotName,
    });

    if (existingSlot) {
      return { success: false, message: 'Slot with this name already exists at this level' };
    }

    const slot = {
      _id: uuidv4(),
      vaultId,
      userId,
      name: slotName,
      parentSlotId,
      media: [],
      texts: [],
      scheduledEmails: [],
      createdAt: getISTDateForDB(),
      updatedAt: getISTDateForDB(),
    };

    await db.collection('slots').insertOne(slot);

    return {
      success: true,
      message: 'Slot created successfully',
      slot,
    };
  } catch (error) {
    console.error('[Vault] Failed to create slot:', error);
    throw error;
  }
}

export async function getSlots(vaultId, parentSlotId = null) {
  try {
    const db = await getDB();
    const slots = await db.collection('slots')
      .find({
        vaultId,
        parentSlotId,
      })
      .toArray();
    return slots;
  } catch (error) {
    console.error('[Vault] Failed to get slots:', error);
    throw error;
  }
}

export async function addMediaToSlot(slotId, mediaUrl, mediaType) {
  try {
    const db = await getDB();

    const media = {
      _id: uuidv4(),
      url: mediaUrl,
      type: mediaType, // 'image', 'video'
      uploadedAt: getISTDateForDB(),
    };

    await db.collection('slots').updateOne(
      { _id: slotId },
      { $push: { media }, $set: { updatedAt: getISTDateForDB() } }
    );

    return {
      success: true,
      message: 'Media added successfully',
      media,
    };
  } catch (error) {
    console.error('[Vault] Failed to add media:', error);
    throw error;
  }
}

export async function addTextToSlot(slotId, textContent) {
  try {
    const db = await getDB();

    const text = {
      _id: uuidv4(),
      content: textContent,
      createdAt: getISTDateForDB(),
    };

    await db.collection('slots').updateOne(
      { _id: slotId },
      { $push: { texts: text }, $set: { updatedAt: getISTDateForDB() } }
    );

    return {
      success: true,
      message: 'Text added successfully',
      text,
    };
  } catch (error) {
    console.error('[Vault] Failed to add text:', error);
    throw error;
  }
}

export async function deleteSlot(slotId, vaultType) {
  try {
    const db = await getDB();

    // Get the slot to check if it has children and media
    const slot = await db.collection('slots').findOne({ _id: slotId });
    if (!slot) {
      return { success: false, message: 'Slot not found' };
    }

    // Clean up all media files for this slot
    if (slot.media && slot.media.length > 0) {
      try {
        const gridfsStorage = await import('./gridfs-storage.js');
        
        for (const media of slot.media) {
          if (media.url && media.url.startsWith('/api/media/')) {
            // Delete file from GridFS
            const deleted = await gridfsStorage.deleteFileFromGridFS(media.url);
            if (deleted) {
              console.log(`[Cleanup] Deleted GridFS file for slot ${slotId}: ${media.url}`);
            } else {
              console.log(`[Cleanup] Failed to delete GridFS file for slot ${slotId}: ${media.url}`);
            }
          }
        }
      } catch (fileError) {
        console.error('[Cleanup] Failed to delete some GridFS files for slot:', slotId, fileError);
        // Continue with slot deletion even if file cleanup fails
      }
    }

    // For Death Vault, allow deletion of slots
    // if (vaultType === 'death') {
    //   return { success: false, message: 'Cannot delete Death Vault slots' };
    // }

    // Delete all nested slots recursively
    const nestedSlots = await db.collection('slots').find({ parentSlotId: slotId }).toArray();
    for (const nestedSlot of nestedSlots) {
      await deleteSlot(nestedSlot._id, vaultType);
    }

    // Delete the slot
    await db.collection('slots').deleteOne({ _id: slotId });

    return { success: true, message: 'Slot deleted successfully' };
  } catch (error) {
    console.error('[Vault] Failed to delete slot:', error);
    throw error;
  }
}

export async function deleteMediaFromSlot(slotId, mediaId) {
  try {
    const db = await getDB();

    // First, get the slot to find the media URL before deleting it
    const slot = await db.collection('slots').findOne({ _id: slotId });
    if (!slot) {
      throw new Error('Slot not found');
    }

    // Find the specific media to get its URL
    const mediaToDelete = slot.media?.find(m => m._id === mediaId);
    if (!mediaToDelete) {
      throw new Error('Media not found');
    }

    // Delete the file from GridFS
    if (mediaToDelete.url && mediaToDelete.url.startsWith('/api/media/')) {
      try {
        const gridfsStorage = await import('./gridfs-storage.js');
        
        const deleted = await gridfsStorage.deleteFileFromGridFS(mediaToDelete.url);
        if (deleted) {
          console.log(`[Cleanup] Deleted GridFS file: ${mediaToDelete.url}`);
        } else {
          console.log(`[Cleanup] Failed to delete GridFS file: ${mediaToDelete.url}`);
        }
      } catch (fileError) {
        console.error('[Cleanup] Failed to delete GridFS file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Remove media reference from database
    await db.collection('slots').updateOne(
      { _id: slotId },
      { $pull: { media: { _id: mediaId } }, $set: { updatedAt: new Date() } }
    );

    return { success: true, message: 'Media deleted successfully' };
  } catch (error) {
    console.error('[Vault] Failed to delete media:', error);
    throw error;
  }
}

export async function deleteTextFromSlot(slotId, textId) {
  try {
    const db = await getDB();

    await db.collection('slots').updateOne(
      { _id: slotId },
      { $pull: { texts: { _id: textId } }, $set: { updatedAt: new Date() } }
    );

    return { success: true, message: 'Text deleted successfully' };
  } catch (error) {
    console.error('[Vault] Failed to delete text:', error);
    throw error;
  }
}

export async function updateTextInSlot(slotId, textId, newContent) {
  try {
    const db = await getDB();

    await db.collection('slots').updateOne(
      { _id: slotId, 'texts._id': textId },
      { $set: { 'texts.$.content': newContent, updatedAt: new Date() } }
    );

    return { success: true, message: 'Text updated successfully' };
  } catch (error) {
    console.error('[Vault] Failed to update text:', error);
    throw error;
  }
}

export async function scheduleSlot(slotId, recipientEmail, scheduledDate, vaultType) {
  try {
    const db = await getDB();

    // Validate scheduling date based on vault type
    const now = new Date();
    const maxDate = new Date(now.getTime() + (vaultType === 'present' ? PRESENT_VAULT_LIMIT_DAYS : FUTURE_VAULT_LIMIT_DAYS) * 24 * 60 * 60 * 1000);

    if (new Date(scheduledDate) > maxDate) {
      return { success: false, message: `Cannot schedule beyond ${vaultType === 'present' ? '1 month' : '9 months'}` };
    }

    console.log(`[Vault] scheduleSlot called with:`, {
      slotId,
      recipientEmail,
      scheduledDate,
      vaultType
    });

    const scheduling = {
      _id: uuidv4(),
      slotId,
      recipientEmail,
      scheduledDate: convertISTToUTC(scheduledDate),
      accessToken: uuidv4(),
      accessTokenExpiresAt: getISTDateForDB(new Date(Date.now() + SHARE_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000)),
      sent: false,
      createdAt: getISTDateForDB(),
    };

    console.log(`[Vault] Creating scheduling record:`, JSON.stringify(scheduling, null, 2));

    // Insert scheduling record
    await db.collection('scheduling').insertOne(scheduling);

    // Add to slot's scheduledEmails array AND update slot with scheduling info
    console.log(`[Vault] Updating slot ${slotId} with:`, {
      recipientEmail,
      scheduledDate: new Date(scheduledDate)
    });

    await db.collection('slots').updateOne(
      { _id: slotId },
      { 
        $push: { scheduledEmails: scheduling._id },
        $set: { 
          scheduledDate: convertISTToUTC(scheduledDate),
          scheduledEmail: recipientEmail,
          updatedAt: new Date()
        }
      }
    );

    // Return the updated slot
    const updatedSlot = await db.collection('slots').findOne({ _id: slotId });

    console.log(`[Vault] Updated slot in database:`, JSON.stringify(updatedSlot, null, 2));

    return {
      success: true,
      message: 'Slot scheduled successfully',
      slot: updatedSlot,
    };
  } catch (error) {
    console.error('[Vault] Failed to schedule slot:', error);
    throw error;
  }
}

export async function getNextScheduledSlot(userId) {
  try {
    const db = await getDB();

    const scheduling = await db.collection('scheduling')
      .aggregate([
        {
          $lookup: {
            from: 'slots',
            localField: 'slotId',
            foreignField: '_id',
            as: 'slot',
          },
        },
        {
          $match: {
            'slot.userId': userId,
            scheduledDate: { $gte: new Date() },
            sent: false,
          },
        },
        {
          $sort: { scheduledDate: 1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();

    return scheduling.length > 0 ? scheduling[0] : null;
  } catch (error) {
    console.error('[Vault] Failed to get next scheduled slot:', error);
    throw error;
  }
}

export async function getDeliveryStatus(slotId) {
  try {
    const db = await getDB();

    // Get the scheduling record for this slot
    const scheduling = await db.collection('scheduling').findOne({ slotId });
    
    if (!scheduling) {
      return { delivered: false };
    }

    // Check if the scheduling has been sent (delivered)
    return { delivered: scheduling.sent || false };
  } catch (error) {
    console.error('[Vault] Failed to get delivery status:', error);
    throw error;
  }
}

export async function sendScheduledSlots() {
  try {
    const db = await getDB();
    const currentIST = getCurrentISTTime();
    const currentUTC = new Date();
    
    console.log(`[Vault] Current UTC time: ${currentUTC.toISOString()}`);
    console.log(`[Vault] Current IST time: ${getCurrentISTISOString()}`);

    // Find all scheduled slots that are due to be sent (compare UTC times)
    const dueSchedulings = await db.collection('scheduling')
      .find({
        scheduledDate: { $lte: currentUTC },
        sent: false,
      })
      .toArray();

    console.log(`[Vault] Found ${dueSchedulings.length} due scheduled slots to send`);

    for (const scheduling of dueSchedulings) {
      const slot = await db.collection('slots').findOne({ _id: scheduling.slotId });
      
      // Skip if slot not found
      if (!slot) {
        console.warn(`[Vault] Slot not found for scheduling ${scheduling._id}, skipping...`);
        continue;
      }
      
      const user = await db.collection('users').findOne({ _id: slot.userId });
      
      // Skip if user not found
      if (!user) {
        console.warn(`[Vault] User not found for slot ${slot._id}, skipping...`);
        continue;
      }

      // Create access link
      const accessLink = `https://lifevault-api-cmmw.onrender.com/shared-vault/${scheduling.accessToken}`;

      console.log(`[Vault] Sending email to ${scheduling.recipientEmail} for slot "${slot.name}"`);
      
      try {
        // Send the email
        await sendScheduledSlotNotification(scheduling.recipientEmail, slot.name, accessLink);
        
        // Mark as sent in scheduling collection
        await db.collection('scheduling').updateOne(
          { _id: scheduling._id },
          { $set: { sent: true, sentAt: new Date() } }
        );

        // Update slot delivery status
        await db.collection('slots').updateOne(
          { _id: slot._id },
          { $set: { delivered: true, deliveredAt: new Date() } }
        );

        // Send confirmation to the sender (user)
        await sendSlotDeliveryConfirmation(user.email, slot.name, scheduling.recipientEmail);

        console.log(`[Vault] Successfully sent scheduled slot "${slot.name}" to ${scheduling.recipientEmail}`);
      } catch (emailError) {
        console.error(`[Vault] Failed to send email for scheduling ${scheduling._id}:`, emailError);
      }
    }
  } catch (error) {
    console.error('[Vault] Failed to send scheduled slots:', error);
  }
}

export async function getSharedSlot(accessToken) {
  try {
    const db = await getDB();

    const scheduling = await db.collection('scheduling').findOne({
      accessToken,
      accessTokenExpiresAt: { $gt: new Date() },
    });

    if (!scheduling) {
      return null;
    }

    const slot = await db.collection('slots').findOne({ _id: scheduling.slotId });
    return { slot, scheduling };
  } catch (error) {
    console.error('[Vault] Failed to get shared slot:', error);
    throw error;
  }
}

export async function updateSlotName(slotId, slotName) {
  try {
    const db = await getDB();

    const result = await db.collection('slots').updateOne(
      { _id: slotId },
      { $set: { name: slotName, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: 'Slot not found' };
    }

    return { success: true, message: 'Slot name updated successfully' };
  } catch (error) {
    console.error('[Vault] Failed to update slot name:', error);
    throw error;
  }
}

// Utility function to clean up orphaned files (files not referenced in database)
export async function cleanupOrphanedFiles() {
  try {
    const db = await getDB();
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Get all files in uploads directory
    if (!fs.existsSync(uploadsDir)) {
      console.log('[Cleanup] Uploads directory does not exist');
      return { success: true, message: 'No uploads directory to clean' };
    }
    
    const allFiles = fs.readdirSync(uploadsDir);
    
    // Get all media URLs from database
    const allSlots = await db.collection('slots').find({}).toArray();
    const allMediaUrls = new Set();
    
    for (const slot of allSlots) {
      if (slot.media) {
        for (const media of slot.media) {
          if (media.url) {
            const urlParts = media.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            allMediaUrls.add(fileName);
          }
        }
      }
    }
    
    // Delete orphaned files
    let deletedCount = 0;
    for (const file of allFiles) {
      if (!allMediaUrls.has(file)) {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`[Cleanup] Deleted orphaned file: ${file}`);
          deletedCount++;
        } catch (error) {
          console.error(`[Cleanup] Failed to delete orphaned file ${file}:`, error);
        }
      }
    }
    
    return { 
      success: true, 
      message: `Cleaned up ${deletedCount} orphaned files`,
      deletedCount,
      totalFiles: allFiles.length,
      referencedFiles: allMediaUrls.size
    };
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup orphaned files:', error);
    throw error;
  }
}

// Utility function to verify media integrity (check if database references have actual files)
export async function verifyMediaIntegrity() {
  try {
    const db = await getDB();
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const allSlots = await db.collection('slots').find({}).toArray();
    
    let missingFiles = [];
    let totalMedia = 0;
    
    for (const slot of allSlots) {
      if (slot.media) {
        for (const media of slot.media) {
          totalMedia++;
          if (media.url) {
            const urlParts = media.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = path.join(uploadsDir, fileName);
            
            if (!fs.existsSync(filePath)) {
              missingFiles.push({
                slotId: slot._id,
                slotName: slot.name,
                mediaId: media._id,
                fileName,
                url: media.url
              });
            }
          }
        }
      }
    }
    
    return {
      success: true,
      totalMedia,
      missingFiles: missingFiles.length,
      missingFileDetails: missingFiles
    };
  } catch (error) {
    console.error('[Integrity] Failed to verify media integrity:', error);
    throw error;
  }
}

export default {
  getVault,
  createSlot,
  getSlots,
  addMediaToSlot,
  addTextToSlot,
  deleteSlot,
  deleteMediaFromSlot,
  deleteTextFromSlot,
  updateTextInSlot,
  updateSlotName,
  scheduleSlot,
  getNextScheduledSlot,
  getDeliveryStatus,
  sendScheduledSlots,
  getSharedSlot,
  cleanupOrphanedFiles,
  verifyMediaIntegrity,
};
