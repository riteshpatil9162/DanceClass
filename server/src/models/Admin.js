const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PERMISSIONS = [
  'manage_courses',
  'manage_events',
  'manage_users',
  'manage_orders',
  'manage_packages',
  'manage_admins',
  'view_analytics',
  'manage_sponsors',
  'manage_settings',
];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['superadmin', 'admin', 'editor', 'viewer'], default: 'editor' },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: [],
    },
    isSuperAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    lastLogin: { type: Date },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.hasPermission = function (permission) {
  if (this.isSuperAdmin) return true;
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Admin', adminSchema);
module.exports.PERMISSIONS = PERMISSIONS;
