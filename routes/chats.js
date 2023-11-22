const express = require('express');
const chatController = require('../controllers/chatController.js');
const chatRouter = express.Router();

chatRouter.get('/', chatController.get_chat_index);
chatRouter.get('/create', chatController.get_chat_create);
chatRouter.post('/create', chatController.post_chat_create);
chatRouter.get('/:chatId', chatController.get_chat);
chatRouter.post('/:chatId', chatController.post_chat);
chatRouter.post('/:chatId/edit', chatController.post_edit_chat);
chatRouter.post('/:chatId/moderate', chatController.post_mod_action);
chatRouter.ws('/:chatId', chatController.ws_chat_visited);

module.exports = chatRouter;