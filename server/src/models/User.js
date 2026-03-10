const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    purchasedCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        purchasedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: null }, // null = lifetime
        orderId: { type: String },
        isFree: { type: Boolean, default: false },
      },
    ],
    bookedEvents: [
      {
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        bookedAt: { type: Date, default: Date.now },
        orderId: { type: String },
        ticketId: { type: String },
        isFree: { type: Boolean, default: false },
      },
    ],
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    emailVerifyToken: { type: String, select: false },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasCourseAccess = function (courseId) {
  const entry = this.purchasedCourses.find(
    (p) => p.course.toString() === courseId.toString()
  );
  if (!entry) return false;
  if (!entry.expiresAt) return true; // lifetime
  return entry.expiresAt > new Date();
};

module.exports = mongoose.model('User', userSchema);
