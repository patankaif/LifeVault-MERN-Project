import express from 'express';
// import { v4 as uuidv4 } from 'uuid';
import { storagePut, storageGet } from './storage.ts';
import * as authUtils from './auth-utils.js';
import * as vaultUtils from './vault-utils.js';
import * as inactivityUtils from './inactivity-utils.js';
import { connectDB, getDB } from './db-mongo.js';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const result = await authUtils.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Send OTP for signup
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await authUtils.sendOTPToEmail(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const result = await authUtils.verifyOTP(email, otp);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register user
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    const result = await authUtils.registerUser(email, password, name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login user
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await authUtils.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send password reset OTP
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await authUtils.sendOTPToEmail(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset password with OTP
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    // Reset password (OTP was already verified in previous step)
    const result = await authUtils.resetPassword(email, newPassword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await authUtils.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== VAULT ROUTES ====================

// Get vault
router.get('/vaults/:type', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const vault = await vaultUtils.getVault(req.user.userId, type);
    if (!vault) {
      return res.status(404).json({ success: false, message: 'Vault not found' });
    }
    res.json({ success: true, vault });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get slots in vault
router.get('/vaults/:type/slots', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const vault = await vaultUtils.getVault(req.user.userId, type);
    if (!vault) {
      return res.status(404).json({ success: false, message: 'Vault not found' });
    }

    const slots = await vaultUtils.getSlots(vault._id);
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get nested slots
router.get('/slots/:slotId/children', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const slots = await vaultUtils.getSlots(null, slotId);
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create slot
router.post('/vaults/:type/slots', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { slotName, parentSlotId } = req.body;

    console.log('[Create Slot] Request body:', req.body);
    console.log('[Create Slot] slotName:', slotName);
    console.log('[Create Slot] parentSlotId:', parentSlotId);

    if (!slotName) {
      return res.status(400).json({ success: false, message: 'Slot name is required' });
    }

    // Death Vault can now have user-added slots
    // if (type === 'death') {
    //   return res.status(400).json({ success: false, message: 'Cannot create slots in Death Vault' });
    // }

    const vault = await vaultUtils.getVault(req.user.userId, type);
    if (!vault) {
      return res.status(404).json({ success: false, message: 'Vault not found' });
    }

    const result = await vaultUtils.createSlot(req.user.userId, vault._id, slotName, parentSlotId || null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete slot
router.delete('/slots/:slotId', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { vaultType } = req.body;

    const result = await vaultUtils.deleteSlot(slotId, vaultType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update slot name
router.put('/slots/:slotId', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { slotName } = req.body;

    if (!slotName) {
      return res.status(400).json({ success: false, message: 'Slot name is required' });
    }

    const result = await vaultUtils.updateSlotName(slotId, slotName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Debug endpoint to check uploads directory
router.get('/debug/uploads', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    console.log('[Debug] Checking uploads directory:', uploadsDir);
    
    const exists = fs.existsSync(uploadsDir);
    let files = [];
    
    if (exists) {
      files = fs.readdirSync(uploadsDir);
      const fileDetails = files.map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          url: `${process.env.FRONTEND_URL || 'https://lifevault-api-cmmw.onrender.com'}/uploads/${file}`
        };
      });
      
      res.json({
        success: true,
        uploadsDir,
        exists,
        files: fileDetails,
        count: files.length
      });
    } else {
      res.json({
        success: false,
        uploadsDir,
        exists: false,
        message: 'Uploads directory does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test file creation endpoint
router.post('/debug/test-upload', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const testFileName = `test-${Date.now()}.txt`;
    const testFilePath = path.join(uploadsDir, testFileName);
    const testContent = `Test file created at ${new Date().toISOString()}`;
    
    fs.writeFileSync(testFilePath, testContent);
    
    const testUrl = `${process.env.FRONTEND_URL || 'https://lifevault-api-cmmw.onrender.com'}/uploads/${testFileName}`;
    
    res.json({
      success: true,
      message: 'Test file created',
      fileName: testFileName,
      url: testUrl,
      path: testFilePath
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MEDIA ROUTES ====================

// Add media to slot
router.post('/slots/:slotId/media', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { file, mediaType } = req.body;
    const userId = req.user.userId;

    console.log(`[Upload] User: ${userId}, Slot: ${slotId}, Type: ${mediaType}, File size: ${file?.length}`);

    if (!file || !mediaType) {
      console.log('[Upload] Missing file or mediaType');
      return res.status(400).json({ success: false, message: 'File and media type are required' });
    }

    let url;
    
    try {
      // Determine the mime type
      let mimeType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';
      if (file.startsWith('data:')) {
        // Extract the mime type from the data URL if present
        const match = file.match(/^data:([^;]+);/);
        if (match) mimeType = match[1];
      }

      // Convert base64 data to buffer using base64-js or native Buffer
      // We need to strip the data:image/jpeg;base64, prefix if it exists
      const base64Data = file.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${mediaType === 'image' ? 'image' : 'video'}.${mimeType.split('/')[1] || 'bin'}`;
      
      console.log(`[Upload] Uploading ${mimeType} to MongoDB GridFS...`);
      const gridfsStorage = await import('./gridfs-storage.js');
      url = await gridfsStorage.uploadFileToGridFS(fileBuffer, fileName, mimeType);
      
      console.log(`✅ File uploaded to MongoDB successfully: ${url}`);
    } catch (error) {
      console.error('[Upload] File upload failed:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload file to database' });
    }

    // Add to slot
    console.log(`[Upload] Adding media to slot ${slotId}`);
    const result = await vaultUtils.addMediaToSlot(slotId, url, mediaType);
    console.log(`[Upload] Result:`, result);
    return res.json(result);
  } catch (error) {
    console.error('[Upload] Media upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// Serve media from GridFS
router.get('/media/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const gridfsStorage = await import('./gridfs-storage.js');
    await gridfsStorage.streamFileFromGridFS(fileId, res);
  } catch (error) {
    console.error('[Serve Media] Error serving file:', error);
    res.status(500).send('Error serving file');
  }
});

// Delete media from slot
router.delete('/slots/:slotId/media/:mediaId', verifyToken, async (req, res) => {
  try {
    const { slotId, mediaId } = req.params;
    const result = await vaultUtils.deleteMediaFromSlot(slotId, mediaId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TEXT ROUTES ====================

// Add text to slot
router.post('/slots/:slotId/text', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { textContent } = req.body;

    if (!textContent) {
      return res.status(400).json({ success: false, message: 'Text content is required' });
    }

    const result = await vaultUtils.addTextToSlot(slotId, textContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete text from slot
router.delete('/slots/:slotId/text/:textId', verifyToken, async (req, res) => {
  try {
    const { slotId, textId } = req.params;
    const result = await vaultUtils.deleteTextFromSlot(slotId, textId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update text in slot
router.put('/slots/:slotId/text/:textId', verifyToken, async (req, res) => {
  try {
    const { slotId, textId } = req.params;
    const { textContent } = req.body;
    if (!textContent) {
      return res.status(400).json({ success: false, message: 'Text content is required' });
    }
    const result = await vaultUtils.updateTextInSlot(slotId, textId, textContent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SCHEDULING ROUTES ====================

// Schedule slot
router.post('/slots/:slotId/schedule', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { recipientEmail, scheduledDate, vaultType } = req.body;

    if (!recipientEmail || !scheduledDate || !vaultType) {
      return res.status(400).json({ success: false, message: 'Recipient email, scheduled date, and vault type are required' });
    }

    const result = await vaultUtils.scheduleSlot(slotId, recipientEmail, scheduledDate, vaultType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Instant delivery for Present Vault
router.post('/slots/:slotId/deliver', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const { email, deliveryType } = req.body;
    const userId = req.user.userId;

    console.log(`[Instant Delivery] User: ${userId}, Slot: ${slotId}, Email: ${email}, Type: ${deliveryType}`);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const result = await vaultUtils.instantDelivery(slotId, email, userId);
    res.json(result);
  } catch (error) {
    console.error('[Instant Delivery] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check delivery status
router.get('/slots/:slotId/delivery-status', verifyToken, async (req, res) => {
  try {
    const { slotId } = req.params;
    const result = await vaultUtils.getDeliveryStatus(slotId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get next scheduled slot
router.get('/next-scheduled', verifyToken, async (req, res) => {
  try {
    const scheduling = await vaultUtils.getNextScheduledSlot(req.user.userId);
    res.json({ success: true, scheduling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get shared slot
router.get('/shared-vault/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params;
    const result = await vaultUtils.getSharedSlot(accessToken);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Shared slot not found or link expired' });
    }
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== INACTIVITY ROUTES ====================

// Confirm user is alive
router.post('/confirm-alive/:confirmationToken', async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const result = await inactivityUtils.confirmUserAlive(confirmationToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get inactivity status
router.get('/inactivity-status', verifyToken, async (req, res) => {
  try {
    const status = await inactivityUtils.getInactivityStatus(req.user.userId);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user account with OTP verification
router.post('/auth/delete-account', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const result = await authUtils.deleteUserAccount(req.user.userId, req.user.email, otp);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MAINTENANCE ROUTES ====================

// Clean up orphaned files
router.post('/maintenance/cleanup-files', verifyToken, async (req, res) => {
  try {
    const result = await vaultUtils.cleanupOrphanedFiles();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Death Vault endpoints
router.post('/vaults/death/accept-rules', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = await getDB();
    
    // Update user's death vault rules acceptance status
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { deathVaultRulesAccepted: true, updatedAt: new Date() } }
    );
    
    res.json({ success: true, message: 'Death Vault rules accepted successfully' });
  } catch (error) {
    console.error('[API] Failed to accept Death Vault rules:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/vaults/death/rules-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = await getDB();
    
    // Get user's death vault rules acceptance status
    const user = await db.collection('users').findOne({ _id: userId });
    const rulesAccepted = user?.deathVaultRulesAccepted || false;
    
    res.json({ success: true, rulesAccepted });
  } catch (error) {
    console.error('[API] Failed to get Death Vault rules status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify media integrity
router.get('/maintenance/verify-media', verifyToken, async (req, res) => {
  try {
    const result = await vaultUtils.verifyMediaIntegrity();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
