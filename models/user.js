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
    friend: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['friend', 'sent', 'recieved'],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  }],
  chats: [{
    type: Schema.Types.ObjectId,
    ref: 'Chat',
  }],
  public: Boolean,
  online: Boolean,
  showOnlineStatus: Boolean,
});

userSchema.virtual('birthdayInputValueFormat').get(function () {
  if (!this.birthday) {
    return '';
  }
  
  const endIndex = this.birthday.toISOString().indexOf('T');
  return this.birthday.toISOString().substring(0, endIndex);
});

userSchema.virtual('url').get(function() {
  return `/users/${this.username}`;
});

module.exports = mongoose.model('User', userSchema);
