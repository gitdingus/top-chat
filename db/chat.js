const Chat = require('../models/chat.js');
const User = require('../models/user.js');
const { generateSaltHash } = require('../utils/passwordUtils.js');

async function addUserToChat(chatId, userId) {
  const [ chat, user ] = await Promise.all([
    Chat.findById(chatId).exec(),
    User.findById(userId).exec(),
  ]);

  chat.allowedUsers.push(user);

  return await chat.save();
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

module.exports = {
  addUserToChat,
  createChat,
  getChat,
  getOwnedRooms,
  getPublicRooms,
  populateAllowedUsers,
  removeUserFromChat,
}