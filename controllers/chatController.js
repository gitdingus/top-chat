const asyncHandler = require('express-async-handler');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFriends } = require('../db/user.js');
const { createChat, getChat, getOwnedRooms, populateAllowedUsers } = require('../db/chat.js');
const { createMessage, getMessages, populateUsers } = require('../db/message.js');

const clients = {};

exports.get_chat_index = [
  asyncHandler(async (req, res, next) => {
    const [ populateFriends, ownedRooms ] = await Promise.all([
      getFriends(req.user),
      getOwnedRooms(req.user._id),
    ]);

    res.render('chat', {
      user: req.user,
      usersChatRooms: ownedRooms,
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

    await populateAllowedUsers(chat);

    res.render('chat-room', {
      user: req.user,
      chat,
      messages,
    });
  })
];

exports.get_chat_create = [
  (req, res, next) => {
    res.render('create-chat', {
      user: req.user,
    });
  },
];

// getting name, description, room type, password (optional)
exports.post_chat_create = [
  express.json(),
  express.urlencoded({ extended: false }),
  body('room_name')
    .isLength({min: 1}),
  body('description')
    .isLength({min: 1}),
  body('room_type')
    .custom((val) => {
      const allowedTypes = ['public', 'private'];
      return allowedTypes.includes(val);
    }),
  body('password')
    .optional()
    .custom((val, { req }) => {
      if (req.body.room_type === 'public') {
        return true;
      }

      if (val === undefined || val === '') {
        return false;
      }

      return true;
    }),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('create-chat', {
        user: req.user,
        errors: errors.mapped(),
        chat: req.body,
      });
    }

    const chatObj = {};
    chatObj.name = req.body.room_name;
    chatObj.description = req.body.description;
    chatObj.type = req.body.room_type;
    chatObj.password = req.body.password;

    if (chatObj.type === 'public' || chatObj.type === 'private') {
      chatObj.owner = req.user._id;
    }

    await createChat(chatObj);

    res.status(201).redirect('/chat');
  },
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

    await populateUsers(message);

    clients[chatId].forEach((client) => {
      client.send(JSON.stringify(message.toObject()));
    })
  });
};
