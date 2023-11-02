const asyncHandler = require('express-async-handler');
const { getFriends } = require('../db/user.js');
const { getChat } = require('../db/chat.js');
const { createMessage, getMessages, populate } = require('../db/message.js');

const clients = {};

exports.get_chat_index = [
  asyncHandler(async (req, res, next) => {
    await getFriends(req.user);

    res.render('chat', {
      user: req.user,
    });
  }),
];

exports.get_chat = [
  asyncHandler(async (req, res, next) => {
    const [ populateFriendsVoid, chat, messages ] = await Promise.all([
      getFriends(req.user),
      getChat(req.params.chatId),
      getMessages(req.params.chatId),
    ]);

    res.render('chat-room', {
      user: req.user,
      chat,
      messages,
    });
  })
];

exports.ws_chat_visited = function (ws, req) {
  const { chatId } = req.params;
  if (clients[chatId] === undefined) {
    clients[chatId] = [];
  }
  clients[chatId].push(ws);

  ws.on('close', () => {
    const clientIndex = clients[chatId].findIndex((client) => client === ws);
    clients[chatId].splice(clientIndex, 1);
  });

  ws.on('message', async (msgJSON) => {
    const msg = JSON.parse(msgJSON);
    const message = await createMessage({
      chat: msg.chatId,
      author: msg.userId,
      timestamp: new Date(msg.timestamp),
      type: msg.messageType,
      data: msg.content,
    });

    await populate(message);

    clients[chatId].forEach((client) => {
      client.send(JSON.stringify(message.toObject()));
    })
  });
};
