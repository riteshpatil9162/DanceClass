const express = require('express');
const router = express.Router();
const {
  getEvents, getEventBySlug, getEventByBookingSlug, getUpcomingEvents,
  adminGetEvents, createEvent, updateEvent, deleteEvent, updateSponsors, regenerateBookingSlug,
} = require('../controllers/eventController');
const { adminProtect, requirePermission } = require('../middleware/auth');
const { uploadEventImages, uploadSponsorLogos } = require('../middleware/upload');

// Public routes
router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/book/:bookingSlug', getEventByBookingSlug);
router.get('/:slug', getEventBySlug);

// Admin routes
router.get('/admin/all', adminProtect, requirePermission('manage_events'), adminGetEvents);
router.post(
  '/admin/create',
  adminProtect,
  requirePermission('manage_events'),
  uploadEventImages.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]),
  createEvent
);
router.put(
  '/admin/:id',
  adminProtect,
  requirePermission('manage_events'),
  uploadEventImages.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]),
  updateEvent
);
router.delete('/admin/:id', adminProtect, requirePermission('manage_events'), deleteEvent);

// Sponsors — up to 10 logo images via sponsorLogos[]
router.put(
  '/admin/:id/sponsors',
  adminProtect,
  requirePermission('manage_sponsors'),
  uploadSponsorLogos.array('sponsorLogos', 10),
  updateSponsors
);

router.post('/admin/:id/regen-slug', adminProtect, requirePermission('manage_events'), regenerateBookingSlug);

module.exports = router;
