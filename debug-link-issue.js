import { getDB } from './server/db-mongo.js';

async function debugLinkIssue() {
  try {
    const db = await getDB();
    const now = new Date();
    
    console.log('=== DEBUGGING SHARED LINK ISSUE ===');
    console.log('Current time:', now.toISOString());
    console.log('');
    
    // Check recent schedulings (last 24 hours)
    const recentSchedulings = await db.collection('scheduling')
      .find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    console.log(`Found ${recentSchedulings.length} recent schedulings:`);
    
    for (const scheduling of recentSchedulings) {
      console.log('\n--- Scheduling ---');
      console.log('ID:', scheduling._id);
      console.log('Access Token:', scheduling.accessToken);
      console.log('Slot ID:', scheduling.slotId);
      console.log('Recipient:', scheduling.recipientEmail);
      console.log('Created:', scheduling.createdAt);
      console.log('Expires:', scheduling.accessTokenExpiresAt);
      console.log('Sent:', scheduling.sent);
      console.log('Expired?', new Date() > new Date(scheduling.accessTokenExpiresAt));
      
      // Test the getSharedSlot function logic
      const wouldPassFilter = 
        scheduling.accessToken === scheduling.accessToken && // This would be true in the actual query
        new Date(scheduling.accessTokenExpiresAt) > now;
      
      console.log('Would pass filter?', wouldPassFilter);
      
      if (scheduling.slotId) {
        const slot = await db.collection('slots').findOne({ _id: scheduling.slotId });
        console.log('Slot exists?', !!slot);
        if (slot) {
          console.log('Slot name:', slot.name);
          console.log('Slot media count:', slot.media?.length || 0);
          console.log('Slot text count:', slot.texts?.length || 0);
        }
      }
    }
    
    // Also check if there are any schedulings with the token from the URL
    console.log('\n=== CHECKING SPECIFIC TOKENS ===');
    
    // Get all unique access tokens from recent schedulings
    const tokens = recentSchedulings.map(s => s.accessToken);
    console.log('Available tokens:', tokens);
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  process.exit(0);
}

debugLinkIssue();
