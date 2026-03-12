import { getDB } from './server/db-mongo.js';
import fs from 'fs';
import path from 'path';

async function debugUploadProcess() {
  try {
    const db = await getDB();
    
    console.log('=== DEBUGGING UPLOAD PROCESS ===');
    
    // Check if uploads directory exists and what's in it
    const uploadsDir = path.join(process.cwd(), 'uploads');
    console.log('Uploads directory path:', uploadsDir);
    console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log('Files in uploads directory:', files);
      
      // Check first 5 files
      files.slice(0, 5).forEach((file, index) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`${index + 1}. ${file} - Size: ${stats.size} bytes - Modified: ${stats.mtime}`);
      });
    }
    
    // Check recent slots with media
    const recentSlots = await db.collection('slots')
      .find({ 'media.0': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(3)
      .toArray();
    
    console.log('\n=== RECENT SLOTS WITH MEDIA ===');
    recentSlots.forEach((slot, index) => {
      console.log(`\nSlot ${index + 1}: ${slot.name}`);
      slot.media.forEach((media, mediaIndex) => {
        console.log(`  Media ${mediaIndex + 1}:`);
        console.log(`    Type: ${media.type}`);
        console.log(`    URL: ${media.url}`);
        console.log(`    ID: ${media._id}`);
        console.log(`    Uploaded: ${media.uploadedAt}`);
      });
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  process.exit(0);
}

debugUploadProcess();
