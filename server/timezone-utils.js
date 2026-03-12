// Timezone utility for IST (Indian Standard Time)
export function getCurrentISTTime() {
  const now = new Date();
  // IST is UTC+5:30, but we need to work with the actual UTC time
  // The server runs in UTC, so we just add 5.5 hours to get IST
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime;
}

export function toISTString(date) {
  const utcDate = new Date(date);
  // Convert UTC to IST by adding 5.5 hours
  const istTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  return istTime.toISOString();
}

export function getCurrentISTISOString() {
  return toISTString(new Date());
}

// For database storage, store the actual UTC time but display in IST
export function getISTDateForDB(date = new Date()) {
  // Store as UTC but we'll compare using IST time in sendScheduledSlots
  return new Date(date);
}

// Convert IST input to UTC for storage
export function convertISTToUTC(istDateString) {
  const istDate = new Date(istDateString);
  // Subtract 5.5 hours to convert IST to UTC
  const utcTime = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
  return utcTime;
}
