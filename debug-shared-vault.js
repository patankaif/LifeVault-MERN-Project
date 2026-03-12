import { getDB } from './server/db-mongo.js';

async function debugSharedVault() {
  try {
    const db = await getDB();
    const accessToken = '0caca1aa-a7f9-49af-b8cc-8ba0e8082fca';
    
    console.log(`Checking shared vault token: ${accessToken}`);
    
    // Check if scheduling exists
    const scheduling = await db.collection('scheduling').findOne({
      accessToken,
      accessTokenExpiresAt: { $gt: new Date() },
    });
    
    if (!scheduling) {
      console.log('❌ Scheduling not found or expired');
      
      // Check if token exists at all (even expired)
      const anyScheduling = await db.collection('scheduling').findOne({
        accessToken,
      });
      
      if (anyScheduling) {
        console.log('Found scheduling but expired:');
        console.log('- Created:', anyScheduling.createdAt);
        console.log('- Expires:', anyScheduling.accessTokenExpiresAt);
        console.log('- Now:', new Date());
        console.log('- Sent:', anyScheduling.sent);
      } else {
        console.log('❌ No scheduling found with this token');
      }
    } else {
      console.log('✅ Found valid scheduling:');
      console.log('- Slot ID:', scheduling.slotId);
      console.log('- Recipient:', scheduling.recipientEmail);
      console.log('- Created:', scheduling.createdAt);
      console.log('- Expires:', scheduling.accessTokenExpiresAt);
      console.log('- Sent:', scheduling.sent);
      
      // Check the slot
      const slot = await db.collection('slots').findOne({ _id: scheduling.slotId });
      if (slot) {
        console.log('✅ Found slot:');
        console.log('- Name:', slot.name);
        console.log('- Media count:', slot.media?.length || 0);
        console.log('- Text count:', slot.texts?.length || 0);
      } else {
        console.log('❌ Slot not found');
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  process.exit(0);
}

debugSharedVault();
