const express = require('express');
const chatController = require('../controllers/chatController.js');
const chatRouter = express.Router();

chatRouter.get('/', chatController.get_chat_index);

chatRouter.get('/:chatId', chatController.get_chat);
chatRouter.ws('/:chatId', chatController.ws_chat_visited);

module.exports = chatRouter;