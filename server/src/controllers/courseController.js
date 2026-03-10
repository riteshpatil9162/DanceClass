const Course = require('../models/Course');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all published courses (public)
exports.getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, search, sort } = req.query;

    let query = { isPublished: true, isActive: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { totalStudents: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };

    const [courses, total] = await Promise.all([
      Course.find(query).sort(sortObj).skip(skip).limit(limit).select('-curriculum'),
      Course.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: courses,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course by slug
exports.getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true, isActive: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured courses
exports.getFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true, isActive: true })
      .sort({ totalStudents: -1 })
      .limit(6)
      .select('-curriculum');
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

// ===== ADMIN COURSE MANAGEMENT =====

// @desc    Get all courses (admin)
exports.adminGetCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

// @desc    Create course (admin)
exports.createCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body, createdBy: req.admin._id };
    if (req.file) {
      courseData.thumbnail = req.file.path;           // Cloudinary secure URL
      courseData.thumbnailPublicId = req.file.filename; // Cloudinary public_id
    }
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course (admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(course.thumbnailPublicId);
      updateData.thumbnail = req.file.path;
      updateData.thumbnailPublicId = req.file.filename;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete / deactivate course (admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isPublished: false },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course removed successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle publish status
exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, data: course, message: `Course ${course.isPublished ? 'published' : 'unpublished'}` });
  } catch (err) {
    next(err);
  }
};

// @desc    Get categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true, isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
