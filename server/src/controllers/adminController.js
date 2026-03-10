const Admin = require('../models/Admin');
const { generateAdminToken } = require('../utils/jwt');

// @desc    Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account deactivated' });
    }
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    const token = generateAdminToken(admin._id);
    res.json({
      success: true,
      token,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin profile
exports.getAdminProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.admin });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all admins (super admin)
exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new admin (super admin)
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'editor',
      permissions: permissions || [],
      isSuperAdmin: false,
      createdBy: req.admin._id,
    });
    res.status(201).json({
      success: true,
      data: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin permissions (super admin)
exports.updateAdminPermissions = async (req, res, next) => {
  try {
    const { permissions, role, isActive } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Cannot modify super admin' });
    }
    if (permissions !== undefined) admin.permissions = permissions;
    if (role !== undefined) admin.role = role;
    if (isActive !== undefined) admin.isActive = isActive;
    await admin.save();
    res.json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete admin
exports.deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Cannot delete super admin' });
    }
    await admin.deleteOne();
    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};
    const [users, total] = await Promise.all([
      require('../models/User').find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      require('../models/User').countDocuments(query),
    ]);
    res.json({ success: true, data: users, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    const Event = require('../models/Event');
    const Order = require('../models/Order');
    const Package = require('../models/Package');

    const [totalUsers, totalCourses, totalEvents, totalPackages, orders] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Package.countDocuments({ isActive: true }),
      Order.find({ status: 'paid' }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount / 100), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEvents,
        totalPackages,
        totalRevenue,
        totalOrders: orders.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
