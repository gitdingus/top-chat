const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  type: {
    type: String,
    enum: ['public', 'private'],
    required: true,
  },
  allowedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
})

module.exports = mongoose.model('Chat', chatSchema);