const QUESTIONS = [
  { id: 'q1', text: 'Yeni insanlarla tanışmak sana enerji verir.', dimension: 'EI', forward: 'E' },
  { id: 'q2', text: 'Somut gerçekler sezgilerden daha ikna edicidir.', dimension: 'SN', forward: 'S' },
  { id: 'q3', text: 'Karar alırken mantık duygulardan önde gelir.', dimension: 'TF', forward: 'T' },
  { id: 'q4', text: 'Planlı hareket etmek spontane davranmaktan daha rahattır.', dimension: 'JP', forward: 'J' },
  { id: 'q5', text: 'Derin, bire bir sohbetleri kalabalık ortamlara tercih edersin.', dimension: 'EI', forward: 'I' },
  { id: 'q6', text: 'Büyük resmi düşünmek detaylardan daha doğaldır.', dimension: 'SN', forward: 'N' },
  { id: 'q7', text: 'İnsanların duygusal durumu kararlarını etkiler.', dimension: 'TF', forward: 'F' },
  { id: 'q8', text: 'Esnek takvimler katı planlardan daha özgür hissettirir.', dimension: 'JP', forward: 'P' },
  { id: 'q9', text: 'Sosyal ortamlarda konuşmayı kolayca başlatırsın.', dimension: 'EI', forward: 'E' },
  { id: 'q10', text: 'Kanıtlanmış yöntemler yenilikçi fikirlerden daha güvenlidir.', dimension: 'SN', forward: 'S' },
  { id: 'q11', text: 'Tartışmalarda objektiflik empatiye göre daha önemlidir.', dimension: 'TF', forward: 'T' },
  { id: 'q12', text: 'Teslim tarihleri net değilse motivasyonun düşer.', dimension: 'JP', forward: 'J' },
  { id: 'q13', text: 'Yalnız kaldığında zihnin daha berrak çalışır.', dimension: 'EI', forward: 'I' },
  { id: 'q14', text: 'Semboller ve metaforlar üzerinden düşünmeyi seversin.', dimension: 'SN', forward: 'N' },
  { id: 'q15', text: 'Kararlarında adalet, şefkatten önce gelir.', dimension: 'TF', forward: 'T' },
  { id: 'q16', text: 'Değişen planlar seni heyecanlandırır.', dimension: 'JP', forward: 'P' },
  { id: 'q17', text: 'Günün çoğunu insanlarla geçirmek seni besler.', dimension: 'EI', forward: 'E' },
  { id: 'q18', text: 'Deneyimlediğin şeyleri teoriden daha fazla önemsersin.', dimension: 'SN', forward: 'S' },
  { id: 'q19', text: 'Empati kurmak doğru karardan daha değerlidir.', dimension: 'TF', forward: 'F' },
  { id: 'q20', text: 'Önceden tanımlanmamış seçenekler ilgini çeker.', dimension: 'JP', forward: 'P' },
  { id: 'q21', text: 'Kalabalık buluşmalarda görünür olmayı seversin.', dimension: 'EI', forward: 'E' },
  { id: 'q22', text: 'Kararlarında mantıksal tutarlılık olmazsa olmazdır.', dimension: 'TF', forward: 'T' },
  { id: 'q23', text: 'Önceden belirlenmiş rutinler seni güvende hissettirir.', dimension: 'JP', forward: 'J' },
  { id: 'q24', text: 'Geleceğe dair olasılıkları düşünmek hoşuna gider.', dimension: 'SN', forward: 'N' },
  { id: 'q25', text: 'Kalabalık sonrası tek başına kalma ihtiyacı artar.', dimension: 'EI', forward: 'I' },
  { id: 'q26', text: 'Çatışmalarda kalp kırmamak haklı olmaktan önemlidir.', dimension: 'TF', forward: 'F' },
  { id: 'q27', text: 'Açık uçlu süreçler daha yaratıcı sonuç verir.', dimension: 'JP', forward: 'P' },
  { id: 'q28', text: 'Gerçekçi detaylar hayal gücünden önce gelir.', dimension: 'SN', forward: 'S' },
  { id: 'q29', text: 'Tanımadığın kişilerle hızlıca bağ kurabilirsin.', dimension: 'EI', forward: 'E' },
  { id: 'q30', text: 'Hedefe ulaşmak için kurallar net olmalıdır.', dimension: 'JP', forward: 'J' }
];

const ARCHETYPE_COPY = {
  ENFJ: 'Empatik lider: insanları bir araya getirir ve duygusal uyuma önem verir.',
  INFP: 'İdealist bağ kurucu: derinlik, anlam ve sadakat arar.',
  ESTJ: 'Yapı kurucu: netlik, güven ve istikrarı önceler.',
  INTJ: 'Stratejik mimar: uzun vadeli düşünür, seçici bağ kurar.',
  default: 'Dengeli profil: uyumlu iletişim ve karşılıklı gelişim odaklı.'
};

const QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

export function listJungQuestions() {
  return QUESTIONS.map(({ id, text }) => ({ id, text, scale: [1, 2, 3, 4, 5] }));
}

function applyAnswer(score, forward, value) {
  const centered = Number(value) - 3;
  if (!Number.isFinite(centered)) return;
  const dir = centered >= 0 ? forward : oppositeLetter(forward);
  score[dir] += Math.abs(centered);
}

function oppositeLetter(letter) {
  const map = { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' };
  return map[letter];
}

function pairDelta(score, a, b) {
  return Math.abs(score[a] - score[b]);
}

function qualityMetrics(answerCount, score) {
  const completionRate = Math.max(0, Math.min(100, Math.round((answerCount / QUESTIONS.length) * 100)));
  const consistency = Math.max(
    0,
    100 - Math.round((pairDelta(score, 'E', 'I') + pairDelta(score, 'S', 'N') + pairDelta(score, 'T', 'F') + pairDelta(score, 'J', 'P')) / 2)
  );
  return { completionRate, consistency };
}

function normalizeAnswers(answers = []) {
  const map = new Map();
  for (const answer of answers) {
    if (!QUESTION_IDS.has(answer?.id)) continue;
    const value = Number(answer?.value);
    if (!Number.isFinite(value) || value < 1 || value > 5) continue;
    map.set(answer.id, value);
  }
  return map;
}

export function scoreJungAnswers(answers = []) {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const normalizedAnswers = normalizeAnswers(answers);

  for (const q of QUESTIONS) {
    const value = normalizedAnswers.get(q.id);
    if (value == null) continue;
    applyAnswer(score, q.forward, value);
  }

  const type = `${score.E >= score.I ? 'E' : 'I'}${score.S >= score.N ? 'S' : 'N'}${score.T >= score.F ? 'T' : 'F'}${score.J >= score.P ? 'J' : 'P'}`;

  return {
    type,
    score,
    archetype: ARCHETYPE_COPY[type] || ARCHETYPE_COPY.default,
    quality: qualityMetrics(normalizedAnswers.size, score)
  };
}
