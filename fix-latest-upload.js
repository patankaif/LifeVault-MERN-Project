import { getDB } from './server/db-mongo.js';

async function fixLatestUpload() {
  try {
    const db = await getDB();
    const correctBaseUrl = 'https://lifevault-api-cmmw.onrender.com';
    
    console.log('=== FIXING LATEST UPLOAD ===');
    
    // Find the "Sundayy" slot specifically
    const sundayySlot = await db.collection('slots').findOne({ name: 'Sundayy' });
    
    if (sundayySlot && sundayySlot.media && sundayySlot.media.length > 0) {
      console.log(`Found slot: ${sundayySlot.name}`);
      
      const updatedMedia = sundayySlot.media.map(media => {
        if (media.url.includes('lifevault-frontend.onrender.com')) {
          const filename = media.url.split('/').pop();
          const newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`Fixing: ${media.url}`);
          console.log(`To: ${newUrl}`);
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      await db.collection('slots').updateOne(
        { _id: sundayySlot._id },
        { $set: { media: updatedMedia } }
      );
      
      console.log('✅ Fixed Sundayy slot');
    } else {
      console.log('Sundayy slot not found or has no media');
    }
    
    // Check for any other recent wrong URLs
    const recentWrongUrls = await db.collection('slots').find({
      'media.url': { $regex: 'lifevault-frontend.onrender.com' },
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).toArray();
    
    console.log(`\nFound ${recentWrongUrls.length} more slots with wrong URLs in last 24h`);
    
    for (const slot of recentWrongUrls) {
      console.log(`Fixing: ${slot.name}`);
      const updatedMedia = slot.media.map(media => {
        if (media.url.includes('lifevault-frontend.onrender.com')) {
          const filename = media.url.split('/').pop();
          const newUrl = `${correctBaseUrl}/uploads/${filename}`;
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
    }
    
    console.log('✅ All recent uploads fixed!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  
  process.exit(0);
}

fixLatestUpload();
