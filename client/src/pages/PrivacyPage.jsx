import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  const appName = import.meta.env.VITE_APP_NAME;
  return (
    <>
      <Helmet>
        <title>Privacy Policy — {appName}</title>
      </Helmet>
      <div className="min-h-screen bg-dark py-16 px-4">
        <div className="max-w-3xl mx-auto prose-dark">
          <h1 className="text-4xl font-black text-white mb-2">Privacy <span className="text-orange-500">Policy</span></h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              At <strong className="text-white">{appName}</strong>, we are committed to protecting
              your personal information. This Privacy Policy explains what data we collect, how we
              use it, and your rights regarding your information.
            </p>

            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Name, email address, and phone number when you register.</li>
              <li>Payment information processed securely through Razorpay (we do not store card details).</li>
              <li>Usage data such as pages visited and courses accessed.</li>
            </ul>

            <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide access to purchased courses and events.</li>
              <li>To send order confirmations and important account updates.</li>
              <li>To improve our platform and user experience.</li>
            </ul>

            <h2 className="text-xl font-bold text-white">3. Data Sharing</h2>
            <p>
              We do not sell or share your personal data with third parties except as required
              to process payments (Razorpay) or comply with legal obligations.
            </p>

            <h2 className="text-xl font-bold text-white">4. Data Security</h2>
            <p>
              We use industry-standard encryption (HTTPS/TLS) and secure password hashing (bcrypt)
              to protect your data.
            </p>

            <h2 className="text-xl font-bold text-white">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data by
              contacting us at any time.
            </p>

            <h2 className="text-xl font-bold text-white">6. Contact</h2>
            <p>
              For privacy-related questions, please use the{' '}
              <a href="/contact" className="text-orange-400 hover:underline">Contact page</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
