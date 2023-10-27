const LocalStrategy = require('passport-local');
const User = require('../models/user.js');
const { verifyPassword } = require('../utils/passwordUtils.js');

function configurePassport(passport) {
  passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await User.findOne({ username: username }).exec()
      .catch((err) => cb(err));

    if (user === null) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }

    if (!verifyPassword(password, user.salt, user.hash)) {
      return cb(null, false, { message: 'Incorrect username or password' });
    }

    return cb(null, user);
  }));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(async function(id, done) {
    const user = await User.findById(id).exec();

    done(null, user);
  });
}

module.exports = configurePassport;