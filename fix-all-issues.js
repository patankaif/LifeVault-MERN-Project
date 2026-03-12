import { getDB } from './server/db-mongo.js';

async function fixAllIssues() {
  try {
    const db = await getDB();
    const correctBaseUrl = 'https://lifevault-api-cmmw.onrender.com';
    
    console.log('=== FIXING ALL MEDIA URL ISSUES ===');
    
    // Find all slots with media and fix URLs
    const allSlotsWithMedia = await db.collection('slots')
      .find({ 'media.0': { $exists: true } })
      .toArray();
    
    console.log(`Found ${allSlotsWithMedia.length} slots with media to fix`);
    
    let totalFixed = 0;
    
    for (const slot of allSlotsWithMedia) {
      let needsUpdate = false;
      const updatedMedia = slot.media.map(media => {
        let newUrl = media.url;
        
        // Fix relative URLs
        if (media.url.startsWith('/uploads/')) {
          const filename = media.url.replace('/uploads/', '');
          newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`  Fixed relative: ${media.url} -> ${newUrl}`);
          needsUpdate = true;
        }
        
        // Fix wrong domain URLs
        if (media.url.includes('lifevault-frontend.onrender.com')) {
          const filename = media.url.split('/').pop();
          newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`  Fixed wrong domain: ${media.url} -> ${newUrl}`);
          needsUpdate = true;
        }
        
        // Fix localhost URLs
        if (media.url.includes('localhost:3001')) {
          const filename = media.url.split('/').pop();
          newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`  Fixed localhost: ${media.url} -> ${newUrl}`);
          needsUpdate = true;
        }
        
        return { ...media, url: newUrl };
      });
      
      if (needsUpdate) {
        await db.collection('slots').updateOne(
          { _id: slot._id },
          { $set: { media: updatedMedia } }
        );
        console.log(`✅ Updated slot: ${slot.name}`);
        totalFixed++;
      }
    }
    
    console.log(`\n✅ Fixed ${totalFixed} slots with media URL issues`);
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  
  process.exit(0);
}

fixAllIssues();
