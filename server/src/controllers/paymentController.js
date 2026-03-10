const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const Event = require('../models/Event');
const Package = require('../models/Package');
const { generateReceiptId, generateTicketId } = require('../utils/helpers');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ========== COURSE PURCHASE ==========

// @desc    Create Razorpay order for course
exports.createCourseOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished || !course.isActive) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check course expiry
    if (course.courseExpiry && new Date() > course.courseExpiry) {
      return res.status(400).json({ success: false, message: 'This course is no longer available for purchase' });
    }

    // Check if already purchased
    const alreadyPurchased = req.user.hasCourseAccess(courseId);
    if (alreadyPurchased) {
      return res.status(400).json({ success: false, message: 'You already have access to this course' });
    }

    // Check if free (registration_based)
    if (course.accessType === 'registration_based' && course.freeAfterDate) {
      if (req.user.registrationDate >= course.freeAfterDate) {
        // Grant free access
        return await grantFreeCourseAccess(req.user, course, res);
      }
    }

    if (course.isFree || course.price === 0) {
      return await grantFreeCourseAccess(req.user, course, res);
    }

    const amount = (course.discountedPrice || course.price) * 100; // paise
    const receiptId = generateReceiptId();

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: receiptId,
      notes: { courseId: course._id.toString(), userId: req.user._id.toString() },
    });

    const order = await Order.create({
      user: req.user._id,
      orderType: 'course',
      course: course._id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      status: 'created',
      receiptId,
    });

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        courseName: course.title,
        dbOrderId: order._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

const grantFreeCourseAccess = async (user, course, res) => {
  const expiresAt = course.accessType === 'fixed_period' && course.accessDurationDays
    ? new Date(Date.now() + course.accessDurationDays * 24 * 60 * 60 * 1000)
    : null;

  user.purchasedCourses.push({
    course: course._id,
    expiresAt,
    isFree: true,
  });
  await user.save();
  course.totalStudents += 1;
  await course.save();

  await Order.create({
    user: user._id,
    orderType: 'course',
    course: course._id,
    amount: 0,
    status: 'free',
    isFree: true,
    receiptId: generateReceiptId(),
    paidAt: new Date(),
  });

  return res.json({ success: true, message: 'Free course access granted', isFree: true });
};

// @desc    Verify course payment
exports.verifyCoursePayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    // Grant access
    const course = await Course.findById(courseId || order.course);
    const expiresAt = course.accessType === 'fixed_period' && course.accessDurationDays
      ? new Date(Date.now() + course.accessDurationDays * 24 * 60 * 60 * 1000)
      : null;

    const user = await User.findById(req.user._id);
    const alreadyOwned = user.purchasedCourses.some(p => p.course.toString() === course._id.toString());
    if (!alreadyOwned) {
      user.purchasedCourses.push({ course: course._id, expiresAt, orderId: order._id.toString() });
      await user.save();
      course.totalStudents += 1;
      await course.save();
    }

    res.json({ success: true, message: 'Payment successful! Course access granted.' });
  } catch (err) {
    next(err);
  }
};

// ========== PACKAGE PURCHASE ==========

