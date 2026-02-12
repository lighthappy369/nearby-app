export const users = new Map();
export const usersByEmail = new Map();
export const matches = [];
export const subscriptions = new Map();
export const events = [];

export function saveUser(user) {
  users.set(user.id, user);
  if (user.email) usersByEmail.set(user.email.toLowerCase(), user.id);
  return user;
}

export function findUserById(id) {
  return users.get(id) || null;
}

export function findUserByEmail(email) {
  const id = usersByEmail.get(String(email || '').toLowerCase());
  return id ? users.get(id) || null : null;
}

export function listOtherUsers(id) {
  return [...users.values()].filter((user) => user.id !== id);
}

export function saveMatch(match) {
  matches.push(match);
  return match;
}

export function listMatchesForUser(userId) {
  return matches.filter((m) => m.userA === userId || m.userB === userId);
}

export function setSubscription(userId, status, payload = {}) {
  const next = {
    userId,
    status,
    updatedAt: new Date().toISOString(),
    ...payload
  };
  subscriptions.set(userId, next);
  return next;
}

export function getSubscription(userId) {
  return subscriptions.get(userId) || null;
}

export function saveEvent(event) {
  const row = { id: `ev_${events.length + 1}`, createdAt: new Date().toISOString(), ...event };
  events.push(row);
  return row;
}

export function listEvents(limit = 50) {
  return events.slice(-Math.max(1, Number(limit) || 50));
}


export const communityMessages = [];

export function saveCommunityMessage(message) {
  const row = { id: `cm_${communityMessages.length + 1}`, createdAt: new Date().toISOString(), ...message };
  communityMessages.push(row);
  return row;
}

export function listCommunityMessages(limit = 100) {
  return communityMessages.slice(-Math.max(1, Number(limit) || 100));
}
