import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  const appName = import.meta.env.VITE_APP_NAME;
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — {appName}</title>
      </Helmet>
      <div className="min-h-screen bg-dark py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-2">Terms & <span className="text-orange-500">Conditions</span></h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              By accessing or using <strong className="text-white">{appName}</strong>, you agree to
              be bound by these Terms and Conditions. Please read them carefully.
            </p>

            <h2 className="text-xl font-bold text-white">1. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-bold text-white">2. Course Access</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Lifetime courses grant permanent access to purchased content.</li>
              <li>Fixed-duration courses expire on the stated date.</li>
              <li>Courses accessed after a free registration date are governed by the terms set at purchase.</li>
            </ul>

            <h2 className="text-xl font-bold text-white">3. Payments</h2>
            <p>
              All transactions are processed securely through Razorpay. Prices are in Indian Rupees
              (INR) and include applicable taxes unless stated otherwise.
            </p>

            <h2 className="text-xl font-bold text-white">4. Intellectual Property</h2>
            <p>
              All course content, materials, and branding are the intellectual property of{' '}
              {appName}. Reproduction or redistribution without written consent is prohibited.
            </p>

            <h2 className="text-xl font-bold text-white">5. Prohibited Use</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Sharing account access or course downloads with others.</li>
              <li>Using the platform for unlawful purposes.</li>
              <li>Attempting to circumvent any security measures.</li>
            </ul>

            <h2 className="text-xl font-bold text-white">6. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the
              platform after changes constitutes acceptance of the updated terms.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
