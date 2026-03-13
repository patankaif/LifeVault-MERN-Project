import { getDB } from './server/db-mongo.js';

async function fixEmergencyUrls() {
  try {
    const db = await getDB();
    const correctBaseUrl = 'https://lifevault-api-cmmw.onrender.com';
    const wrongDomain = 'lifevault-frontend.onrender.com';
    
    console.log('=== EMERGENCY URL FIX ===');
    
    // Find all slots with wrong URLs (last few hours)
    const slotsWithWrongUrls = await db.collection('slots').find({
      'media.url': { $regex: wrongDomain }
    }).toArray();
    
    console.log(`Found ${slotsWithWrongUrls.length} slots with wrong URLs`);
    
    let totalFixed = 0;
    
    for (const slot of slotsWithWrongUrls) {
      console.log(`\nFixing slot: ${slot.name}`);
      
      const updatedMedia = slot.media.map(media => {
        if (media.url.includes(wrongDomain)) {
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
    
    console.log(`\n✅ Fixed ${totalFixed} slots`);
    
    // Check the specific files mentioned in error
    const specificFiles = [
      '1773422055045-qnldmu4s7.jpg',
      '1773422142917-lfvb5tsdz.jpg', 
      '1773422580819-kdlippskx.jpg',
      '1773422600229-2zfgdt0yc.jpg'
    ];
    
    console.log('\n=== CHECKING SPECIFIC FILES ===');
    for (const filename of specificFiles) {
      const slotWithFile = await db.collection('slots').findOne({
        'media.url': { $regex: filename }
      });
      
      if (slotWithFile) {
        const media = slotWithFile.media.find(m => m.url.includes(filename));
        console.log(`${filename}: ${media.url}`);
      } else {
        console.log(`${filename}: Not found`);
      }
    }
    
  } catch (error) {
    console.error('Emergency fix failed:', error);
  }
  
  process.exit(0);
}

fixEmergencyUrls();
