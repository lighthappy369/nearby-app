function normalizeTags(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function overlapRatio(a = [], b = []) {
  const left = normalizeTags(a);
  const right = normalizeTags(b);
  if (!left.length || !right.length) return 0;

  const setA = new Set(left);
  const setB = new Set(right);
  let common = 0;
  for (const val of setA) {
    if (setB.has(val)) common += 1;
  }
  return common / Math.max(setA.size, setB.size);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function locationScore(a, b) {
  if (!a.location || !b.location) return 0.5;
  const { lat: lat1, lon: lon1 } = a.location;
  const { lat: lat2, lon: lon2 } = b.location;
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return 0.5;

  const distance = haversineKm(lat1, lon1, lat2, lon2);
  if (distance <= 3) return 1;
  if (distance <= 10) return 0.8;
  if (distance <= 25) return 0.6;
  if (distance <= 50) return 0.35;
  return 0.1;
}

export function calculateCompatibility(userA, userB) {
  const interest = overlapRatio(userA.interests, userB.interests);
  const values = overlapRatio(userA.values, userB.values);
  const lifestyle = overlapRatio(userA.lifestyle, userB.lifestyle);
  const loc = locationScore(userA, userB);

  const weighted = (interest * 0.3) + (values * 0.35) + (lifestyle * 0.2) + (loc * 0.15);
  const score = Math.round(weighted * 100);

  return {
    score,
    breakdown: {
      interest: Math.round(interest * 100),
      values: Math.round(values * 100),
      lifestyle: Math.round(lifestyle * 100),
      location: Math.round(loc * 100)
    }
  };
}

export function rankCandidates(user, candidates) {
  return candidates
    .map((candidate) => ({
      candidate,
      ...calculateCompatibility(user, candidate)
    }))
    .sort((a, b) => b.score - a.score);
}
