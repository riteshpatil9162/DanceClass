const Event = require('../models/Event');
const { generateBookingSlug } = require('../utils/helpers');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all published events (public)
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const query = { isPublished: true, isActive: true };
    const [events, total] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }).skip(skip).limit(limit),
      Event.countDocuments(query),
    ]);

    res.json({ success: true, data: events, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event by slug
exports.getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, isPublished: true, isActive: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Get event by temporary booking slug
exports.getEventByBookingSlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ bookingUrlSlug: req.params.bookingSlug, isActive: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event booking page not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Get upcoming events (for home page)
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      isPublished: true,
      isActive: true,
      startDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(4);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

// ===== ADMIN EVENT MANAGEMENT =====

// @desc    Get all events (admin)
exports.adminGetEvents = async (req, res, next) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event (admin)
exports.createEvent = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Map form field names → model field names
    if (body.date) { body.startDate = body.date; delete body.date; }
    if (!body.endDate && body.startDate) body.endDate = body.startDate;
    if (!body.bookingCloseDate) body.bookingCloseDate = body.endDate || body.startDate;

    const eventData = { ...body, createdBy: req.admin._id };

    if (req.files) {
      if (req.files.thumbnail) {
        eventData.thumbnail = req.files.thumbnail[0].path;
        eventData.thumbnailPublicId = req.files.thumbnail[0].filename;
      }
      if (req.files.bannerImage) {
        eventData.bannerImage = req.files.bannerImage[0].path;
        eventData.bannerImagePublicId = req.files.bannerImage[0].filename;
      }
    }

    // Auto-generate booking URL slug if temporary page
    if (eventData.isTemporaryPage && !eventData.bookingUrlSlug) {
      eventData.bookingUrlSlug = generateBookingSlug();
    }

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc    Update event (admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.thumbnail) {
        await deleteFromCloudinary(event.thumbnailPublicId);
        updateData.thumbnail = req.files.thumbnail[0].path;
        updateData.thumbnailPublicId = req.files.thumbnail[0].filename;
      }
      if (req.files.bannerImage) {
        await deleteFromCloudinary(event.bannerImagePublicId);
        updateData.bannerImage = req.files.bannerImage[0].path;
        updateData.bannerImagePublicId = req.files.bannerImage[0].filename;
      }
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isPublished: false },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Add/Update sponsors on event (with image uploads)
// Expects multipart/form-data with:
//   sponsors[0][partnerType], sponsors[1][partnerType], ...
//   sponsorLogos (array of files in same index order)
exports.updateSponsors = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Delete old sponsor logos from Cloudinary
    for (const sp of event.sponsors || []) {
      await deleteFromCloudinary(sp.logoPublicId);
    }

    // Build new sponsors array
    let sponsorsData = [];
    try {
      // Body may arrive as JSON string or as indexed fields
      if (req.body.sponsors) {
        sponsorsData = typeof req.body.sponsors === 'string'
          ? JSON.parse(req.body.sponsors)
          : req.body.sponsors;
      }
    } catch (_) {
      sponsorsData = [];
    }

    const sponsorFiles = req.files || []; // array from upload.array('sponsorLogos', 10)

    const sponsors = sponsorsData.map((sp, i) => ({
      partnerType: sp.partnerType,
      logo: sponsorFiles[i] ? sponsorFiles[i].path : (sp.logo || ''),
      logoPublicId: sponsorFiles[i] ? sponsorFiles[i].filename : (sp.logoPublicId || ''),
    }));

    event.sponsors = sponsors;
    await event.save();
    res.json({ success: true, data: event.sponsors });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate new booking URL slug
exports.regenerateBookingSlug = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.bookingUrlSlug = generateBookingSlug();
    event.isTemporaryPage = true;
    await event.save();
    res.json({ success: true, data: { bookingUrlSlug: event.bookingUrlSlug } });
  } catch (err) {
    next(err);
  }
};
