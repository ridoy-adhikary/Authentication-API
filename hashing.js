const bcrypt = require('bcryptjs');
const { createHmac } = require('crypto');

exports.doHash = async (password, saltRounds = 12) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.doHashValidation = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

exports.hmacProcess = (value, key) => {
  const result = createHmac('sha256', key).update(value).digest('hex');
  return result;
};