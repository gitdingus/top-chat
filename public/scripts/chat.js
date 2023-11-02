const messages = document.querySelector('#messages');
const messageForm = document.querySelector('#message-form');
const sendBtn = document.querySelector('#send-message');
const messageInput = document.querySelector('#message_input');
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

  ws.addEventListener('message', (messageJSON) => {
    const message = JSON.parse(messageJSON.data);
    const messageDiv = createMessage(message);
    messages.appendChild(messageDiv);
    if (autoScroll) {
      messages.scrollTo(0, messages.scrollHeight);
    }
  });

  ws.addEventListener('close', (code, buf) => {
    console.log('Connection closing');
  })
  
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newMessage = TextMessage({
      chatId: messageForm.chat_id.value,
      userId: messageForm.user_id.value,
      content: messageForm.message_input.value,
    });

    ws.send(JSON.stringify(newMessage));
    
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

function TextMessage({ chatId, userId, content }) {
  const newMessage = Object.create(null);

  newMessage.chatId = chatId;
  newMessage.userId = userId;
  newMessage.messageType = 'text';
  newMessage.content = content;
  newMessage.timestamp = new Date();

  return newMessage;
}