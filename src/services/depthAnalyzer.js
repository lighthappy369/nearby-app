function keywordScore(text, words) {
  const normalized = String(text || '').toLowerCase();
  let hits = 0;
  for (const word of words) if (normalized.includes(word)) hits += 1;
  return hits;
}

export function analyzeSoulDepth({ text = '', jung = null }) {
  const introspection = keywordScore(text, ['neden', 'why', 'içsel', 'inner', 'anlam', 'meaning']);
  const emotional = keywordScore(text, ['hissed', 'feel', 'duygu', 'heart', 'kalp', 'üzgün', 'happy']);
  const relational = keywordScore(text, ['ilişki', 'relationship', 'bağ', 'trust', 'sadakat', 'partner']);

  const depth = Math.min(100, 35 + introspection * 12 + emotional * 10 + relational * 8);
  const stability = jung?.quality?.consistency ?? 60;
  const completion = jung?.quality?.completionRate ?? 0;

  const profile = {
    depth,
    emotionalClarity: Math.min(100, 30 + emotional * 14),
    introspectionLevel: Math.min(100, 25 + introspection * 15),
    relationalReadiness: Math.min(100, 30 + relational * 12),
    stability,
    completion
  };

  const summary = depth >= 75
    ? 'Derin içgörüye sahip, duygusal olarak anlamlı bağ kurmaya hazır bir profil.'
    : depth >= 55
      ? 'İlişki motivasyonu güçlü, içsel farkındalık gelişim aşamasında bir profil.'
      : 'Yüzeysel etkileşime yatkın; daha derin sorularla netlik artabilir.';

  return {
    profile,
    summary,
    recommendations: [
      'Günde 10 dakika içsel farkındalık günlüğü tut.',
      'Sohbette değerler ve sınırlar hakkında erken konuş.',
      'Eşleşmelerde acele karar yerine 24 saat kuralı uygula.'
    ]
  };
}
