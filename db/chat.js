const Chat = require('../models/chat.js');
const User = require('../models/user.js');

async function addUserToChat(chatId, userId) {
  const [ chat, user ] = await Promise.all([
    Chat.findById(chatId).exec(),
    User.findById(userId).exec(),
  ]);

  chat.allowedUsers.push(user);

  return await chat.save();
}

async function createChat(type, userIds) {
  const chat = new Chat({
    type,
    allowedUsers: userIds,
  })

  return await chat.save();
}

async function getChat(chatId) {
  const chat = await Chat.findById(chatId).exec();
  return chat;
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
module.exports = {
  addUserToChat,
  createChat,
  getChat,
  removeUserFromChat,
}