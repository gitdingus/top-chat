const crypto = require('crypto');

function generateSaltHash(password) {
  const normalizedPwd = password.normalize();
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(normalizedPwd, salt, 1000, 128, 'sha512').toString('hex');

  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const normalizedPwd = password.normalize();
  const hashAttempt = crypto.pbkdf2Sync(normalizedPwd, salt, 1000, 128, 'sha512').toString('hex');

  if (hashAttempt !== hash) {
    return false;
  }

  return true;
}
module.exports = {
  generateSaltHash,
  verifyPassword,
};