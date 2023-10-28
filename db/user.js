const User = require('../models/user.js');
const { generateSaltHash } = require('../utils/passwordUtils.js');

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

async function updateUser(user, updates) {
  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
  });

  return await user.save();
}

async function locateUsers(data) {
  const users = await User.find({ $or: [{ username: data }, { email: data }]}).exec();

  return users;
}

module.exports = {
  createAccount,
  findById,
  findByUsername,
  locateUsers,
  updateUser,
}