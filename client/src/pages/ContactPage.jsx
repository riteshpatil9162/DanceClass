import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const appName = import.meta.env.VITE_APP_NAME;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    // Placeholder — wire to a backend contact endpoint if needed
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  }

  return (
    <>
      <Helmet>
        <title>Contact Us — {appName}</title>
        <meta name="description" content={`Get in touch with ${appName}.`} />
      </Helmet>
      <div className="min-h-screen bg-dark-950 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-white mb-4">Contact <span className="text-orange-500">Us</span></h1>
          <div className="h-1 w-16 bg-orange-500 rounded mb-8" />

          <p className="text-gray-400 mb-8">
            Have a question, feedback, or partnership enquiry? Fill out the form below and
            we'll get back to you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
            <div>
              <label className="form-label">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="form-input"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="form-input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="form-label">Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="form-input"
                placeholder="How can we help you?"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
