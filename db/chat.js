const mongoose = require('mongoose');
const Chat = require('../models/chat.js');
const User = require('../models/user.js');
const { generateSaltHash, verifyPassword } = require('../utils/passwordUtils.js');

async function addUserToChat(chatId, userId) {
  const session = await mongoose.startSession();
  session.withTransaction(async (s) => {
    const [ chat, user ] = await Promise.all([
      Chat.findById(chatId).session(s).exec(),
      User.findById(userId).session(s).exec(),
    ]);

    chat.allowedUsers.addToSet(user);
    user.chats.addToSet(chat);

    await chat.save({ session: s });
    await user.save({ session:s });
  })
    .then(() => session.endSession());
}

async function changeTopic(user, chatId, topic) {
  const chat = await Chat.findById(chatId);

  if (!chat.owner._id.equals(user._id)) {
    throw new Error('user is not owner of chat room');
  }

  chat.topic = topic;

  await chat.save();
}

async function createChat(chatObj) {
  let chat;

  if (chatObj.type === undefined) {
    throw new Error('room type has not been passed to createChat');
  }
  
  if (chatObj.type === 'private-message') {
    chat = new Chat({
      type: chatObj.type,
      allowedUsers: chatObj.allowedUsers,
    });
  }

  if (chatObj.type === 'private') {
    const salthash = generateSaltHash(chatObj.password);
    chat = new Chat({
      type: 'private',
      name: chatObj.name,
      description: chatObj.description,
      salt: salthash.salt,
      hash: salthash.hash,
    });
  }

  if (chatObj.type === 'public') {
    chat = new Chat({
      type: 'public',
      name: chatObj.name,
      description: chatObj.description,
    });
  }

  if (chatObj.type === 'public' || chatObj.type === 'private') {
    chat.owner = chatObj.owner;
  }

  return await chat.save();
}

async function findPrivateMessages(user1, user2) {
  const chat = await Chat
    .find({ 
      type: 'private-message', 
      allowedUsers: {
        $size: 2,
        $all: [ user1._id, user2._id ],
      },
    }).exec();

  return chat;
}

async function getChat(chatId) {
  const chat = await Chat.findById(chatId).populate('owner', 'username').exec();
  return chat;
}

async function getOwnedRooms(userId) {
  const rooms = await Chat.find({ owner: userId }).exec();
  return rooms;
}

async function getPublicRooms() {
  return await Chat.find({ type: 'public' }).exec();
}

async function removeUserFromChat(chatId, userId) {
  const [ chat, user ] = await Promise.all([
    Chat.findById(chatId).exec(),
    User.findById(userId).exec(),
  ]);

  const userIndex = chat.allowedUsers.findIndex((user) => {
    if (user._id.toString() === userId) {
      return true;
    }
  });

  if (userIndex !== -1) {
    chat.allowedUsers.splice(userIndex, 1);
  }

  return await chat.save();
}

async function populateAllowedUsers(chat) {
  await Chat.populate(chat, {
    path: 'allowedUsers',
    select: 'username',
  });
}

async function verifyChatPassword(chat, password) {
  return verifyPassword(password, chat.salt, chat.hash);
}

module.exports = {
  addUserToChat,
  changeTopic,
  createChat,
  getChat,
  getOwnedRooms,
  getPublicRooms,
  findPrivateMessages,
  populateAllowedUsers,
  removeUserFromChat,
  verifyChatPassword,
}