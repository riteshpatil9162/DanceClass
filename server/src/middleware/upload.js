const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// ── Reusable Cloudinary storage factory ──────────────────────────────────────
// Each call creates an independent storage instance targeting a specific folder.
const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `course-platform/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

// ── File filter — images only ─────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

// ── Named upload instances ────────────────────────────────────────────────────

/** Single thumbnail (courses, packages) */
const uploadThumbnail = multer({
  storage: makeStorage('thumbnails'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: imageFilter,
});

/** Multiple event images: thumbnail + bannerImage */
const uploadEventImages = multer({
  storage: makeStorage('events'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: imageFilter,
});

/** Sponsor logos — up to 10 */
const uploadSponsorLogos = multer({
  storage: makeStorage('sponsors'),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: imageFilter,
});

/** User / admin avatar */
const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB for avatars
  fileFilter: imageFilter,
});

module.exports = {
  uploadThumbnail,
  uploadEventImages,
  uploadSponsorLogos,
  uploadAvatar,
};
