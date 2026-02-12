const feed = document.getElementById('feed');
const aliasEl = document.getElementById('alias');
const textEl = document.getElementById('text');
const depthText = document.getElementById('depthText');
const depthOut = document.getElementById('depthOut');

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  return res.json();
}

async function loadFeed() {
  const data = await api('/community/messages');
  feed.innerHTML = '';
  for (const item of (data.items || []).reverse()) {
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerHTML = `<strong>${item.alias}</strong> <span class="muted">(${item.lang || 'tr'})</span><br/>${item.text}`;
    feed.appendChild(div);
  }
}

document.getElementById('sendBtn').addEventListener('click', async () => {
  const payload = {
    alias: aliasEl.value || 'Anon',
    text: textEl.value,
    lang: document.documentElement.lang || 'tr'
  };
  const data = await api('/community/messages', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (data.error) {
    alert(data.error);
    return;
  }
  textEl.value = '';
  await loadFeed();
});

document.getElementById('depthBtn').addEventListener('click', async () => {
  const data = await api('/ai/depth-analysis', {
    method: 'POST',
    body: JSON.stringify({ text: depthText.value })
  });
  depthOut.textContent = JSON.stringify(data, null, 2);
});

loadFeed();
setInterval(loadFeed, 4000);
