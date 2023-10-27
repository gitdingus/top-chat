const express = require('express');
const passport = require('passport');

const { createAccount } = require('../db/user.js');
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
