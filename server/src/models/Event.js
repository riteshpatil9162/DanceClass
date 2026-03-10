const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  partnerType: { type: String, required: true }, // e.g., "Gaming Partner", "Travel Partner"
  logo: { type: String, default: '' },
  logoPublicId: { type: String, default: '' }, // Cloudinary public_id for deletion
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    bannerImagePublicId: { type: String, default: '' },

    // Type
    eventType: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    venue: { type: String },
    meetLink: { type: String },

    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    bookingOpenDate: { type: Date, default: Date.now },
    bookingCloseDate: { type: Date, required: true },

    // Seats
    totalSeats: { type: Number, default: null }, // null = unlimited
    bookedSeats: { type: Number, default: 0 },
    isLimitedSeats: { type: Boolean, default: false },

    // Pricing
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    discountedPrice: { type: Number, default: null },

    // Temporary booking URL slug (unique short url)
    bookingUrlSlug: { type: String, unique: true, sparse: true },
    isTemporaryPage: { type: Boolean, default: false },

    // Countdown / Hype
    showCountdown: { type: Boolean, default: true },
    hypeMessage: { type: String, default: '' },

    // Sponsors
    sponsors: [sponsorSchema],

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],

    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

eventSchema.virtual('isSoldOut').get(function () {
  if (!this.isLimitedSeats) return false;
  return this.bookedSeats >= this.totalSeats;
});

eventSchema.virtual('isBookingOpen').get(function () {
  const now = new Date();
  return now >= this.bookingOpenDate && now <= this.bookingCloseDate;
});

eventSchema.virtual('seatsLeft').get(function () {
  if (!this.isLimitedSeats) return null;
  return Math.max(0, this.totalSeats - this.bookedSeats);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Auto slug
eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
