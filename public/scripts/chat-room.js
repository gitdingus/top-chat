const modals = document.querySelector('#modals');
const exitBtns = document.querySelectorAll('.exit')

ownerOptions.addEventListener('click', () => {
  modals.classList.add('open');
  roomSettings.classList.add('active');
});

exitBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const activeModal = document.querySelector('#modals .active');
    activeModal.classList.remove('active');
    modals.classList.remove('open');
  });
});
