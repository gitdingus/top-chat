const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  type: {
    type: String,
    // public - anyone can find/join
    // private - can not find/must be invited
    // private-message - between two friends. can not find/no invites
    enum: ['public', 'private', 'private-message'],
    required: true,
  },
  allowedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  bannedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  salt: {
    type: String,
  },
  hash: {
    type: String, 
  },
  name: {
    type: String,
  },
  topic: {
    type: String,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('Chat', chatSchema);