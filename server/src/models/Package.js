const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' }, // Cloudinary public_id for deletion

    // Courses included
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    // Bonus/free courses (buy 1 get 1)
    bonusCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

    // Pricing
    originalPrice: { type: Number, default: 0 }, // sum of individual
    price: { type: Number, required: true }, // package price
    discountedPrice: { type: Number, default: null },
    isFree: { type: Boolean, default: false },
    discount: { type: Number, default: 0 }, // % discount

    // Access
    accessType: {
      type: String,
      enum: ['lifetime', 'fixed_period'],
      default: 'lifetime',
    },
    accessDurationDays: { type: Number, default: null },

    isActive: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },

    totalPurchases: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

packageSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Package', packageSchema);
