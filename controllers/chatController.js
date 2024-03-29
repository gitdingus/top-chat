const asyncHandler = require('express-async-handler');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { findByUsername, getFriends, populateChats } = require('../db/user.js');
const { 
  addUserToChat,
  banUserFromChat,
  changeTopic,
  createChat, 
  getChat, 
  getOwnedRooms, 
  getPublicRooms,
  populateAllowedUsers,
  populateBannedUsers,
  unbanUsers,
  userAllowedInChat,
  verifyChatPassword,
} = require('../db/chat.js');
const { createMessage, getMessages, populateUsers } = require('../db/message.js');

const clients = {};

exports.get_banned_users = [
  asyncHandler(async (req, res, next) => {
    const chat = await getChat(req.params.chatId);

    if (req.user._id.equals(chat._id)) {
      throw new Error('Access denied');
    }

    await populateBannedUsers(chat);

    res.status(200).json({
      bannedUsers: chat.bannedUsers,
    });
  }),
]
exports.get_chat_index = [
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new Error('not logged in');
    }
    const [ ownedRooms, publicRooms ] = await Promise.all([
      getOwnedRooms(req.user._id),
      getPublicRooms(),
      populateChats(req.user),
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

    if(chat.bannedUsers) {
      const bannedUser = chat.bannedUsers.find((doc) => doc._id.equals(req.user._id));

      if (bannedUser) {
        throw new Error('You have been banned from this chat room');
      }
    }
    await populateAllowedUsers(chat);
    
    if (chat.type === 'private-message') {
      if (chat.allowedUsers.some((user) => user._id.equals(req.user._id))) {
        return res.render('chat-room', {
          user: req.user,
          chat,
          messages,
        });
      } else {
        throw new Error('Not allowed in this chat room');
      }
    }

    if (!chat.owner._id.equals(req.user._id) 
      && (chat.type === 'private' && !chat.allowedUsers.some((user) => user._id.equals(req.user._id)))) {
      return res.render('chat-room-login', {
        user: req.user,
        chat,
      });
    }

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

exports.post_chat = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {
    const chat = await getChat(req.body.chatId);
    const correctPassword = await verifyChatPassword(chat, req.body.chatPassword);

    if (userAllowedInChat(chat, req.user)) {
      const [ messages, populateUsersVoid ]  = await Promise.all([
        getMessages(chat._id),
        populateAllowedUsers(chat),
      ]);

      return res.render('chat-room', {
        user: req.user,
        chat,
        messages,
      });
    }

    if (!correctPassword) {
      return res.render('chat-room-login', {
        user: req.user,
        chat,
        error: { password: true }
      });
    }

    const [ addUserToChatVoid, messages ] = await Promise.all([
      addUserToChat(chat._id, req.user._id),
      getMessages(chat._id),
    ]);

    await populateAllowedUsers(chat);
    
    return res.render('chat-room', {
      user: req.user,
      chat,
      messages,
    });
  }),
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

exports.post_edit_chat = [
  express.json(),
  express.urlencoded({ extended: false }),
  body('userId'),
  body('chatId'),
  body('topic') 
    .optional(),
  async (req, res, next) => {
    await changeTopic(req.user, req.body.chatId, req.body.topic)
      .then(() => {
        if (clients[req.body.chatId].length > 0) {
          clients[req.body.chatId].forEach((ws) => {
            const packet = {
              action: 'topic-change',
              data: req.body.topic,
            };
            const json = JSON.stringify(packet);
            ws.send(json);
          });
        }

      })
      .catch((err) => {
        next(err);
      });

    return res.status(200).json({ msg: 'success' });
  },
];

exports.post_mod_action = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {
    const chat = await getChat(req.params.chatId);
    let userSocket;
    if (!chat.owner._id.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    // find socket associated with username if present
    if (req.body.username) {
      userSocket = clients[req.params.chatId].find((ws) => {
        return ws.username === req.body.username;
      });
    }

    if (req.body.action === 'kick' && userSocket) {
      userSocket.close(4003, 'You have been kicked from the chat');
    } else if (req.body.action === 'ban') {
      const user = await findByUsername(req.body.username);
      await banUserFromChat(chat, user);
      if (userSocket) {
        userSocket.close(4003, 'You have been banned from this chatroom');
      }
    } else if (req.body.action === 'unban') {
      if (req.body.users && !Array.isArray(req.body.users)) {
        req.body.users = [ req.body.users ];
      }

      await unbanUsers(chat, req.body.users);
    }

    return res.status(200).json({ msg: 'success' });
  }),
];

exports.ws_chat_visited = async function (ws, req) {
  const { chatId } = req.params;
  const userJoinedPacket = {};
  const currentUsersPacket = {};

  if (clients[chatId] === undefined) {
    const chat = await getChat(chatId);
    clients[chatId] = [];
    clients[chatId].currentUsers = [];
    clients[chatId].roomType = chat.type;
  }

  currentUsersPacket.action = 'current-users';
  currentUsersPacket.roomType = clients[chatId].roomType;
  currentUsersPacket.data = {
    currentUsers: clients[chatId].currentUsers,
  };
  
  ws.send(JSON.stringify(currentUsersPacket));

  ws.username = req.user.username; // add ability to identify who socket belongs to.
  clients[chatId].push(ws);
  clients[chatId].currentUsers.push(req.user.username);

  userJoinedPacket.action = 'join';
  userJoinedPacket.roomType = clients[chatId].roomType;
  userJoinedPacket.data = {
    user: req.user.username,
  };

  clients[chatId].forEach((client) => {
    client.send(JSON.stringify(userJoinedPacket));
  });

  ws.on('close', () => {
    const userLeftPacket = {};
    userLeftPacket.action = 'leave';
    userLeftPacket.roomType = clients[chatId].roomType;
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
