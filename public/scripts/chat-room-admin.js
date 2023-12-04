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

const ownerOptions = document.querySelector('#owner-options');
const modMenuModal = document.querySelector('#mod-menu-modal');
const changeTopicModal = document.querySelector('#change-topic-modal');
const changeTopicButton = document.querySelector('#change-topic-button');
const bannedUsersModal = document.querySelector('#banned-users-modal');
const unbanUsersForm = document.querySelector('#unban-users');
const viewBannedUsersButton = document.querySelector('#view-banned-users-button');
const modals = document.querySelector('#modals');
const exitBtns = document.querySelectorAll('.exit')

if (ownerOptions) {
  ownerOptions.addEventListener('click', () => {
    modals.classList.add('open');
    modMenuModal.classList.add('active');
  });
}

if (changeTopicButton) {
  changeTopicButton.addEventListener('click', () => {
    modals.classList.add('open'); 
    Array.from(modals.children).forEach((child) => {
      child.classList.remove('active');
    });
    changeTopicModal.classList.add('active');
  });
}

if (viewBannedUsersButton) {
  viewBannedUsersButton.addEventListener('click', () => {
    fetch(`/chat/${getChatIdFromUrl()}/moderate/bannedusers`)
      .then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          const bannedUsers = data.bannedUsers;
          const bannedUserList = document.querySelector('#banned-users-list');

          while (bannedUserList.firstElementChild) {
            bannedUserList.firstElementChild.remove();
          }

          bannedUsers.forEach((user) => {
            const li = document.createElement('li');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');

            label.setAttribute('for', `user-${user._id}`);
            label.textContent = user.username;

            checkbox.setAttribute('id', `user-${user._id}`);
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('name', 'user');
            checkbox.setAttribute('value', user._id);

            li.appendChild(label);
            li.appendChild(checkbox);
            bannedUserList.appendChild(li);
          });

          modals.classList.add('open');
          Array.from(modals.children).forEach((child) => {
            child.classList.remove('active');
          });
          bannedUsersModal.classList.add('active');
        }
      })
        .catch(() => alert('There has been an error processing your request'));
  });
}

if (unbanUsersForm) {
  unbanUsersForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let  userCheckboxes; 
    if (unbanUsersForm.user instanceof NodeList) {
      userCheckboxes = Array.from(unbanUsersForm.user).filter((checkbox) => checkbox.checked === true);
    } else if (unbanUsersForm.user instanceof HTMLInputElement) {
      userCheckboxes = [ unbanUsersForm.user ];
    }

    if (userCheckboxes) {
      const userIds = userCheckboxes.map((checkbox) => checkbox.value);
  
      fetch(`/chat/${getChatIdFromUrl()}/moderate`, {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unban',
          users: userIds,
        }),
      });
    }

    bannedUsersModal.classList.remove('active');
    modals.classList.remove('open');

    return false;
  });
}
exitBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const activeModal = document.querySelector('#modals .active');
    activeModal.classList.remove('active');
    modals.classList.remove('open');
  });
});
