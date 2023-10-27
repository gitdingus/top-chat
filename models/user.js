const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  hash: { 
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
  birthday: Date,
  firstName: String,
  lastName: String,
  image: String,
  about: {
    type: String,
    maxLength: 1000,
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
});

module.exports = mongoose.model('User', userSchema);
