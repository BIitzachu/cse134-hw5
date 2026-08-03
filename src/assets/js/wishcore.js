const toggle = document.getElementById('wishToggle');
const note = document.getElementById('wishNote');
const storageKey = 'wishcore-note-open';

function setOpen(isOpen) {
  note.hidden = !isOpen;
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.textContent = isOpen ? '✧ Close the wish ✧' : '✧ Make a wish ✧';

  try {
    localStorage.setItem(storageKey, String(isOpen));
  } catch {
    // Ignore storage failures and keep the current session state.
  }
}

toggle.hidden = false;

toggle.addEventListener('click', () => {
  setOpen(note.hidden);
});

let restoredOpen = false;
try {
  restoredOpen = localStorage.getItem(storageKey) === 'true';
} catch {
  restoredOpen = false;
}

if (restoredOpen) {
  setOpen(true);
}
