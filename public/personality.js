const questionsRoot = document.getElementById('questions');
const resultEl = document.getElementById('result');
const progressEl = document.getElementById('progress');
const photoOut = document.getElementById('photoOut');
const photoInput = document.getElementById('photoInput');
const photoBtn = document.getElementById('photoBtn');
const answers = new Map();

const lang = document.documentElement.dataset.lang || 'tr';
const copy = {
  tr: {
    loaded: (n) => `${n} soru yüklendi.`,
    answered: (a, t) => `${a}/${t} soru cevaplandı.`,
    error: (m) => `Hata: ${m}`,
    photoNeed: 'Lütfen önce fotoğraf seçin.'
  },
  en: {
    loaded: (n) => `${n} questions loaded.`,
    answered: (a, t) => `${a}/${t} questions answered.`,
    error: (m) => `Error: ${m}`,
    photoNeed: 'Please select a photo first.'
  },
  de: {
    loaded: (n) => `${n} Fragen geladen.`,
    answered: (a, t) => `${a}/${t} Fragen beantwortet.`,
    error: (m) => `Fehler: ${m}`,
    photoNeed: 'Bitte zuerst ein Foto auswählen.'
  },
  ru: {
    loaded: (n) => `Загружено вопросов: ${n}.`,
    answered: (a, t) => `Отвечено: ${a}/${t}.`,
    error: (m) => `Ошибка: ${m}`,
    photoNeed: 'Сначала выберите фото.'
  },
  ar: {
    loaded: (n) => `تم تحميل ${n} سؤالاً.`,
    answered: (a, t) => `تمت الإجابة: ${a}/${t}.`,
    error: (m) => `خطأ: ${m}`,
    photoNeed: 'يرجى اختيار صورة أولاً.'
  }
}[lang] || {
  loaded: (n) => `${n} questions loaded.`,
  answered: (a, t) => `${a}/${t} questions answered.`,
  error: (m) => `Error: ${m}`,
  photoNeed: 'Please select a photo first.'
};

function renderQuestions(items) {
  const all = items;
  progressEl.textContent = copy.loaded(all.length);

  all.forEach((q, index) => {
    const card = document.createElement('section');
    card.className = 'test-card';
    card.innerHTML = `<h3>${index + 1}. ${q.text}</h3>`;

    const scale = document.createElement('div');
    scale.className = 'scale';

    for (let value = 1; value <= 5; value += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(value);
      button.addEventListener('click', () => {
        answers.set(q.id, value);
        scale.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        button.classList.add('active');
        progressEl.textContent = copy.answered(answers.size, all.length);
      });
      scale.appendChild(button);
    }

    card.appendChild(scale);
    questionsRoot.appendChild(card);
  });
}

async function init() {
  const res = await fetch('/jung/questions');
  const data = await res.json();
  renderQuestions(data.items || []);
}

document.getElementById('submitBtn').addEventListener('click', async () => {
  const payload = {
    answers: [...answers.entries()].map(([id, value]) => ({ id, value }))
  };

  const res = await fetch('/jung/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  resultEl.textContent = JSON.stringify(data, null, 2);
});

if (photoBtn && photoInput && photoOut) {
  photoBtn.addEventListener('click', async () => {
    const file = photoInput.files?.[0];
    if (!file) {
      photoOut.textContent = copy.photoNeed;
      return;
    }

    const res = await fetch('/photo/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: file.name, size: file.size, type: file.type })
    });
    const data = await res.json();
    photoOut.textContent = JSON.stringify(data, null, 2);
  });
}

init().catch((err) => {
  progressEl.textContent = copy.error(err.message);
});
