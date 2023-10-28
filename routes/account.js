const accountsController = require('../controllers/accountsController.js');
const express = require('express');
const accountRouter = express.Router();

accountRouter.post('/create-account', accountsController.post_create_account);
accountRouter.post('/login', accountsController.post_login);

accountRouter.get('/create-account', accountsController.get_create_account);
accountRouter.get('/login', accountsController.get_login);
accountRouter.get('/logout', accountsController.get_logout);

accountRouter.get('/me', accountsController.get_my_profile);
accountRouter.get('/me/edit', accountsController.get_edit_profile);
accountRouter.post('/me/edit', accountsController.post_edit_profile);

module.exports = accountRouter;