const asyncHandler = require('express-async-handler');
const express = require('express');
const multer = require('multer');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { 
  acceptFriend,
  addFriend,
  createAccount,
  findByUsername, 
  getFriends,
  getPublicProfiles,
  locateUsers,
  rejectFriend,
  updateUser,
} = require('../db/user.js');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const User = require('../models/user.js');

// config multer
const upload = multer({ storage: multer.memoryStorage() });

// config firebase
const serviceAccount = require('../../image-store-credentials/image-store-e09d9-firebase-adminsdk-r3avv-65cab44ecc.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'image-store-e09d9.appspot.com',
});

const fsBucket = getStorage().bucket();

exports.delete_profile_image = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {

    if (!req.user.image) {
      res.status(404).json({ msg: 'Profile image not found'});
      return;
    }

    const imageUrl = new URL(req.user.image);
    const pathname = decodeURIComponent(imageUrl.pathname);
    const imageFilename = `/top-chat/${pathname.substring(pathname.lastIndexOf('/') + 1)}`;

    fsBucket.file(imageFilename).delete()
      .then(async () => {
        await updateUser(req.user, { image: '' });
        res.status(200).json({ msg: 'Profile image deleted successfully' });
        return;
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ msg: 'Could not delete profile image' });
        return;
      });

  }),
];

exports.get_create_account = (req, res, next) => {
  return res.render('create-account');
};

exports.get_login = (req, res, next) => {
  const error = {};
  const sessionMessages = req.session.messages;

  if (sessionMessages && sessionMessages.length > 0) {
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

exports.get_edit_profile = (req, res, next) => {
  res.render('edit-profile', {
    user: req.user,
  });
};

exports.get_friends = [
  asyncHandler(async (req, res, next) => {
    await getFriends(req.user);
    
    res.render('friends', {
      user: req.user,
    });
  }),
];

exports.get_locate_users = [
  asyncHandler(async (req, res, next) => {
    const publicProfiles = await getPublicProfiles();

    return res.render('locate-users', {
      user: req.user,
      users: publicProfiles,
    });
  }),
];

exports.get_my_profile = (req, res, next) => {
  res.render('user-profile', {
    user: req.user,
    profile: req.user,
  });
};

exports.get_user = [
  asyncHandler(async (req, res, next) => {
    const profile = await findByUsername(req.params.username);
  
    res.render('user-profile', {
      user: req.user,
      profile,
    });
  }),
]

exports.post_accept_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {
    const result = await acceptFriend(req.user, req.body.friendId);

    res.status(200).json({ msg: result });
  }),
];

exports.post_add_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {
    const result = await addFriend(req.user, req.body.friendId);

    res.status(200).json({ msg: result });
  }),
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
    .optional({ values: 'falsy' })
    .isEmail(),
  body('birthday')
    .optional({ values: 'falsy' })
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
  body('show_online_status')
    .optional()
    .customSanitizer((value) => {
      if (value === 'on') {
        return true;
      }

      return false;
    }),
  asyncHandler (async (req, res, next) => {
    const editedUser = new User({
      _id: req.user._id,
      // mongoose implicitly sets arrays to []
      // add req.user.friends to avoid deletion of friends list
      friends: req.user.friends,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      birthday: req.body.birthday,
      about: req.body.about,
      public: req.body.public || false,
      showOnlineStatus: req.body.show_online_status || false,
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
  }),
];

exports.post_locate_users = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler (async (req, res, next) => {
    const users = await locateUsers(req.body.search);

    return res.render('locate-users', {
      term: req.body.search,
      user: req.user,
      users,
    });
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

exports.post_logout = [
  asyncHandler (async (req, res, next) => {
    // set online status to false on logout
    await updateUser(req.user, { online: false });
  
    req.logout(async function (err) {
      if (err) {
        return next(err);
      }
  
      res.redirect('/');
    });
  }),
];

exports.post_profile_image = [
  upload.single('profile-pic'),
  asyncHandler(async (req, res, next) => {

    if (!req.file) {
      res.status(400).json({ msg: 'No profile picture uploaded' });
      return;
    }

    if (req.user.image) {
      // cleanup users old profile pic
      const currentPicUrl = new URL(req.user.image);
      const pathname = currentPicUrl.pathname;
      const currentPicFilename = decodeURIComponent(pathname.substring(pathname.lastIndexOf('/') + 1));
      const currentProfilePic = fsBucket.file(currentPicFilename);

      await currentProfilePic.delete();
    }

    const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));
    const newFilename = `/top-chat/${req.user.username}-profile-pic${extension}`;
    const imageFile = fsBucket.file(newFilename);

    imageFile.save(req.file.buffer)
      .then(async() => {
        const downloadURL = await getDownloadURL(imageFile);
        const updateObj = {
          image: downloadURL,
        };

        await updateUser(req.user, updateObj);
        res.status(200).json({ msg: 'success' });
        return;
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ msg: 'upload failed' });
        return;
      });
  }),
];

exports.post_reject_friend = [
  express.json(),
  express.urlencoded({ extended: false }),
  asyncHandler(async (req, res, next) => {
    const result = await rejectFriend(req.user, req.body.friendId);

    res.status(200).json({ msg: result });
  }),
];
