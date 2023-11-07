const messages = document.querySelector('#messages');
const messageForm = document.querySelector('#message-form');
const sendBtn = document.querySelector('#send-message');
const messageInput = document.querySelector('#message_input');
const usersList = document.querySelector('#users ul');
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
      autoScroll = true;
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
      const currentUsers = packet.data.currentUsers;
      currentUsers.forEach((user) => {
        const li = createUserListItem(user);
        usersList.appendChild(li);
      });
    }

    if (packet.action === 'join') {
      const newUser = packet.data.user;
      const li = createUserListItem(newUser);
      usersList.appendChild(li);
    }

    if (packet.action === 'leave') {
      const users = usersList.querySelectorAll('li');
      users.forEach((user) => {
        if (user.textContent === packet.data.user) {
          user.remove();
        }
      });
    }
  });

  ws.addEventListener('close', (code, buf) => {
    const disconnectMessage = document.createElement('p');
    disconnectMessage.textContent = 'You have been disconnected from the server...';
    messages.appendChild(disconnectMessage);
    messages.scrollTo(0, messages.scrollHeight);
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

  username.textContent = message.author.username + ': ';

  messageP.appendChild(username);
  messageP.appendChild(content);

  messageDiv.appendChild(messageP);

  return messageDiv;
}

function createUserListItem(username) {
  const li = document.createElement('li');
  const a = document.createElement('a');

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