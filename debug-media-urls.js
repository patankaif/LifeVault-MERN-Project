import { getDB } from './server/db-mongo.js';

async function debugMediaUrls() {
  try {
    const db = await getDB();
    
    // Get a slot with media
    const slotWithMedia = await db.collection('slots').findOne({
      'media.0': { $exists: true }
    });
    
    if (slotWithMedia) {
      console.log('Found slot with media:');
      console.log('Slot ID:', slotWithMedia._id);
      console.log('Slot name:', slotWithMedia.name);
      console.log('Media URLs:');
      slotWithMedia.media.forEach((media, index) => {
        console.log(`  ${index + 1}. Type: ${media.type}, URL: ${media.url}`);
      });
    } else {
      console.log('No slots with media found');
      
      // Get any slot to check structure
      const anySlot = await db.collection('slots').findOne();
      if (anySlot) {
        console.log('Sample slot structure:');
        console.log('- Media count:', anySlot.media?.length || 0);
        if (anySlot.media && anySlot.media.length > 0) {
          anySlot.media.forEach((media, index) => {
            console.log(`  Media ${index + 1}:`, media);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  process.exit(0);
}

debugMediaUrls();
