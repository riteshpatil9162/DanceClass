const express = require('express');
const router = express.Router();
const {
  getPackages, getPackageBySlug,
  adminGetPackages, createPackage, updatePackage, deletePackage,
} = require('../controllers/packageController');
const { adminProtect, requirePermission } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

// Admin (must be before /:slug to avoid being swallowed by the dynamic param)
router.get('/admin/all', adminProtect, requirePermission('manage_packages'), adminGetPackages);
router.post('/admin/create', adminProtect, requirePermission('manage_packages'), uploadThumbnail.single('thumbnail'), createPackage);
router.put('/admin/:id', adminProtect, requirePermission('manage_packages'), uploadThumbnail.single('thumbnail'), updatePackage);
router.delete('/admin/:id', adminProtect, requirePermission('manage_packages'), deletePackage);

// Public
router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);

module.exports = router;
