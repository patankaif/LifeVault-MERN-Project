import { getDB } from './server/db-mongo.js';

async function debugScheduledJobs() {
  try {
    const db = await getDB();
    const now = new Date();
    console.log('Current server time:', now.toISOString());
    
    // Check all scheduled slots
    const allScheduled = await db.collection('scheduling').find({}).toArray();
    console.log(`Total scheduled slots: ${allScheduled.length}`);
    
    // Check due slots
    const dueSlots = await db.collection('scheduling').find({
      scheduledDate: { $lte: now },
      sent: false,
    }).toArray();
    
    console.log(`Due slots (not sent): ${dueSlots.length}`);
    
    if (dueSlots.length > 0) {
      dueSlots.forEach((slot, index) => {
        console.log(`\nSlot ${index + 1}:`);
        console.log('- ID:', slot._id);
        console.log('- Scheduled Date:', slot.scheduledDate);
        console.log('- Recipient:', slot.recipientEmail);
        console.log('- Sent:', slot.sent);
        console.log('- Access Token:', slot.accessToken);
      });
    }
    
    // Check recent sent slots
    const recentSent = await db.collection('scheduling').find({
      sent: true,
      sentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).toArray();
    
    console.log(`\nRecently sent slots (last 24h): ${recentSent.length}`);
    recentSent.forEach((slot, index) => {
      console.log(`\nSent Slot ${index + 1}:`);
      console.log('- ID:', slot._id);
      console.log('- Sent At:', slot.sentAt);
      console.log('- Recipient:', slot.recipientEmail);
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
  
  process.exit(0);
}

debugScheduledJobs();
