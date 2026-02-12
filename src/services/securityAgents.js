const BLOCKED_WORDS = ['hakaret', 'küfür', 'aptal', 'idiot', 'stupid'];
const SELF_HARM_HINTS = ['kendime zarar', 'intihar', 'ölmek istiyorum'];

function hasPattern(text, patterns) {
  const normalized = String(text || '').toLowerCase();
  return patterns.some((p) => normalized.includes(p));
}

function detectPii(text) {
  const value = String(text || '');
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
  const phone = /\+?\d[\d\s-]{7,}\d/.test(value);
  return { email, phone, hit: email || phone };
}

export function moderationAgent(text) {
  const toxic = hasPattern(text, BLOCKED_WORDS);
  const selfHarm = hasPattern(text, SELF_HARM_HINTS);
  return {
    name: 'moderation-agent',
    toxic,
    selfHarm,
    action: selfHarm ? 'escalate' : toxic ? 'warn' : 'allow'
  };
}

export function privacyAgent(text) {
  const pii = detectPii(text);
  return {
    name: 'privacy-agent',
    pii,
    action: pii.hit ? 'mask' : 'allow'
  };
}

export function trustScoreAgent({ moderation, privacy }) {
  let score = 100;
  if (moderation.toxic) score -= 25;
  if (moderation.selfHarm) score -= 40;
  if (privacy.pii.hit) score -= 20;
  return {
    name: 'trust-score-agent',
    score: Math.max(0, score)
  };
}

export function runSecurityAgents(text) {
  const moderation = moderationAgent(text);
  const privacy = privacyAgent(text);
  const trust = trustScoreAgent({ moderation, privacy });

  return {
    moderation,
    privacy,
    trust,
    safeToPublish: moderation.action === 'allow' && privacy.action === 'allow'
  };
}
