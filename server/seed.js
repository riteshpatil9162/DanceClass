require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ isSuperAdmin: true });
    if (existing) {
      console.log('Super admin already exists:', existing.email);
      process.exit(0);
    }

    const superAdmin = await Admin.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@course.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
      role: 'superadmin',
      isSuperAdmin: true,
      permissions: [
        'manage_courses', 'manage_events', 'manage_users', 'manage_orders',
        'manage_packages', 'manage_admins', 'view_analytics', 'manage_sponsors', 'manage_settings',
      ],
      isActive: true,
    });

    console.log('Super admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password:', process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456');
    console.log('IMPORTANT: Change the password immediately after first login!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedSuperAdmin();
