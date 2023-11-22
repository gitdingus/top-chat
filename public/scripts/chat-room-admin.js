import attachPopupListeners from './popup.js';

const userList = document.querySelector('#users ul');

Array.from(userList.children).forEach((child) => {
  addAdminTools(child);
});

const userListObserver = new MutationObserver((records, mo) => {
  records.forEach((record) => {
    if (record.addedNodes.length > 0) {
      record.addedNodes.forEach((node) => {
        if (!node.classList.contains('popup-parent')) {
          addAdminTools(node);
        }
      });
    }
  });
});

userListObserver.observe(userList, {
  childList: true,
});

function addAdminTools(liElement) {
  const trigger = liElement.querySelector('a');
  const adminPopup = document.createElement('div');
  const adminActions = document.createElement('ul');
  const kickLi = document.createElement('li');
  const banLi = document.createElement('li');
  const kickForm = createModForm('kick', liElement.textContent);
  const banForm = createModForm('ban', liElement.textContent);

  kickLi.appendChild(kickForm);
  banLi.appendChild(banForm);

  adminActions.appendChild(kickLi);
  adminActions.appendChild(banLi);

  liElement.classList.add('popup-parent');
  trigger.classList.add('popup-trigger');

  adminPopup.classList.add('popup');
  adminPopup.appendChild(adminActions);

  liElement.appendChild(adminPopup);
  
  attachPopupListeners(liElement);
}

function createModForm(modAction, username) {
  const form = document.createElement('form');
  const action = createHiddenInput('action', modAction);
  const user = createHiddenInput('username', username);
  const button = document.createElement('button');

  button.setAttribute('type', 'submit');
  button.classList.add('primary-btn');
  button.textContent = `${modAction} ${username}`;

  form.appendChild(action);
  form.appendChild(user);
  form.appendChild(button);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    fetch(`/chat/${getChatIdFromUrl()}/moderate`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        action: action.value,
        username: user.value,
      }),
    })
      .then((res) => {
        console.log(res.status);
      });

    return false;
  });

  return form;
}

function createHiddenInput(field, value) {
  const input = document.createElement('input');

  input.setAttribute('type', 'hidden');
  input.setAttribute('name', field);
  input.setAttribute('value', value);

  return input;
}

function getChatIdFromUrl() {
  const startIndex = '/chat/'.length;
  return (window.location.pathname.substring(startIndex));
}
