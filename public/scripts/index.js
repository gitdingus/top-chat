const modals = document.querySelector('#modals');
const exitModalBtns = document.querySelectorAll('#modals .toolbar .exit');
const createAccountBtn = document.querySelector('#create-account-btn');
const createAccountDiv = document.querySelector('#create-account-div');
const loginBtn = document.querySelector('#login-btn');
const loginDiv = document.querySelector('#login-div');

if (createAccountDiv && loginDiv) {
  window.addEventListener('load', () => {
    modals.classList.add('open');
    loginDiv.classList.add('active');
  });
}

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

if (createAccountBtn) {
  createAccountBtn.addEventListener('click', function() {
    modals.classList.add('open');
    createAccountDiv.classList.add('active');

    // ensure login div is not showing
    loginDiv.classList.remove('active');
  });
}

if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    modals.classList.add('open');
    loginDiv.classList.add('active');

    // ensure create account div is not showing
    createAccountDiv.classList.remove('active');
  });
}