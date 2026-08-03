const toggle = document.getElementById('wishToggle');
const note = document.getElementById('wishNote');
const wishStorageKey = 'wishcore-note-open';

function setOpen(isOpen) {
  note.hidden = !isOpen;
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.textContent = isOpen ? '✧ Close the wish ✧' : '✧ Make a wish ✧';

  try {
    localStorage.setItem(wishStorageKey, String(isOpen));
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
  restoredOpen = localStorage.getItem(wishStorageKey) === 'true';
} catch {
  restoredOpen = false;
}

if (restoredOpen) {
  setOpen(true);
}
