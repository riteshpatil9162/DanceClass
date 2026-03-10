const express = require('express');
const router = express.Router();
const {
  adminLogin, getAdminProfile, getAllAdmins, createAdmin, updateAdminPermissions,
  deleteAdmin, getAllUsers, toggleUserStatus, getDashboardStats,
} = require('../controllers/adminController');
const { adminProtect, requirePermission, superAdminOnly } = require('../middleware/auth');

// Public
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminProtect, getAdminProfile);
router.get('/stats', adminProtect, requirePermission('view_analytics'), getDashboardStats);

// Admin management (super admin only)
router.get('/admins', adminProtect, superAdminOnly, getAllAdmins);
router.post('/admins', adminProtect, superAdminOnly, createAdmin);
router.put('/admins/:id', adminProtect, superAdminOnly, updateAdminPermissions);
router.delete('/admins/:id', adminProtect, superAdminOnly, deleteAdmin);

// User management
router.get('/users', adminProtect, requirePermission('manage_users'), getAllUsers);
router.put('/users/:id/toggle', adminProtect, requirePermission('manage_users'), toggleUserStatus);

module.exports = router;
