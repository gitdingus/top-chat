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

module.exports = {
  createAccount,
}