require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Event = require('./src/models/Event');
const Package = require('./src/models/Package');
const Admin = require('./src/models/Admin');

const PLACEHOLDER_IMG = 'https://placehold.co/800x450/1a1a2e/f97316?text=';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne({ isSuperAdmin: true });
    if (!admin) {
      console.error('No super admin found. Run npm run seed first.');
      process.exit(1);
    }

    // ── Clear existing data ──────────────────────────────────────────────────
    await Promise.all([
      Course.deleteMany({}),
      Event.deleteMany({}),
      Package.deleteMany({}),
    ]);
    console.log('Cleared existing courses, events, packages');

    // ── Dance Courses ────────────────────────────────────────────────────────
    const courseDocs = await Course.insertMany([
      {
        title: 'Bollywood Dance — Beginner to Intermediate',
        slug: 'bollywood-dance-beginner-to-intermediate',
        description: 'Learn the vibrant and energetic art of Bollywood dance from scratch. This comprehensive course covers basic to intermediate Bollywood steps, expressions (abhinaya), footwork patterns, and hand gestures (mudras). You will learn choreography from popular Bollywood numbers and develop stage confidence. Suitable for all ages with no prior dance experience required.',
        shortDescription: 'Master Bollywood moves, expressions, and choreography from scratch.',
        thumbnail: `${PLACEHOLDER_IMG}Bollywood+Dance`,
        instructor: 'Priya Sharma',
        category: 'Bollywood',
        tags: ['bollywood', 'dance', 'beginner', 'hindi songs', 'choreography'],
        language: 'Hindi',
        price: 3999,
        discountedPrice: 1799,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 1842,
        rating: 4.9,
        totalRatings: 423,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Classical Kathak — Foundation Course',
        slug: 'classical-kathak-foundation-course',
        description: 'Dive into the graceful and rhythmic world of Kathak, one of India\'s eight classical dance forms. This foundation course covers the basics of taal (rhythm cycles), chakkar (spins), tatkar (footwork), and expressive storytelling through dance. Students will learn compositions in Teen Taal and Ek Taal and develop a strong classical base under expert guidance.',
        shortDescription: 'Learn the rhythmic footwork, spins, and grace of classical Kathak.',
        thumbnail: `${PLACEHOLDER_IMG}Kathak+Dance`,
        instructor: 'Sunita Devi',
        category: 'Classical',
        tags: ['kathak', 'classical', 'indian dance', 'taal', 'footwork'],
        language: 'Hindi',
        price: 4999,
        discountedPrice: 2499,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 967,
        rating: 4.8,
        totalRatings: 214,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Hip Hop & Street Dance — Zero to Freestyle',
        slug: 'hip-hop-street-dance-zero-to-freestyle',
        description: 'Unleash your inner street dancer with this high-energy Hip Hop course. Learn popping, locking, breaking basics, footwork, and freestyle fundamentals. Covers grooves, cyphers, battles, and how to develop your unique style. Choreographies set to popular hip hop tracks. No experience needed — just the will to move!',
        shortDescription: 'Learn popping, locking, breaking and develop your own freestyle.',
        thumbnail: `${PLACEHOLDER_IMG}Hip+Hop+Dance`,
        instructor: 'Rahul Nair',
        category: 'Hip Hop',
        tags: ['hip hop', 'street dance', 'freestyle', 'popping', 'locking'],
        language: 'Hinglish',
        price: 3499,
        discountedPrice: 1499,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 2310,
        rating: 4.7,
        totalRatings: 518,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Salsa & Latin Dance for Couples',
        slug: 'salsa-latin-dance-for-couples',
        description: 'Learn the sensual and rhythmic art of Salsa and Latin dances designed for partner work. This course covers On1 and On2 Salsa timing, basic partner holds, leading and following techniques, turns, dips, and footwork. Also introduces Bachata and Cha-Cha-Cha basics. Perfect for couples or singles looking to learn social dancing.',
        shortDescription: 'Master Salsa, Bachata & Cha-Cha-Cha with partner technique.',
        thumbnail: `${PLACEHOLDER_IMG}Salsa+Dance`,
        instructor: 'Carlos & Meera',
        category: 'Latin',
        tags: ['salsa', 'bachata', 'latin dance', 'partner dance', 'cha cha'],
        language: 'English',
        price: 5499,
        discountedPrice: 2799,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 743,
        rating: 4.9,
        totalRatings: 176,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Contemporary & Lyrical Dance — Expressive Movement',
        slug: 'contemporary-lyrical-dance-expressive-movement',
        description: 'Explore the freedom and emotion of contemporary and lyrical dance. This course blends ballet technique, modern dance, and improvisation to help you connect deeply with music and express emotions through movement. Covers floorwork, extensions, leaps, turns, and full-length lyrical choreographies. Suitable for dancers with some prior experience.',
        shortDescription: 'Express your emotions through contemporary and lyrical choreography.',
        thumbnail: `${PLACEHOLDER_IMG}Contemporary+Dance`,
        instructor: 'Ananya Krishnan',
        category: 'Contemporary',
        tags: ['contemporary', 'lyrical', 'modern dance', 'expressive', 'choreography'],
        language: 'English',
        price: 4499,
        discountedPrice: 2199,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 589,
        rating: 4.8,
        totalRatings: 132,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Dance Fitness & Zumba — Free Starter Class',
        slug: 'dance-fitness-zumba-free-starter',
        description: 'Get fit, have fun, and dance your way to health! This free introductory class covers the basics of Zumba and dance fitness routines set to upbeat music. Learn easy-to-follow aerobic dance steps that work your whole body. No coordination needed — just show up, move, and enjoy. A great first step before joining our full fitness program.',
        shortDescription: 'A free, fun intro to Zumba and dance fitness — no experience needed.',
        thumbnail: `${PLACEHOLDER_IMG}Zumba+Fitness`,
        instructor: 'Divya Menon',
        category: 'Dance Fitness',
        tags: ['zumba', 'dance fitness', 'aerobics', 'beginner', 'free'],
        language: 'Hinglish',
        price: 0,
        isFree: true,
        accessType: 'lifetime',
        totalStudents: 4125,
        rating: 4.6,
        totalRatings: 891,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${courseDocs.length} courses`);

    // ── Events ───────────────────────────────────────────────────────────────
    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const eventDocs = await Event.insertMany([
      {
        title: 'Naach Utsav 2026 — Annual Dance Festival',
        slug: 'naach-utsav-2026-annual-dance-festival',
        description: 'The grandest celebration of dance bringing together performers and enthusiasts across all styles — Bollywood, Kathak, Hip Hop, Contemporary, Folk, and more. 2 days of electrifying performances, workshops by master instructors, group dance battles, and a spectacular closing gala night. Open to students, professionals, and dance lovers of all ages. Medals and trophies for competition participants.',
        shortDescription: '2-day mega dance festival with workshops, battles & gala night.',
        thumbnail: `${PLACEHOLDER_IMG}Dance+Festival+2026`,
        bannerImage: `${PLACEHOLDER_IMG}Naach+Utsav+Banner`,
        eventType: 'offline',
        venue: 'Jawaharlal Nehru Indoor Stadium, New Delhi',
        startDate: future(20),
        endDate: future(21),
        bookingOpenDate: now,
        bookingCloseDate: future(18),
        totalSeats: 600,
        bookedSeats: 374,
        isLimitedSeats: true,
        price: 1999,
        isFree: false,
        discountedPrice: 999,
        showCountdown: true,
        hypeMessage: 'Only 226 seats left! Book before they\'re gone.',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Bollywood Masterclass — Live Weekend Workshop',
        slug: 'bollywood-masterclass-live-weekend-workshop',
        description: 'An intensive 2-day live Bollywood dance workshop with senior instructor Priya Sharma. Learn two complete Bollywood choreographies with detailed step breakdowns, expressions, and stage presence coaching. Batch size is limited to 25 students for personalised attention. Includes a feedback session, Q&A, and a certificate of participation. All experience levels welcome.',
        shortDescription: 'Intensive live workshop — learn 2 full Bollywood choreographies.',
        thumbnail: `${PLACEHOLDER_IMG}Bollywood+Workshop`,
        eventType: 'online',
        venue: 'Zoom (link sent after booking)',
        startDate: future(8),
        endDate: future(9),
        bookingOpenDate: now,
        bookingCloseDate: future(7),
        totalSeats: 25,
        bookedSeats: 18,
        isLimitedSeats: true,
        price: 1299,
        isFree: false,
        showCountdown: true,
        hypeMessage: '7 spots remaining — join before it fills up!',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Free Webinar: How to Start Your Dance Journey in 2026',
        slug: 'free-webinar-start-dance-journey-2026',
        description: 'Not sure which dance style is right for you? Join this free live webinar where our expert instructors walk you through all popular dance styles, help you find the best fit for your personality and fitness level, and share tips on how to practise effectively at home. Live Q&A session at the end. Completely free — just register to get the link!',
        shortDescription: 'Free live session to help you pick the right dance style and get started.',
        thumbnail: `${PLACEHOLDER_IMG}Free+Dance+Webinar`,
        eventType: 'online',
        venue: 'YouTube Live',
        startDate: future(4),
        endDate: future(4),
        bookingOpenDate: now,
        bookingCloseDate: future(4),
        totalSeats: null,
        isLimitedSeats: false,
        price: 0,
        isFree: true,
        showCountdown: true,
        hypeMessage: 'Register now to receive the live link!',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${eventDocs.length} events`);

    // ── Packages ─────────────────────────────────────────────────────────────
    const bollywoodCourse   = courseDocs.find(c => c.slug === 'bollywood-dance-beginner-to-intermediate');
    const kathakCourse      = courseDocs.find(c => c.slug === 'classical-kathak-foundation-course');
    const hipHopCourse      = courseDocs.find(c => c.slug === 'hip-hop-street-dance-zero-to-freestyle');
    const salsaCourse       = courseDocs.find(c => c.slug === 'salsa-latin-dance-for-couples');
    const contemporaryCourse = courseDocs.find(c => c.slug === 'contemporary-lyrical-dance-expressive-movement');
    const zumbaCourse       = courseDocs.find(c => c.slug === 'dance-fitness-zumba-free-starter');

    const packageDocs = await Package.insertMany([
      {
        title: 'Indian Dance Combo — Bollywood & Kathak',
        slug: 'indian-dance-combo-bollywood-kathak',
        description: 'The ultimate Indian dance bundle combining the glamour of Bollywood with the classical elegance of Kathak. Learn expressive storytelling, rhythmic footwork, graceful spins, and full choreographies from both traditions. Includes the free Zumba starter class as a bonus. Save over ₹4,000 compared to buying individually.',
        thumbnail: `${PLACEHOLDER_IMG}Indian+Dance+Bundle`,
        courses: [bollywoodCourse._id, kathakCourse._id],
        bonusCourses: [zumbaCourse._id],
        originalPrice: bollywoodCourse.price + kathakCourse.price,
        price: 6999,
        discountedPrice: 3499,
        discount: 40,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 213,
        createdBy: admin._id,
      },
      {
        title: 'Street & Latin Fusion Pack',
        slug: 'street-latin-fusion-pack',
        description: 'Mix the raw energy of Hip Hop street dance with the passion of Salsa and Latin rhythms. This bundle is perfect for dancers who love variety and want to explore both urban and social dance styles. Learn popping, locking, freestyle, Salsa partner work, Bachata, and Cha-Cha-Cha — all in one pack at a great price.',
        thumbnail: `${PLACEHOLDER_IMG}Street+Latin+Pack`,
        courses: [hipHopCourse._id, salsaCourse._id],
        bonusCourses: [],
        originalPrice: hipHopCourse.price + salsaCourse.price,
        price: 6999,
        discountedPrice: 3199,
        discount: 36,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 128,
        createdBy: admin._id,
      },
      {
        title: 'Complete Dance Academy — All Styles Bundle',
        slug: 'complete-dance-academy-all-styles-bundle',
        description: 'The most comprehensive dance learning package available. Get unlimited access to Bollywood, Kathak, Hip Hop, Salsa & Latin, and Contemporary & Lyrical — five complete courses covering the most popular dance styles. Plus a free Zumba fitness starter class as a bonus. The perfect package for serious dancers who want to master multiple styles and build a diverse performance repertoire.',
        thumbnail: `${PLACEHOLDER_IMG}All+Styles+Bundle`,
        courses: [bollywoodCourse._id, kathakCourse._id, hipHopCourse._id, salsaCourse._id, contemporaryCourse._id],
        bonusCourses: [zumbaCourse._id],
        originalPrice: bollywoodCourse.price + kathakCourse.price + hipHopCourse.price + salsaCourse.price + contemporaryCourse.price,
        price: 14999,
        discountedPrice: 6999,
        discount: 42,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 87,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${packageDocs.length} packages`);

    console.log('\nSeed complete!');
    console.log('Admin login -> http://localhost:5173/admin/login');
    console.log(`Email: ${process.env.SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.SUPER_ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
