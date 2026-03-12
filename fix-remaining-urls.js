import { getDB } from './server/db-mongo.js';

async function fixRemainingUrls() {
  try {
    const db = await getDB();
    const correctBaseUrl = 'https://lifevault-api-cmmw.onrender.com';
    const wrongDomain = 'lifevault-frontend.onrender.com';
    
    console.log('=== FIXING REMAINING WRONG URLs ===');
    
    // Find all slots with media that still have wrong domain
    const slotsWithWrongUrls = await db.collection('slots').find({
      'media.url': { $regex: wrongDomain }
    }).toArray();
    
    console.log(`Found ${slotsWithWrongUrls.length} slots with wrong domain URLs`);
    
    let totalFixed = 0;
    
    for (const slot of slotsWithWrongUrls) {
      console.log(`\nFixing slot: ${slot.name} (${slot._id})`);
      
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
      
      // Update the slot
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
      
      totalFixed++;
      console.log(`  ✅ Updated`);
    }
    
    // Also check for any remaining relative URLs
    const slotsWithRelativeUrls = await db.collection('slots').find({
      'media.url': { $regex: '^/uploads/' }
    }).toArray();
    
    console.log(`\nFound ${slotsWithRelativeUrls.length} slots with relative URLs`);
    
    for (const slot of slotsWithRelativeUrls) {
      console.log(`\nFixing relative URLs in slot: ${slot.name}`);
      
      const updatedMedia = slot.media.map(media => {
        if (media.url.startsWith('/uploads/')) {
          const filename = media.url.replace('/uploads/', '');
          const newUrl = `${correctBaseUrl}/uploads/${filename}`;
          console.log(`  ${media.url} -> ${newUrl}`);
          return { ...media, url: newUrl };
        }
        return media;
      });
      
      await db.collection('slots').updateOne(
        { _id: slot._id },
        { $set: { media: updatedMedia } }
      );
      
      totalFixed++;
    }
    
    console.log(`\n✅ Fixed ${totalFixed} slots with URL issues`);
    
    // Verify the fix by checking a few slots
    const sampleSlots = await db.collection('slots')
      .find({ 'media.0': { $exists: true } })
      .limit(3)
      .toArray();
    
    console.log('\n=== VERIFICATION ===');
    sampleSlots.forEach((slot, index) => {
      console.log(`Slot ${index + 1}: ${slot.name}`);
      slot.media.slice(0, 2).forEach((media, mediaIndex) => {
        console.log(`  Media ${mediaIndex + 1}: ${media.url}`);
      });
    });
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  
  process.exit(0);
}

fixRemainingUrls();
