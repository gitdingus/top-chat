const mongoose = require('mongoose');
const User = require('../models/user.js');
const { generateSaltHash } = require('../utils/passwordUtils.js');

async function addFriend(user, friendId) {
  const session = await mongoose.startSession();
  let result;

  const friendExists = user.friends.some((entry) => {
    if (entry.friend.toString() === friendId) {
      return true;
    }
  });

  if (friendExists) {
    result = 'exists';
    return result; 
  }

  await session.withTransaction(async (s) => {
    const friend = await User.findById(friendId).session(s).exec();
  
    user.friends.push({
      friend: friendId,
      status: 'sent',
    });

    friend.friends.push({
      friend: user._id,
      status: 'recieved',
    });

    await user.save({ session: s });
    await friend.save({ session: s });
  })
    .then(() => {
      session.endSession();
      result = 'success';
    })
    .catch(() => {
      result = 'failed';
    });

  return result;
}

async function createAccount(email, username, password) {
  const user = await User.findOne({ $or: [{ email: email }, { username: username }] }).exec();

  if (user) {
    if (user.email === email) {
      throw new Error('email exists');
    }

    if (user.username === username) {
      throw new Error('username exists');
    }
  }

  const { salt, hash } = generateSaltHash(password);
  const newUser = new User({
    username,
    email,
    salt,
    hash,
    created: new Date(),
  });

  await newUser.save();

  return newUser;
}

async function findById(id) {
  const user = await User.findById(id).exec();

  return user;
}

async function findByUsername(username) {
  const user = await User.findOne({ username }).exec();

  return user;
}

async function locateUsers(data) {
  const users = await User.find({ $or: [{ username: data }, { email: data }]}).exec();

  return users;
}

async function updateUser(user, updates) {
  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
  });

  return await user.save();
}

module.exports = {
  addFriend,
  createAccount,
  findById,
  findByUsername,
  locateUsers,
  updateUser,
}