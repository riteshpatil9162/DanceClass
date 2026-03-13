const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseBySlug, getFeaturedCourses, getCategories,
  getCourseContent,
  adminGetCourses, createCourse, updateCourse, deleteCourse, togglePublish,
} = require('../controllers/courseController');
const { protect, adminProtect, requirePermission } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

// Multer wrapper — only runs multer when the request is multipart (has a file).
// For plain JSON requests multer is skipped entirely, preventing "next is not a function" errors.
const optionalThumbnail = (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (!ct.includes('multipart/form-data')) return next();
  uploadThumbnail.single('thumbnail')(req, res, next);
};

// Public routes
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);

// Admin routes (must come before /:slug to avoid conflict)
router.get('/admin/all', adminProtect, requirePermission('manage_courses'), adminGetCourses);
router.post('/admin/create', adminProtect, requirePermission('manage_courses'), optionalThumbnail, createCourse);
router.put('/admin/:id', adminProtect, requirePermission('manage_courses'), optionalThumbnail, updateCourse);
router.delete('/admin/:id', adminProtect, requirePermission('manage_courses'), deleteCourse);
router.patch('/admin/:id/toggle-publish', adminProtect, requirePermission('manage_courses'), togglePublish);

// Protected user route — full content (videos) for enrolled users only
router.get('/:slug/content', protect, getCourseContent);

// Dynamic slug route (must come after all static paths)
router.get('/:slug', getCourseBySlug);

module.exports = router;
