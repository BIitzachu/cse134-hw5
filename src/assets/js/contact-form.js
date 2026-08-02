const form = document.getElementById('contactForm');
const dialog = document.getElementById('contactDialog');
const closeButton = document.getElementById('closeDialog');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
});

closeButton.addEventListener('click', function () {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
});
