import { getDB } from './server/db-mongo.js';

async function fixMediaUrls() {
  try {
    const db = await getDB();
    const baseUrl = 'https://lifevault-api-cmmw.onrender.com';
    
    console.log('Fixing media URLs...');
    
    // Find all slots with media that have localhost URLs
    const slotsWithLocalhostMedia = await db.collection('slots').find({
      'media.url': { $regex: 'localhost' }
    }).toArray();
    
    console.log(`Found ${slotsWithLocalhostMedia.length} slots with localhost media URLs`);
    
    for (const slot of slotsWithLocalhostMedia) {
      console.log(`\nUpdating slot: ${slot.name} (${slot._id})`);
      
      // Update each media URL
      const updatedMedia = slot.media.map(media => {
        if (media.url.includes('localhost')) {
          const filename = media.url.split('/').pop(); // Get just the filename
          const newUrl = `${baseUrl}/uploads/${filename}`;
          console.log(`  ${media.url} -> ${newUrl}`);
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      // Update the slot
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
    }
    
    console.log('\n✅ Media URLs fixed successfully!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  
  process.exit(0);
}

fixMediaUrls();
