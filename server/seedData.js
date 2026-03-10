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

    // ── Courses ──────────────────────────────────────────────────────────────
    const courseDocs = await Course.insertMany([
      {
        title: 'Complete React & Next.js Masterclass',
        slug: 'complete-react-nextjs-masterclass',
        description: 'Master React 18, hooks, context, Redux Toolkit, and Next.js 14 with App Router. Build 5 real-world projects including an e-commerce app, a social media clone, and a SaaS dashboard. Includes TypeScript, testing with Vitest, and deployment to Vercel.',
        shortDescription: 'Learn React 18, Next.js 14, TypeScript and build production-ready apps.',
        thumbnail: `${PLACEHOLDER_IMG}React+%26+Next.js`,
        instructor: 'Rahul Sharma',
        category: 'Programming',
        tags: ['react', 'nextjs', 'javascript', 'typescript', 'frontend'],
        language: 'Hinglish',
        price: 4999,
        discountedPrice: 1999,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 1243,
        rating: 4.8,
        totalRatings: 312,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Node.js & Express Backend Development',
        slug: 'nodejs-express-backend-development',
        description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Covers authentication with JWT, file uploads, email sending, payment integration with Razorpay, and deployment on AWS EC2. Includes real-world e-commerce backend project.',
        shortDescription: 'Build production-grade REST APIs with Node, Express & MongoDB.',
        thumbnail: `${PLACEHOLDER_IMG}Node.js+Backend`,
        instructor: 'Priya Mehta',
        category: 'Programming',
        tags: ['nodejs', 'express', 'mongodb', 'backend', 'api'],
        language: 'Hindi',
        price: 3999,
        discountedPrice: 1499,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 876,
        rating: 4.7,
        totalRatings: 198,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'UI/UX Design with Figma — Zero to Pro',
        slug: 'ui-ux-design-figma-zero-to-pro',
        description: 'Learn modern UI/UX design principles, wireframing, prototyping, and design systems using Figma. Covers user research, accessibility, dark mode design, and how to hand off designs to developers. Build a complete mobile app design portfolio.',
        shortDescription: 'Design stunning user interfaces and experiences with Figma.',
        thumbnail: `${PLACEHOLDER_IMG}UI/UX+Figma`,
        instructor: 'Anika Verma',
        category: 'Design',
        tags: ['figma', 'ui', 'ux', 'design', 'prototype'],
        language: 'English',
        price: 2999,
        discountedPrice: 999,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 654,
        rating: 4.9,
        totalRatings: 145,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Python for Data Science & Machine Learning',
        slug: 'python-data-science-machine-learning',
        description: 'Complete Python course for data science. Covers NumPy, Pandas, Matplotlib, Scikit-learn, and TensorFlow. Build real ML projects: house price prediction, image classification, sentiment analysis, and recommendation systems.',
        shortDescription: 'Master Python, ML algorithms, and data analysis from scratch.',
        thumbnail: `${PLACEHOLDER_IMG}Python+ML`,
        instructor: 'Dr. Arjun Patel',
        category: 'Programming',
        tags: ['python', 'machine learning', 'data science', 'tensorflow', 'pandas'],
        language: 'English',
        price: 5999,
        discountedPrice: 2499,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 2108,
        rating: 4.9,
        totalRatings: 487,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Digital Marketing: SEO, Ads & Social Media',
        slug: 'digital-marketing-seo-ads-social-media',
        description: 'Learn complete digital marketing from Google SEO, Google Ads, Facebook & Instagram Ads, email marketing, and content strategy. Includes real campaign case studies, analytics with GA4, and how to grow a brand from zero to 10k followers.',
        shortDescription: 'Grow any business online with SEO, paid ads and social media.',
        thumbnail: `${PLACEHOLDER_IMG}Digital+Marketing`,
        instructor: 'Sneha Kapoor',
        category: 'Marketing',
        tags: ['seo', 'google ads', 'social media', 'digital marketing', 'facebook ads'],
        language: 'Hinglish',
        price: 3499,
        discountedPrice: 1299,
        isFree: false,
        accessType: 'lifetime',
        totalStudents: 934,
        rating: 4.6,
        totalRatings: 221,
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Git, GitHub & DevOps for Beginners',
        slug: 'git-github-devops-beginners',
        description: 'Learn Git version control, GitHub workflows, CI/CD pipelines with GitHub Actions, Docker basics, and deployment to cloud. Perfect for developers who want to work in teams and understand modern DevOps practices.',
        shortDescription: 'Version control, CI/CD, Docker and cloud deployment essentials.',
        thumbnail: `${PLACEHOLDER_IMG}Git+%26+DevOps`,
        instructor: 'Rahul Sharma',
        category: 'Programming',
        tags: ['git', 'github', 'devops', 'docker', 'ci/cd'],
        language: 'Hinglish',
        price: 0,
        isFree: true,
        accessType: 'lifetime',
        totalStudents: 3421,
        rating: 4.7,
        totalRatings: 634,
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
        title: 'Tech Summit India 2026',
        slug: 'tech-summit-india-2026',
        description: 'The biggest tech conference in India bringing together 500+ developers, designers, and founders. 3 days of keynotes, workshops, networking, and hackathon. Speakers from Google, Microsoft, Razorpay, and leading Indian startups. Free swag kit for all attendees.',
        shortDescription: '3-day mega tech conference with 500+ attendees and top speakers.',
        thumbnail: `${PLACEHOLDER_IMG}Tech+Summit+2026`,
        bannerImage: `${PLACEHOLDER_IMG}Tech+Summit+Banner`,
        eventType: 'offline',
        venue: 'Bombay Exhibition Centre, Mumbai',
        startDate: future(15),
        endDate: future(17),
        bookingOpenDate: now,
        bookingCloseDate: future(14),
        totalSeats: 500,
        bookedSeats: 312,
        isLimitedSeats: true,
        price: 2999,
        isFree: false,
        discountedPrice: 1499,
        showCountdown: true,
        hypeMessage: 'Only 188 seats left! Don\'t miss out.',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Full Stack Bootcamp — Live Weekend Batch',
        slug: 'full-stack-bootcamp-live-weekend',
        description: 'Intensive 2-day live bootcamp covering React, Node.js, MongoDB, and deployment. Hands-on coding from 9 AM to 6 PM both days. Get personalized code reviews, project mentorship, and a certificate of completion. Limited to 30 participants for focused attention.',
        shortDescription: 'Intensive 2-day live coding bootcamp — React, Node & MongoDB.',
        thumbnail: `${PLACEHOLDER_IMG}Bootcamp`,
        eventType: 'online',
        venue: 'Zoom (link sent after booking)',
        startDate: future(7),
        endDate: future(8),
        bookingOpenDate: now,
        bookingCloseDate: future(6),
        totalSeats: 30,
        bookedSeats: 22,
        isLimitedSeats: true,
        price: 1499,
        isFree: false,
        showCountdown: true,
        hypeMessage: '8 seats remaining — grab yours now!',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Free Webinar: Getting Your First Tech Job in 2026',
        slug: 'free-webinar-first-tech-job-2026',
        description: 'Learn exactly how to land your first developer or designer job in 2026. We cover resume writing, portfolio building, cracking interviews, negotiating salary, and how to stand out on LinkedIn. Q&A session included. Completely free — just register!',
        shortDescription: 'Free live session on resume, portfolio & cracking tech interviews.',
        thumbnail: `${PLACEHOLDER_IMG}Free+Webinar`,
        eventType: 'online',
        venue: 'YouTube Live',
        startDate: future(3),
        endDate: future(3),
        bookingOpenDate: now,
        bookingCloseDate: future(3),
        totalSeats: null,
        isLimitedSeats: false,
        price: 0,
        isFree: true,
        showCountdown: true,
        hypeMessage: 'Register now to get the YouTube link!',
        isPublished: true,
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${eventDocs.length} events`);

    // ── Packages ─────────────────────────────────────────────────────────────
    const reactCourse = courseDocs.find(c => c.slug === 'complete-react-nextjs-masterclass');
    const nodeCourse = courseDocs.find(c => c.slug === 'nodejs-express-backend-development');
    const pythonCourse = courseDocs.find(c => c.slug === 'python-data-science-machine-learning');
    const designCourse = courseDocs.find(c => c.slug === 'ui-ux-design-figma-zero-to-pro');
    const marketingCourse = courseDocs.find(c => c.slug === 'digital-marketing-seo-ads-social-media');
    const gitCourse = courseDocs.find(c => c.slug === 'git-github-devops-beginners');

    const packageDocs = await Package.insertMany([
      {
        title: 'Full Stack Web Dev Bundle',
        slug: 'full-stack-web-dev-bundle',
        description: 'Everything you need to become a full-stack developer. Includes React + Next.js, Node.js + Express backend, and Git & DevOps as a free bonus. Save ₹7,000 vs buying individually.',
        thumbnail: `${PLACEHOLDER_IMG}Full+Stack+Bundle`,
        courses: [reactCourse._id, nodeCourse._id],
        bonusCourses: [gitCourse._id],
        originalPrice: reactCourse.price + nodeCourse.price,
        price: 5999,
        discountedPrice: 2999,
        discount: 40,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 187,
        createdBy: admin._id,
      },
      {
        title: 'Design + Marketing Pro Pack',
        slug: 'design-marketing-pro-pack',
        description: 'The complete creative professional bundle. Master UI/UX design with Figma and grow businesses with digital marketing. Perfect for freelancers and entrepreneurs. Includes both courses at a massive discount.',
        thumbnail: `${PLACEHOLDER_IMG}Design+Marketing`,
        courses: [designCourse._id, marketingCourse._id],
        bonusCourses: [],
        originalPrice: designCourse.price + marketingCourse.price,
        price: 4999,
        discountedPrice: 1999,
        discount: 35,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 94,
        createdBy: admin._id,
      },
      {
        title: 'Data Science + Full Stack Ultimate Pack',
        slug: 'data-science-full-stack-ultimate',
        description: 'The most comprehensive learning bundle on the platform. Get Python for Data Science & ML, React + Next.js, Node.js Backend, and Git & DevOps — everything you need to become a top-tier tech professional in 2026.',
        thumbnail: `${PLACEHOLDER_IMG}Ultimate+Pack`,
        courses: [pythonCourse._id, reactCourse._id, nodeCourse._id],
        bonusCourses: [gitCourse._id],
        originalPrice: pythonCourse.price + reactCourse.price + nodeCourse.price,
        price: 11999,
        discountedPrice: 4999,
        discount: 45,
        isFree: false,
        accessType: 'lifetime',
        isPublished: true,
        isActive: true,
        totalPurchases: 63,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${packageDocs.length} packages`);

    console.log('\n✅ Seed complete!');
    console.log('Admin login → http://localhost:5173/admin/login');
    console.log(`Email: ${process.env.SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.SUPER_ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
