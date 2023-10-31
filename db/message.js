const Message = require('../models/message.js');

async function createMessage(messageObj) {
  const message = new Message({
    chat: messageObj.chat,
    author: messageObj.author,
    timestamp: new Date(),
    type: messageObj.type,
    data: messageObj.data,
  })

  return await message.save();
}

module.exports = {
  createMessage,
};
