import attachPopupListeners from './popup.js';

const messages = document.querySelector('#messages');
const messageForm = document.querySelector('#message-form');
const sendBtn = document.querySelector('#send-message');
const messageInput = document.querySelector('#message_input');
const usersList = document.querySelector('#users ul');
const ownerOptions = document.querySelector('#owner-options');
const roomSettings = document.querySelector('#room-settings');
const setTopicForm = document.querySelector('#set-topic');
const popupParents = document.querySelectorAll('.popup-parent');

if (popupParents.length > 0) {
  popupParents.forEach((elem) => {
    attachPopupListeners(elem);
  });
}

let autoScroll = true;
let ws;

if (messageInput !== null) {
  messageInput.value = '';
  messageInput.focus();
}

if (messages != null) {
  messages.scrollTo(0, messages.scrollHeight);

  messages.addEventListener('scroll', (e) => {
    if (e.target.clientHeight + e.target.scrollTop === e.target.scrollHeight) {
      autoScroll = true
    } else {
      autoScroll = false;
    }
  });
}
if (messageForm !== null) {
  ws = new WebSocket(`ws://localhost:8080/chat/${messageForm.chat_id.value}`);

  ws.addEventListener('message', (packetJSON) => {
    const packet = JSON.parse(packetJSON.data);

    if (packet.action === 'message') {
      const message = packet.data;
      const messageDiv = createMessage(message);
      messages.appendChild(messageDiv);
      if (autoScroll) {
        messages.scrollTo(0, messages.scrollHeight);
      }
    }

    if (packet.action === 'current-users') {
      const userElements = Array.from(usersList.children);
      const currentUsers = packet.data.currentUsers;
      if (packet.roomType === 'private' || packet.roomType === 'private-message') {        
        currentUsers.forEach((user) => {
          const li = userElements.find((elem) => {
            const name = elem.textContent.substring(0, user.length);
            return name === user;
          });

          if (li) {
            li.classList.add('online');
          }
        });

      }
      
      if (packet.roomType === 'public') {
        currentUsers.forEach((user) => {
          const li = document.createElement('li');
          const a = document.createElement('a');

          a.textContent = user;
          a.href=`/users/${user}`;

          li.appendChild(a);
          li.classList.add('online');

          userElements.push(li);
        });        
      }

      userElements.sort(sortUsersFunction);
      updateUsersList(usersList, userElements);
    }

    if (packet.action === 'join') {
      const userElements = Array.from(usersList.children);
      const newUser = packet.data.user;

      if (packet.roomType === 'private' || packet.roomType === 'private-message') {        
        const li = userElements.find((elem) => {
          const name = elem.textContent.substring(0, newUser.length);
          return name === newUser;
        })

        if (li) {
          li.classList.add('online');
        } else {
          const newUser = createUserListItem(packet.data.user, true);
          userElements.push(newUser);
        }
      }

      if (packet.roomType === 'public') {
        const li = document.createElement('li');
        const a = document.createElement('a');

        a.textContent = newUser;
        a.href=`/users/${newUser}`;

        li.appendChild(a);
        li.classList.add('online');

        userElements.push(li);
      }

      userElements.sort(sortUsersFunction);
      updateUsersList(usersList, userElements);
    }

    if (packet.action === 'leave') {
      const userElements = Array.from(usersList.children);
      if (packet.roomType === 'private' || packet.roomType === 'private-message') {        
        userElements.forEach((user) => {
          const name = user.textContent.substring(0, packet.data.user.length);

          if (name === packet.data.user) {
            user.classList.remove('online');
          }
        });

      }

      if (packet.roomType === 'public') {
        const i = userElements.findIndex((elem, i) => {
          const name = elem.textContent.substring(0, packet.data.user.length);
          return name === packet.data.user;
        })

        if (i >= 0) {
          userElements.splice(i, 1);
        }
      }
      userElements.sort(sortUsersFunction);
      updateUsersList(usersList, userElements);
    }

    if (packet.action == 'topic-change') {
      topicChanged(packet.data);
    }
  });

  ws.addEventListener('close', (e) => {
    if (e.code === 4003) {
      messages.appendChild(createAnnouncement(e.reason));
      messages.scrollTo(0, messages.scrollHeight);
    } else {
      messages.appendChild(createAnnouncement('You have been disconnected from the server...'));
      messages.scrollTo(0, messages.scrollHeight);
    }
    sendBtn.setAttribute('disabled', true);
  })
  
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const packet = {};

    packet.action = 'message';

    const newMessage = TextMessage({
      chatId: messageForm.chat_id.value,
      userId: messageForm.user_id.value,
      content: messageForm.message_input.value,
    });

    packet.data = newMessage;

    ws.send(JSON.stringify(packet));
    
    messageInput.value = '';
    messageInput.focus();
    return false;
  });
}

