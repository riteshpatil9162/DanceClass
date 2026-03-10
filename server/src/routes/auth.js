const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
// Avatar is optional — use .single() but don't require it
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
