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
})

module.exports = mongoose.model('Chat', chatSchema);