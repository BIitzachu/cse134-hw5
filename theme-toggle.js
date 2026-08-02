const storageKey = 'portfolio-theme-preference';
const root = document.documentElement;
const controls = document.querySelectorAll('[data-theme-control]');

function readStoredTheme() {
  try {
    const savedTheme = localStorage.getItem(storageKey);
    return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto'
      ? savedTheme
      : 'auto';
  } catch {
    return 'auto';
  }
}

function saveTheme(mode) {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // Ignore storage failures and keep the current session theme.
  }
}

function applyTheme(mode) {
  if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }

  controls.forEach((control) => {
    const isActive = control.getAttribute('data-theme-control') === mode;
    control.classList.toggle('is-active', isActive);
    control.setAttribute('aria-pressed', String(isActive));
  });

  saveTheme(mode);
}

controls.forEach((control) => {
  control.addEventListener('click', () => {
    applyTheme(control.getAttribute('data-theme-control'));
  });
});

applyTheme(readStoredTheme());
