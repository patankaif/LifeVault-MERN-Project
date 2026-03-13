import { getDB } from './server/db-mongo.js';

async function checkRecentUploads() {
  try {
    const db = await getDB();
    
    console.log('=== CHECKING RECENT UPLOADS ===');
    
    // Get recent slots with media
    const recentSlots = await db.collection('slots')
      .find({ 'media.0': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();
    
    console.log(`Found ${recentSlots.length} recent slots with media:`);
    
    recentSlots.forEach((slot, index) => {
      console.log(`\n${index + 1}. Slot: ${slot.name}`);
      console.log(`   Updated: ${slot.updatedAt}`);
      console.log(`   Media count: ${slot.media?.length || 0}`);
      
      slot.media.forEach((media, mediaIndex) => {
        console.log(`   Media ${mediaIndex + 1}:`);
        console.log(`     Type: ${media.type}`);
        console.log(`     URL: ${media.url}`);
        console.log(`     Uploaded: ${media.uploadedAt}`);
        console.log(`     ID: ${media._id}`);
      });
    });
    
    // Check if there are any failed upload attempts in logs
    console.log('\n=== CHECKING UPLOAD PATTERNS ===');
    
    // Look for slots that might have failed uploads
    const allRecentSlots = await db.collection('slots')
      .find({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();
    
    console.log(`\nRecent slots (last 24 hours):`);
    allRecentSlots.forEach((slot, index) => {
      console.log(`${index + 1}. ${slot.name} - Media: ${slot.media?.length || 0} - Updated: ${slot.updatedAt}`);
    });
    
  } catch (error) {
    console.error('Check failed:', error);
  }
  
  process.exit(0);
}

checkRecentUploads();
