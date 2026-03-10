const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Protect user routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Protect admin routes
exports.adminProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }
    const admin = await Admin.findById(decoded.id).select('+password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin not found or deactivated' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Check specific admin permission
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated as admin' });
    }
    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires '${permission}' permission`,
      });
    }
    next();
  };
};

// Super admin only
exports.superAdminOnly = (req, res, next) => {
  if (!req.admin || !req.admin.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  next();
};
