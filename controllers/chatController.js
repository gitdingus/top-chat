const asyncHandler = require('express-async-handler');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFriends } = require('../db/user.js');
const { 
  createChat, 
  getChat, 
  getOwnedRooms, 
  getPublicRooms,
  populateAllowedUsers,
} = require('../db/chat.js');
const { createMessage, getMessages, populateUsers } = require('../db/message.js');

const clients = {};

exports.get_chat_index = [
  asyncHandler(async (req, res, next) => {
    const [ populateFriends, ownedRooms, publicRooms ] = await Promise.all([
      getFriends(req.user),
      getOwnedRooms(req.user._id),
      getPublicRooms(),
    ]);

    res.render('chat', {
      user: req.user,
      usersChatRooms: ownedRooms,
      publicRooms,
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
  const userJoinedPacket = {};
  const currentUsersPacket = {};

  if (clients[chatId] === undefined) {
    clients[chatId] = [];
    clients[chatId].currentUsers = [];
  }

  currentUsersPacket.action = 'current-users';
  currentUsersPacket.data = {
    currentUsers: clients[chatId].currentUsers,
  };
  
  ws.send(JSON.stringify(currentUsersPacket));

  clients[chatId].push(ws);
  clients[chatId].currentUsers.push(req.user.username);

  userJoinedPacket.action = 'join';
  userJoinedPacket.data = {
    user: req.user.username,
  };

  clients[chatId].forEach((client) => {
    client.send(JSON.stringify(userJoinedPacket));
  });

  ws.on('close', () => {
    const userLeftPacket = {};
    userLeftPacket.action = 'leave';
    userLeftPacket.data = {
      user: req.user.username,
    };

    const userIndex = clients[chatId].currentUsers.findIndex((user) => user === req.user.username);
    const clientIndex = clients[chatId].findIndex((client) => client === ws);

    clients[chatId].splice(clientIndex, 1);
    clients[chatId].currentUsers.splice(userIndex, 1);

    clients[chatId].forEach((client) => {
      client.send(JSON.stringify(userLeftPacket));
    });
  });

  ws.on('message', async (packetJSON) => {
    const packet = JSON.parse(packetJSON);

    if (packet.action === 'message') {
      const outgoingPacket = {};
      const msg = packet.data;
      const message = await createMessage({
        chat: msg.chatId,
        author: msg.userId,
        timestamp: new Date(msg.timestamp),
        type: msg.messageType,
        data: msg.content,
      });
  
      await populateUsers(message);
  
      outgoingPacket.action = 'message';
      outgoingPacket.data = message.toObject();
      clients[chatId].forEach((client) => {
        client.send(JSON.stringify(outgoingPacket));
      });
    }
  });
};
