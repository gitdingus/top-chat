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
  console.log(liElement);
  const trigger = liElement.querySelector('a');
  const adminPopup = document.createElement('div');
  const kick = document.createElement('a');
  const ban = document.createElement('a');

  kick.href='#';
  kick.textContent = `Kick ${liElement.textContent}`;

  ban.href = '#';
  ban.textContent = `Ban ${liElement.textContent}`;

  liElement.classList.add('popup-parent');
  trigger.classList.add('popup-trigger');

  adminPopup.classList.add('popup');
  adminPopup.appendChild(kick);
  adminPopup.appendChild(ban);

  liElement.appendChild(adminPopup);
  
  attachPopupListeners(liElement);
  console.log(liElement);

}