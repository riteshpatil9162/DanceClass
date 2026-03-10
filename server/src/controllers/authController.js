const User = require('../models/User');
const { generateUserToken } = require('../utils/jwt');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = generateUserToken(user._id);
    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        purchasedCourses: user.purchasedCourses,
        bookedEvents: user.bookedEvents,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }
    const token = generateUserToken(user._id);
    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        purchasedCourses: user.purchasedCourses,
        bookedEvents: user.bookedEvents,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('purchasedCourses.course', 'title slug thumbnail')
      .populate('bookedEvents.event', 'title slug startDate');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile (name, phone)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };

    if (req.file) {
      // New avatar uploaded — delete old one from Cloudinary first
      const existing = await User.findById(req.user._id).select('avatarPublicId');
      if (existing?.avatarPublicId) {
        await deleteFromCloudinary(existing.avatarPublicId);
      }
      updateData.avatar = req.file.path;
      updateData.avatarPublicId = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    const token = generateUserToken(user._id);
    res.json({ success: true, message: 'Password updated', token });
  } catch (err) {
    next(err);
  }
};
