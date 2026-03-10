import { Helmet } from 'react-helmet-async';

export default function RefundPage() {
  const appName = import.meta.env.VITE_APP_NAME;
  return (
    <>
      <Helmet>
        <title>Refund Policy — {appName}</title>
      </Helmet>
      <div className="min-h-screen bg-dark py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-2">Refund <span className="text-orange-500">Policy</span></h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              We want you to be completely satisfied with your purchase. Please read our refund
              policy carefully before making a purchase.
            </p>

            <h2 className="text-xl font-bold text-white">1. Courses & Packages</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Within 7 days of purchase</strong> and less than
                20% of course content consumed: eligible for a full refund.
              </li>
              <li>
                After 7 days or if more than 20% of the course has been accessed: no refund
                will be issued.
              </li>
              <li>Free courses are not eligible for any monetary refunds.</li>
            </ul>

            <h2 className="text-xl font-bold text-white">2. Events</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Cancellation 7+ days before the event: full refund minus a 5% processing fee.
              </li>
              <li>
                Cancellation within 7 days of the event: no refund. You may transfer your
                ticket to another person by contacting support.
              </li>
              <li>
                If the event is cancelled by us: full refund issued within 7 business days.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white">3. How to Request a Refund</h2>
            <p>
              To initiate a refund, please{' '}
              <a href="/contact" className="text-orange-400 hover:underline">contact our support team</a>{' '}
              with your order ID and reason. Approved refunds are processed within 5–7
              business days to the original payment method.
            </p>

            <h2 className="text-xl font-bold text-white">4. Non-Refundable Items</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Downloadable resources once accessed.</li>
              <li>Combo packages where any included course has been started.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
