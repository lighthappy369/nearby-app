export function generateIceBreakers(sourceUser, targetUser, breakdown) {
  const themes = [
    sharedTheme(sourceUser.interests, targetUser.interests, "interest"),
    sharedTheme(sourceUser.values, targetUser.values, "value"),
    sharedTheme(sourceUser.lifestyle, targetUser.lifestyle, "lifestyle")
  ].filter(Boolean);

  const starter = themes[0] || "new experiences";

  return [
    `I saw we both care about ${starter}. What got you into it?`,
    `Our compatibility on values is ${breakdown.values}%. What's one non-negotiable value for you in relationships?`,
    "If we had one free Sunday in the city, how would you plan it?"
  ];
}

function sharedTheme(a = [], b = [], fallbackLabel) {
  const setB = new Set(b.map((v) => v.toLowerCase()));
  for (const item of a) {
    if (setB.has(String(item).toLowerCase())) {
      return item;
    }
  }
  return fallbackLabel;
}

export function explainScore(breakdown) {
  const strengths = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name)
    .join(" & ");

  return `AI değerlendirmesine göre en güçlü uyum alanları: ${strengths}.`;
}
