const mongoose = require('mongoose');
const User = require('../models/user.js');
const { createChat, findPrivateMessages } = require('../db/chat.js');
const { generateSaltHash } = require('../utils/passwordUtils.js');

async function acceptFriend(user, friendId) {
  let result;

  const friendExists = user.friends.some((entry) => {
    if (entry.friend.toString() === friendId) {
      return true;
    }
  });

  if (!friendExists) {
    result = 'not found';
    return result;
  }

  const session = await mongoose.startSession();

  await session.withTransaction(async (s) => {
    const friend = await User.findById(friendId).session(s).exec();
    const prevPrivateMessages = await findPrivateMessages(user, friend);

    if (prevPrivateMessages.length === 0) {
      const chat = await createChat({ type: 'private-message', allowedUsers: [user._id, friend._id] });
    } else {
      chat = prevPrivateMessages[0];
    }


    const friendEntry1 = user.friends.find((entry) => {
      return entry.friend._id.toString() === friendId;
    });

    const friendEntry2 = friend.friends.find((entry) => {
      return entry.friend._id.equals(user._id) === true;
    });

    friendEntry1.status = 'friend';
    friendEntry1.chat = chat;
    friendEntry2.status = 'friend';
    friendEntry2.chat = chat;

    await user.save({session: s});
    await friend.save({session: s});
  })
    .then(() => session.endSession())
    .then(() => {
      result = 'success';
    })
    .catch((err) => {
      console.log(err);
      result = 'failed';
    });

  return result;
}

async function addFriend(user, friendId) {
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

  const session = await mongoose.startSession();

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
    .then(() => session.endSession())
    .then(() => {
      result = 'success';
    })
    .catch((err) => {
      console.log(err);
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

async function getFriends(user) {
  await User.populate(user.friends, {
    path: 'friend',
    select: '-salt -hash -friends -chats',
  });
}

async function locateUsers(data) {
  const users = await User.find({ $or: [{ username: data }, { email: data }]}).exec();

  return users;
}

async function populateChats(user) {
  await User.populate(user, {
    path: 'chats',
    select: 'name topic description',
  });

  return user;
}

async function rejectFriend(user, friendId) {
  let result;

  const friendExists = user.friends.some((entry) => {
    if (entry.friend.toString() === friendId) {
      return true;
    }
  });

  if (!friendExists) {
    result = 'not found';
    return result;
  }

  const session = await mongoose.startSession();

  await session.withTransaction(async (s) => {
    const friend = await User.findById(friendId).session(s).exec();

    const friendEntry1Index = user.friends.findIndex((entry) => {
      if (entry.friend.equals(friend._id)) {
        return true;
      }
    });

    const friendEntry2Index = friend.friends.findIndex((entry) => {
      if (entry.friend.equals(user._id)) {
        return true;
      }
    });

    user.friends.splice(friendEntry1Index, 1);
    friend.friends.splice(friendEntry2Index, 1);

    await user.save();
    await friend.save();
  })
    .then(() => session.endSession())
    .then(() => {
      result = 'success';
    })
    .catch((err) => {
      console.log(err);
      result = 'failed';
    });

  return result;
}

async function updateUser(user, updates) {
  Object.keys(updates).forEach((key) => {
    user[key] = updates[key];
  });

  return await user.save();
}

module.exports = {
  acceptFriend,
  addFriend,
  createAccount,
  findById,
  findByUsername,
  getFriends,
  locateUsers,
  populateChats,
  rejectFriend,
  updateUser,
}