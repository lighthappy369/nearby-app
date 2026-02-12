const selectors = document.querySelectorAll('.gender-selector');

selectors.forEach((group) => {
  group.querySelectorAll('.opt-btn').forEach((button) => {
    button.addEventListener('click', () => {
      group.querySelectorAll('.opt-btn').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
    });
  });
});

const startForm = document.getElementById('start-form');
if (startForm) {
  startForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = startForm.dataset.next || '/personality-test';
    window.location.href = next;
  });
}
