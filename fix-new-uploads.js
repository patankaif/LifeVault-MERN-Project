import { getDB } from './server/db-mongo.js';

async function fixNewUploads() {
  try {
    const db = await getDB();
    const correctBaseUrl = 'https://lifevault-api-cmmw.onrender.com';
    
    console.log('=== FIXING NEW WRONG UPLOADS ===');
    
    // Find all slots with wrong URLs from the last few hours
    const recentWrongUrls = await db.collection('slots').find({
      'media.url': { $regex: 'lifevault-frontend.onrender.com' },
      updatedAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // Last 6 hours
    }).toArray();
    
    console.log(`Found ${recentWrongUrls.length} slots with wrong URLs in last 6 hours`);
    
    let totalFixed = 0;
    
    for (const slot of recentWrongUrls) {
      console.log(`\nFixing slot: ${slot.name}`);
      console.log(`Updated: ${slot.updatedAt}`);
      
      const updatedMedia = slot.media.map(media => {
        if (media.url.includes('lifevault-frontend.onrender.com')) {
          const filename = media.url.split('/').pop();
          const newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`  ${media.url}`);
          console.log(`  -> ${newUrl}`);
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
      
      totalFixed++;
      console.log(`  ✅ Fixed`);
    }
    
    console.log(`\n✅ Fixed ${totalFixed} slots with new wrong uploads`);
    
    // Check the specific files mentioned in the error
    console.log('\n=== CHECKING SPECIFIC FILES ===');
    const specificFiles = ['1773421020842-kppbf5p78.jpg', '1773421052134-0fvgxyxce.jpg'];
    
    for (const filename of specificFiles) {
      const slotWithFile = await db.collection('slots').findOne({
        'media.url': { $regex: filename }
      });
      
      if (slotWithFile) {
        console.log(`File ${filename} found in slot: ${slotWithFile.name}`);
        const media = slotWithFile.media.find(m => m.url.includes(filename));
        console.log(`Current URL: ${media.url}`);
      } else {
        console.log(`File ${filename} not found in database`);
      }
    }
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  
  process.exit(0);
}

fixNewUploads();
