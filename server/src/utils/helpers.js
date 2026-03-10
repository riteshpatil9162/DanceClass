const { v4: uuidv4 } = require('uuid');

exports.generateReceiptId = () => {
  return 'RCPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

exports.generateTicketId = () => {
  return 'TKT-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
};

exports.generateBookingSlug = () => {
  return 'evt-' + uuidv4().split('-')[0] + '-' + Date.now().toString(36);
};

exports.paginate = (query, page = 1, limit = 12) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return query.skip(skip).limit(parseInt(limit));
};

exports.createApiResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};
