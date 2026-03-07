import dotenv from 'dotenv';
dotenv.config();

import { getDB } from './server/db-mongo.js';

async function checkScheduledSlots() {
  try {
    const db = await getDB();
    console.log('Checking scheduled slots in database...');
    
    // Find all scheduling records
    const schedulings = await db.collection('scheduling').find({}).toArray();
    console.log(`Found ${schedulings.length} scheduling records:`);
    
    for (const scheduling of schedulings) {
      console.log(`\n--- Scheduling Record ${schedulings.indexOf(scheduling) + 1} ---`);
      console.log(`ID: ${scheduling._id}`);
      console.log(`Slot ID: ${scheduling.slotId}`);
      console.log(`Recipient Email: ${scheduling.recipientEmail}`);
      console.log(`Scheduled Date: ${scheduling.scheduledDate}`);
      console.log(`Sent: ${scheduling.sent}`);
      console.log(`Created: ${scheduling.createdAt}`);
    }
    
    // Find all slots
    const slots = await db.collection('slots').find({}).toArray();
    console.log(`\nFound ${slots.length} slots in database:`);
    
    for (const slot of slots) {
      console.log(`\n--- Slot ${slots.indexOf(slot) + 1} ---`);
      console.log(`ID: ${slot._id}`);
      console.log(`Name: ${slot.name}`);
      console.log(`Scheduled Date: ${slot.scheduledDate}`);
      console.log(`Scheduled Email: ${slot.scheduledEmail}`);
    }
    
  } catch (error) {
    console.error('Error checking scheduled slots:', error);
  }
}

checkScheduledSlots();
