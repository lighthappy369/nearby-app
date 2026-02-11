const QUESTIONS = [
  { id: 'q1', text: 'Kalabalık ortamlarda enerji toplarsın.', dimension: 'EI', forward: 'E' },
  { id: 'q2', text: 'Kararlarında empati daha baskındır.', dimension: 'TF', forward: 'F' },
  { id: 'q3', text: 'Gününü planlamak seni rahatlatır.', dimension: 'JP', forward: 'J' },
  { id: 'q4', text: 'Sezgiler, somut verilere göre daha çok yol gösterir.', dimension: 'SN', forward: 'N' },
  { id: 'q5', text: 'Uzun yalnızlık dönemleri seni güçlendirir.', dimension: 'EI', forward: 'I' },
  { id: 'q6', text: 'İlişkide duygusal sıcaklık en önemli kriterdir.', dimension: 'TF', forward: 'F' },
  { id: 'q7', text: 'Ani plan değişiklikleri seni rahatsız etmez.', dimension: 'JP', forward: 'P' },
  { id: 'q8', text: 'Ölçülebilir gerçekler daha güvenlidir.', dimension: 'SN', forward: 'S' },
  { id: 'q9', text: 'Yeni gruplarda konuşmayı çoğunlukla sen başlatırsın.', dimension: 'EI', forward: 'E' },
  { id: 'q10', text: 'Zor kararları veriyle netleştirirsin.', dimension: 'TF', forward: 'T' },
  { id: 'q11', text: 'Beklenmedik sürprizler hoşuna gider.', dimension: 'JP', forward: 'P' },
  { id: 'q12', text: 'Ayrıntılar büyük resmi anlamada kritik rol oynar.', dimension: 'SN', forward: 'S' },
  { id: 'q13', text: 'Gün sonunda sosyal temas seni yeniler.', dimension: 'EI', forward: 'E' },
  { id: 'q14', text: 'İlişkide adalet, şefkatten daha önemlidir.', dimension: 'TF', forward: 'T' },
  { id: 'q15', text: 'Plan dışına çıkınca performansın düşer.', dimension: 'JP', forward: 'J' },
  { id: 'q16', text: 'Yeni fikirler pratikten daha heyecan vericidir.', dimension: 'SN', forward: 'N' },
  { id: 'q17', text: 'Düşünmek için yalnız zamana sık ihtiyaç duyarsın.', dimension: 'EI', forward: 'I' },
  { id: 'q18', text: 'İlişkide uzlaşma için duyguyu öncelemek gerekir.', dimension: 'TF', forward: 'F' },
  { id: 'q19', text: 'Açık teslim tarihleriyle çalışmayı tercih edersin.', dimension: 'JP', forward: 'J' },
  { id: 'q20', text: 'Somut deneyim, teorik içgörüden daha değerlidir.', dimension: 'SN', forward: 'S' },
  { id: 'q21', text: 'Sosyal etkinlikleri genellikle sen organize edersin.', dimension: 'EI', forward: 'E' },
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
  const completionRate = Math.round((answerCount / QUESTIONS.length) * 100);
  const consistency = Math.max(
    0,
    100 - Math.round((pairDelta(score, 'E', 'I') + pairDelta(score, 'S', 'N') + pairDelta(score, 'T', 'F') + pairDelta(score, 'J', 'P')) / 2)
  );
  return { completionRate, consistency };
}

export function scoreJungAnswers(answers = []) {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const q of QUESTIONS) {
    const answer = answers.find((a) => a.id === q.id);
    if (!answer) continue;
    applyAnswer(score, q.forward, answer.value);
  }

  const type = `${score.E >= score.I ? 'E' : 'I'}${score.S >= score.N ? 'S' : 'N'}${score.T >= score.F ? 'T' : 'F'}${score.J >= score.P ? 'J' : 'P'}`;

  return {
    type,
    score,
    archetype: ARCHETYPE_COPY[type] || ARCHETYPE_COPY.default,
    quality: qualityMetrics(answers.length, score)
  };
}
