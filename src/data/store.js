export const users = new Map();
export const matches = [];

export function saveUser(user) {
  users.set(user.id, user);
  return user;
}

export function findUserById(id) {
  return users.get(id) || null;
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
