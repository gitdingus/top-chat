const modals = document.querySelector('#modals');
const exitModalBtns = document.querySelectorAll('#modals .toolbar .exit');
const createAccountBtn = document.querySelector('#create-account-btn');
const createAccountDiv = document.querySelector('#create-account-div');
const loginBtn = document.querySelector('#login-btn');
const loginDiv = document.querySelector('#login-div');

exitModalBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const activeModal = document.querySelector('#modals .active');
    const searchParams = new URLSearchParams(window.location.search);
    activeModal.classList.remove('active');
    modals.classList.remove('open');

    if (searchParams.has('create-account')) {
      searchParams.delete('create-account');
    }
  });
});

createAccountBtn.addEventListener('click', function() {
  modals.classList.add('open');
  createAccountDiv.classList.add('active');
});

loginBtn.addEventListener('click', function() {
  modals.classList.add('open');
  loginDiv.classList.add('active');
});