const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const { 
  acceptFriend,
  addFriend,
  createAccount,
  findByUsername, 
  locateUsers,
  rejectFriend,
  updateUser,
} = require('../db/user.js');
const User = require('../models/user.js');

exports.get_create_account = (req, res, next) => {
  return res.render('create-account');
};

exports.get_login = (req, res, next) => {
  const error = {};
  const sessionMessages = req.session.messages;

  if (sessionMessages.length > 0) {
    // check if last message is from a failed login, if not
    // put it back else, flag failed login
    lastMessage = sessionMessages.pop();
    if (lastMessage !== 'post_login failed') {
      sessionMessages.push(lastMessage);
    } else {
      error.failed = true;
    }
  }

  return res.render('login', {
    error,
  });
};

exports.get_logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
};

exports.get_edit_profile = (req, res, next) => {
  res.render('edit-profile', {
    user: req.user,
  });
};

exports.get_locate_users = [
  (req, res, next) => {
    return res.render('locate-users', {
      user: req.user,
    });
  }
];

exports.get_my_profile = (req, res, next) => {
  res.render('user-profile', {
    user: req.user,
    profile: req.user,
  });
};

exports.get_user = async (req, res, next) => {
  const profile = await findByUsername(req.params.username);

  res.render('user-profile', {
    user: req.user,
    profile,
  });
}

exports.post_accept_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    const result = await acceptFriend(req.user, req.body.friendId);

    console.log(result);
    res.status(200).json({ msg: result });
  }
];

exports.post_add_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    const result = await addFriend(req.user, req.body.friendId);

    res.status(200).json({ msg: result });
  },
];

exports.post_create_account = [
  express.json(),
  express.urlencoded({ extended: false }),
  (req, res, next) => {
    const newUser = new User({
      email: req.body.email,
      username: req.body.username,
    });

    const error = {}

    if (!req.body.email) {
      error.email = 'Must provide an email address';
    }

    if (!req.body.username) {
      error.username = 'Must provide a username';
    }

    if (!req.body.password) {
      error.password = 'Must provide a password';
    }

    if (req.body.password !== req.body.confirm_password) {
      error.confirm_password = 'Passwords must match';
    }

    if (Object.keys(error).length > 0) {
      res.status(400).render('create-account', {
        error,
        newUser,
      });
      return;
    }

    createAccount(newUser.email, newUser.username, req.body.password)
      .then((account) => {
        return next();
    })
      .catch((err) => {
        if (err.message === 'email exists') {
          res.status(400).render('create-account', {
            newUser,
            error: {
              email: 'Account is already registered with that email address',
            }
          });
          return;
        }

        if (err.message === 'username exists') {
          res.status(400).render('create-account', {
            newUser,
            error: {
              username: 'Account with that username already exists',
            },
          });
          return;
        }
      })
  },
  passport.authenticate('local', { 
    successRedirect: '/', 
  }),
];

exports.post_edit_profile = [
  express.json(),
  express.urlencoded({ extended: false }),
  body('first_name')
    .optional(),
  body('last_name')
    .optional(),
  body('email')
    .optional()
    .isEmail(),
  body('birthday')
    .optional()
    .isISO8601(),
  body('about')
    .optional(),
  body('public')
    .optional()
    .customSanitizer((value) => {
      if (value === 'on') {
        return true;
      }

      return false;
    }),
  async (req, res, next) => {
    const editedUser = new User({
      _id: req.user._id,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      birthday: req.body.birthday,
      about: req.body.about,
      public: req.body.public,
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('edit-profile', {
        user: editedUser,
        error: errors.mapped(),
      });
    }

    await updateUser(req.user, editedUser.toObject());
    
    return res.redirect('/users/me');
  }
];

exports.post_locate_users = [
  express.json(),
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    const users = await locateUsers(req.body.search);

    return res.render('locate-users', {
      term: req.body.search,
      user: req.user,
      users,
    });
  }
];

exports.post_login = [
  express.json(),
  express.urlencoded({ extended: false }),
  (req, res, next) => {
    const error = {};

    if (!req.body.username) {
      error.username = 'Must enter username';
    }

    if (!req.body.password) {
      error.password = 'Must enter password';
    }

    if (Object.keys(error).length > 0) {
      res.status(400).render('login', {
        error,
      });
      return;
    }

    next();
  },
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureMessage: 'post_login failed',
  }),
];

exports.post_reject_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  async (req, res, next) => {
    const result = await rejectFriend(req.user, req.body.friendId);

    console.log(result);
    res.status(200).json({ msg: result });
  }
];
