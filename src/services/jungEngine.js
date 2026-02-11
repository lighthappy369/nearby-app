const QUESTIONS = [
  {
    id: 'q1',
    text: 'Yeni insanlarla tanışırken enerjin artar.',
    dimension: 'EI',
    forward: 'E'
  },
  {
    id: 'q2',
    text: 'Karar verirken mantık yerine hislerin daha ağır basar.',
    dimension: 'TF',
    forward: 'F'
  },
  {
    id: 'q3',
    text: 'Planlı ilerlemek seni rahatlatır.',
    dimension: 'JP',
    forward: 'J'
  },
  {
    id: 'q4',
    text: 'Detaylardan çok büyük resme odaklanırsın.',
    dimension: 'SN',
    forward: 'N'
  },
  {
    id: 'q5',
    text: 'Uzun sohbetler yerine yalnız kalmak sana iyi gelir.',
    dimension: 'EI',
    forward: 'I'
  },
  {
    id: 'q6',
    text: 'İlişkilerde empati, kurallardan daha önemlidir.',
    dimension: 'TF',
    forward: 'F'
  },
  {
    id: 'q7',
    text: 'Esneklik, katı plana göre daha değerlidir.',
    dimension: 'JP',
    forward: 'P'
  },
  {
    id: 'q8',
    text: 'Somut gerçekler, sezgisel çıkarımlardan daha güvenlidir.',
    dimension: 'SN',
    forward: 'S'
  },
  {
    id: 'q9',
    text: 'Sosyal ortamlarda konuşmayı genelde sen başlatırsın.',
    dimension: 'EI',
    forward: 'E'
  },
  {
    id: 'q10',
    text: 'Kararsız kaldığında önce veriye bakarsın.',
    dimension: 'TF',
    forward: 'T'
  }
];

const ARCHETYPE_COPY = {
  ENFJ: 'Empatik lider: insanları bir araya getirir ve duygusal uyuma önem verir.',
  INFP: 'İdealist bağ kurucu: derinlik, anlam ve sadakat arar.',
  ESTJ: 'Yapı kurucu: netlik, güven ve istikrarı önceler.',
  default: 'Dengeli profil: uyumlu iletişim ve karşılıklı gelişim odaklı.'
};

export function listJungQuestions() {
  return QUESTIONS.map(({ id, text }) => ({ id, text, scale: [1, 2, 3, 4, 5] }));
}

function applyAnswer(score, dimension, forward, value) {
  const centered = Number(value) - 3;
  if (!Number.isFinite(centered)) return;
  const dir = centered >= 0 ? forward : oppositeLetter(forward);
  score[dir] += Math.abs(centered);
}

function oppositeLetter(letter) {
  const map = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' };
  return map[letter];
}

export function scoreJungAnswers(answers = []) {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const q of QUESTIONS) {
    const answer = answers.find((a) => a.id === q.id);
    if (!answer) continue;
    applyAnswer(score, q.dimension, q.forward, answer.value);
  }

  const type = `${score.E >= score.I ? 'E' : 'I'}${score.S >= score.N ? 'S' : 'N'}${score.T >= score.F ? 'T' : 'F'}${score.J >= score.P ? 'J' : 'P'}`;

  return {
    type,
    score,
    archetype: ARCHETYPE_COPY[type] || ARCHETYPE_COPY.default
  };
}
