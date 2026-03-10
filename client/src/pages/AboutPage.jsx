import { Helmet } from 'react-helmet-async';

export default function AboutPage() {
  const appName = import.meta.env.VITE_APP_NAME;

  return (
    <>
      <Helmet>
        <title>About Us — {appName}</title>
        <meta name="description" content={`Learn more about ${appName} and our mission.`} />
      </Helmet>
      <div className="min-h-screen bg-dark-950 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-4">About <span className="text-orange-500">{appName}</span></h1>
          <div className="h-1 w-16 bg-orange-500 rounded mb-8" />

          <div className="prose-dark space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Welcome to <strong className="text-white">{appName}</strong> — your destination for
              high-quality online courses, live workshops, and exclusive industry events.
            </p>
            <p>
              We believe that education should be accessible, practical, and results-driven.
              Our instructors are industry veterans who bring real-world experience into every
              lesson so you can learn skills that matter today.
            </p>
            <h2 className="text-2xl font-bold text-white mt-8">Our Mission</h2>
            <p>
              To empower learners with the knowledge and community they need to achieve their
              professional goals — whether that's landing a new job, growing a business, or
              mastering a craft.
            </p>
            <h2 className="text-2xl font-bold text-white mt-8">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Lifetime access courses on in-demand topics</li>
              <li>Live events, workshops, and bootcamps</li>
              <li>Combo course packages at discounted prices</li>
              <li>Supportive learner community</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