function createMessage(message) {
  const messageDiv = document.createElement('div');
  const messageP = document.createElement('p');
  const username = document.createElement('span');
  const content = document.createElement('span');

  messageDiv.classList.add('message')
  if (message._id) {
    messageDiv.setAttribute('data-messageid', message._id);
  }

  if (message.type === 'text') {
    content.textContent = message.data;
  }

  content.classList.add('message-content');

  username.textContent = message.author.username + ': ';
  username.classList.add('username');

  messageP.appendChild(username);
  messageP.appendChild(content);

  messageDiv.appendChild(messageP);

  return messageDiv;
}

function createUserListItem(username, online) {
  const li = document.createElement('li');
  const a = document.createElement('a');

  if (online) {
    li.classList.add('online');
  }

  a.href = `/users/${username}`;
  a.textContent = username;

  li.appendChild(a);
  return li;
}

function TextMessage({ chatId, userId, content }) {
  const newMessage = Object.create(null);

  newMessage.chatId = chatId;
  newMessage.userId = userId;
  newMessage.messageType = 'text';
  newMessage.content = content;
  newMessage.timestamp = new Date();

  return newMessage;
}

if (setTopicForm) {
  setTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = {
      chatId: e.target.chatId.value,
      userId: e.target.userId.value,
      topic: e.target.topic.value,
    };

    const json = JSON.stringify(body);
    fetch(`/chat/${e.target.chatId.value}/edit`, {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: json,
    })
      .then((res) => {
        if (!res.status === 200) {
          throw new Error('There has been an error submitting the form');
        }
      })
      .catch((err) => {
        console.log(err);
      });

    const activeModal = document.querySelector('#modals .active');
    activeModal.classList.remove('active');
    modals.classList.remove('open');

    return false;
  });
}

function topicChanged(topic) {
  const topicElem = document.querySelector('#chat-topic');
  topicElem.textContent = topic;

  messages.appendChild(createAnnouncement(`Topic has changed to: ${topic}`));
  messages.scrollTo(0, messages.scrollHeight);
}

function createAnnouncement(text) {
  const p = document.createElement('p');

  p.classList.add('announcement');
  p.textContent = text;
  return p;
}

function sortUsersFunction(a, b) {
  if (a.classList.contains('online') && !b.classList.contains('online')) {
    return -1;
  } 

  if (!a.classList.contains('online') && b.classList.contains('online')) {
    return 1;
  }

  if (a.textContent < b.textContent) {
    return - 1;
  }

  if (a.textContent > b.textContent) {
    return 1;
  }

  if (a.textContent === b.textContent) {
    return 0;
  }
}

function updateUsersList(list, newList) {
  while (list.children.length > 0) {
    list.firstElementChild.remove();
  }

  newList.forEach((item) => {
    list.appendChild(item);
  });
}

const modals = document.querySelector('#modals');
const exitBtns = document.querySelectorAll('.exit')

if (ownerOptions) {
  ownerOptions.addEventListener('click', () => {
    modals.classList.add('open');
    roomSettings.classList.add('active');
  });
}

exitBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const activeModal = document.querySelector('#modals .active');
    activeModal.classList.remove('active');
    modals.classList.remove('open');
  });
});
