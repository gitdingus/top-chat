const Message = require('../models/message.js');

async function createMessage(messageObj) {
  const message = new Message({
    chat: messageObj.chat,
    author: messageObj.author,
    timestamp: messageObj.timestamp || new Date(),
    type: messageObj.type,
    data: messageObj.data,
  })

  return await message.save();
}

async function populate(message) {
  await Message.populate(message, {
    path: 'author',
    select: 'username',
  });
}

async function getMessages(chatId, limit = 20) {
  const messages = await Message
    .find({ chat: chatId })
    .sort({ timestamp: 'desc'})
    .limit(limit)
    .populate('author', 'username')
    .exec();

  return messages;
}

module.exports = {
  createMessage,
  getMessages,
  populate,
};
