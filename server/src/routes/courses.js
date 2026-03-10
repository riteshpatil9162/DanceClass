const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseBySlug, getFeaturedCourses, getCategories,
  adminGetCourses, createCourse, updateCourse, deleteCourse, togglePublish,
} = require('../controllers/courseController');
const { adminProtect, requirePermission } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

// Public routes
router.get('/', getCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);

// Admin routes (must come before /:slug to avoid conflict)
router.get('/admin/all', adminProtect, requirePermission('manage_courses'), adminGetCourses);
router.post('/admin/create', adminProtect, requirePermission('manage_courses'), uploadThumbnail.single('thumbnail'), createCourse);
router.put('/admin/:id', adminProtect, requirePermission('manage_courses'), uploadThumbnail.single('thumbnail'), updateCourse);
router.delete('/admin/:id', adminProtect, requirePermission('manage_courses'), deleteCourse);
router.patch('/admin/:id/toggle-publish', adminProtect, requirePermission('manage_courses'), togglePublish);

// Dynamic slug route (must come after all static paths)
router.get('/:slug', getCourseBySlug);

module.exports = router;
