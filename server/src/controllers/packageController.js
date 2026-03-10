const Package = require('../models/Package');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all published packages (public)
exports.getPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ isPublished: true, isActive: true })
      .populate('courses', 'title slug thumbnail instructor')
      .populate('bonusCourses', 'title slug thumbnail instructor')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: packages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single package by slug
exports.getPackageBySlug = async (req, res, next) => {
  try {
    const pkg = await Package.findOne({ slug: req.params.slug, isPublished: true, isActive: true })
      .populate('courses')
      .populate('bonusCourses');
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

// ===== ADMIN =====

exports.adminGetPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({})
      .populate('courses', 'title')
      .populate('bonusCourses', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: packages });
  } catch (err) {
    next(err);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const pkgData = { ...req.body, createdBy: req.admin._id };
    if (req.file) {
      pkgData.thumbnail = req.file.path;
      pkgData.thumbnailPublicId = req.file.filename;
    }
    const pkg = await Package.create(pkgData);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    const updateData = { ...req.body };

    if (req.file) {
      await deleteFromCloudinary(pkg.thumbnailPublicId);
      updateData.thumbnail = req.file.path;
      updateData.thumbnailPublicId = req.file.filename;
    }

    const updated = await Package.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package removed' });
  } catch (err) {
    next(err);
  }
};
