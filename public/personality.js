const questionsRoot = document.getElementById('questions');
const resultEl = document.getElementById('result');
const progressEl = document.getElementById('progress');
const answers = new Map();

function renderQuestions(items) {
  const topTen = items.slice(0, 10);
  progressEl.textContent = `${topTen.length} soru yüklendi.`;

  topTen.forEach((q, index) => {
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
        progressEl.textContent = `${answers.size}/${topTen.length} soru cevaplandı.`;
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

init().catch((err) => {
  progressEl.textContent = `Hata: ${err.message}`;
});
