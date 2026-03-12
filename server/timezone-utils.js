// Timezone utility for IST (Indian Standard Time)
export function getCurrentISTTime() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset + (now.getTimezoneOffset() * 60 * 1000));
  return istTime;
}

export function toISTString(date) {
  const istDate = new Date(date);
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(istDate.getTime() + istOffset + (istDate.getTimezoneOffset() * 60 * 1000));
  return istTime.toISOString();
}

export function getCurrentISTISOString() {
  return toISTString(new Date());
}

// For database storage, store in IST
export function getISTDateForDB(date = new Date()) {
  const istTime = getCurrentISTTime();
  return new Date(istTime);
}