exports.createPackageOrder = async (req, res, next) => {
  try {
    const { packageId } = req.body;
    const pkg = await Package.findById(packageId).populate('courses').populate('bonusCourses');
    if (!pkg || !pkg.isPublished || !pkg.isActive) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    if (pkg.isFree || pkg.price === 0) {
      return await grantFreePackageAccess(req.user, pkg, res);
    }

    const amount = (pkg.discountedPrice || pkg.price) * 100;
    const receiptId = generateReceiptId();
    const razorpayOrder = await razorpay.orders.create({
      amount, currency: 'INR', receipt: receiptId,
      notes: { packageId: pkg._id.toString(), userId: req.user._id.toString() },
    });

    const order = await Order.create({
      user: req.user._id, orderType: 'package', package: pkg._id,
      razorpayOrderId: razorpayOrder.id, amount, currency: 'INR', status: 'created', receiptId,
    });

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID, packageName: pkg.title, dbOrderId: order._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

const grantFreePackageAccess = async (user, pkg, res) => {
  const allCourses = [...(pkg.courses || []), ...(pkg.bonusCourses || [])];
  for (const course of allCourses) {
    const alreadyOwned = user.purchasedCourses.some(p => p.course.toString() === course._id.toString());
    if (!alreadyOwned) {
      const expiresAt = pkg.accessType === 'fixed_period' && pkg.accessDurationDays
        ? new Date(Date.now() + pkg.accessDurationDays * 24 * 60 * 60 * 1000)
        : null;
      user.purchasedCourses.push({ course: course._id, expiresAt, isFree: true });
    }
  }
  await user.save();
  pkg.totalPurchases += 1;
  await pkg.save();
  return res.json({ success: true, message: 'Free package access granted', isFree: true });
};

exports.verifyPackagePayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, packageId } = req.body;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    const pkg = await Package.findById(packageId || order.package).populate('courses').populate('bonusCourses');
    const user = await User.findById(req.user._id);
    const allCourses = [...(pkg.courses || []), ...(pkg.bonusCourses || [])];
    for (const course of allCourses) {
      const alreadyOwned = user.purchasedCourses.some(p => p.course.toString() === course._id.toString());
      if (!alreadyOwned) {
        const expiresAt = pkg.accessType === 'fixed_period' && pkg.accessDurationDays
          ? new Date(Date.now() + pkg.accessDurationDays * 24 * 60 * 60 * 1000)
          : null;
        user.purchasedCourses.push({ course: course._id, expiresAt, orderId: order._id.toString() });
        await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });
      }
    }
    await user.save();
    pkg.totalPurchases += 1;
    await pkg.save();

    res.json({ success: true, message: 'Payment successful! Package access granted.' });
  } catch (err) {
    next(err);
  }
};

// ========== EVENT BOOKING ==========

exports.createEventOrder = async (req, res, next) => {
  try {
    const { eventId, attendeeName, attendeeEmail, attendeePhone } = req.body;
    const event = await Event.findById(eventId);
    if (!event || !event.isPublished || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (!event.isBookingOpen) {
      return res.status(400).json({ success: false, message: 'Booking is currently closed' });
    }
    if (event.isSoldOut) {
      return res.status(400).json({ success: false, message: 'Event is sold out' });
    }

    if (event.isFree || event.price === 0) {
      return await grantFreeEventBooking(req.user, event, { attendeeName, attendeeEmail, attendeePhone }, res);
    }

    const amount = (event.discountedPrice || event.price) * 100;
    const receiptId = generateReceiptId();
    const razorpayOrder = await razorpay.orders.create({
      amount, currency: 'INR', receipt: receiptId,
      notes: { eventId: event._id.toString(), userId: req.user._id.toString() },
    });

    const order = await Order.create({
      user: req.user._id, orderType: 'event', event: event._id,
      razorpayOrderId: razorpayOrder.id, amount, currency: 'INR', status: 'created', receiptId,
      attendeeName, attendeeEmail, attendeePhone,
    });

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID, eventName: event.title, dbOrderId: order._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

const grantFreeEventBooking = async (user, event, attendeeInfo, res) => {
  const ticketId = generateTicketId();
  user.bookedEvents.push({ event: event._id, isFree: true, ticketId });
  await user.save();
  event.bookedSeats += 1;
  await event.save();
  await Order.create({
    user: user._id, orderType: 'event', event: event._id, amount: 0, status: 'free',
    isFree: true, receiptId: generateReceiptId(), paidAt: new Date(), ticketId,
    attendeeName: attendeeInfo.attendeeName, attendeeEmail: attendeeInfo.attendeeEmail,
    attendeePhone: attendeeInfo.attendeePhone,
  });
  return res.json({ success: true, message: 'Free event booking confirmed!', ticketId, isFree: true });
};

exports.verifyEventPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const ticketId = generateTicketId();
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = 'paid';
    order.paidAt = new Date();
    order.ticketId = ticketId;
    await order.save();

    const user = await User.findById(req.user._id);
    user.bookedEvents.push({ event: order.event, orderId: order._id.toString(), ticketId });
    await user.save();
    await Event.findByIdAndUpdate(order.event, { $inc: { bookedSeats: 1 } });

    res.json({ success: true, message: 'Event booking confirmed!', ticketId });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('course', 'title slug thumbnail')
      .populate('event', 'title slug startDate')
      .populate('package', 'title slug thumbnail')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin - get all orders
exports.adminGetOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({})
        .populate('user', 'name email')
        .populate('course', 'title')
        .populate('event', 'title')
        .populate('package', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(),
    ]);
    res.json({ success: true, data: orders, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};
