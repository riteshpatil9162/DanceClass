const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    thumbnail: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    previewVideo: { type: String, default: '' },
    instructor: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    language: { type: String, default: 'English' },

    // Pricing
    price: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: null },
    isFree: { type: Boolean, default: false },

    // Expiry
    accessType: {
      type: String,
      enum: ['lifetime', 'fixed_period', 'registration_based'],
      default: 'lifetime',
    },
    // For fixed_period: access expires X days after purchase
    accessDurationDays: { type: Number, default: null },
    // For registration_based: free for anyone who registers after this date
    freeAfterDate: { type: Date, default: null },
    // Course itself expires on this date (no more purchases after)
    courseExpiry: { type: Date, default: null },

    // Content
    curriculum: [
      {
        sectionTitle: { type: String },
        lectures: [
          {
            title: { type: String },
            videoUrl: { type: String },
            duration: { type: String },
            isFree: { type: Boolean, default: false },
          },
        ],
      },
    ],

    // Stats
    totalStudents: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

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

// Auto-generate slug
courseSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Course', courseSchema);
