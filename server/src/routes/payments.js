const express = require('express');
const router = express.Router();
const {
  createCourseOrder, verifyCoursePayment,
  createPackageOrder, verifyPackagePayment,
  createEventOrder, verifyEventPayment,
  getUserOrders, adminGetOrders,
} = require('../controllers/paymentController');
const { protect, adminProtect, requirePermission } = require('../middleware/auth');

// Course payments
router.post('/course/create-order', protect, createCourseOrder);
router.post('/course/verify', protect, verifyCoursePayment);

// Package payments
router.post('/package/create-order', protect, createPackageOrder);
router.post('/package/verify', protect, verifyPackagePayment);

// Event payments
router.post('/event/create-order', protect, createEventOrder);
router.post('/event/verify', protect, verifyEventPayment);

// User orders
router.get('/my-orders', protect, getUserOrders);

// Admin orders
router.get('/admin/all', adminProtect, requirePermission('manage_orders'), adminGetOrders);

module.exports = router;
