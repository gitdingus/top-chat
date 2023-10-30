const accountsController = require('../controllers/accountsController.js');
const express = require('express');
const accountRouter = express.Router();

accountRouter.get('/', accountsController.get_locate_users);
accountRouter.post('/', accountsController.post_locate_users);

accountRouter.post('/create-account', accountsController.post_create_account);
accountRouter.post('/login', accountsController.post_login);

accountRouter.get('/create-account', accountsController.get_create_account);
accountRouter.get('/login', accountsController.get_login);
accountRouter.post('/logout', accountsController.post_logout);

accountRouter.get('/me', accountsController.get_my_profile);
accountRouter.get('/me/edit', accountsController.get_edit_profile);
accountRouter.post('/me/edit', accountsController.post_edit_profile);
accountRouter.post('/me/acceptfriend', accountsController.post_accept_friend);
accountRouter.post('/me/addfriend', accountsController.post_add_friend);
accountRouter.post('/me/rejectfriend', accountsController.post_reject_friend);
accountRouter.get('/:username', accountsController.get_user);

module.exports = accountRouter;