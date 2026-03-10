const jwt = require('jsonwebtoken');

exports.generateUserToken = (id) => {
  return jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.generateAdminToken = (id) => {
  return jwt.sign({ id, type: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.generateRefreshToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

exports.sendTokenResponse = (user, statusCode, res, type = 'user') => {
  const token =
    type === 'admin'
      ? exports.generateAdminToken(user._id)
      : exports.generateUserToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: user,
  });
};
