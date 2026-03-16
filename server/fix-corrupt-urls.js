import { getDB } from './db-mongo.js';

async function run() {
  try {
    const db = await getDB();
    console.log('Searching for corrupted localhost URLs inside MongoDB...');
    
    // Find all slots with media that have localhost URLs OR Render URLs (we want relative paths for all moving forward)
    const slots = await db.collection('slots').find({
      'media.url': { $regex: 'localhost|lifevault-api-cmmw.onrender.com' }
    }).toArray();
    
    console.log(`Found ${slots.length} slots with full absolute URLs to fix.`);
    
    for (const slot of slots) {
      console.log(`Fixing slot: ${slot.name} (${slot._id})`);
      
      const updatedMedia = slot.media.map(media => {
        if (media.url.includes('localhost') || media.url.includes('lifevault-api-cmmw.onrender.com')) {
          const filename = media.url.split('/').pop();
          const newUrl = `/uploads/${filename}`;
          console.log(`  Converting: ${media.url} -> ${newUrl}`);
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
    }
    
    console.log('\n✅ Successfully converted media URLs to relative paths!');
  } catch (err) {
    console.error('Failed to run migration:', err);
  }
  process.exit(0);
}

run();
