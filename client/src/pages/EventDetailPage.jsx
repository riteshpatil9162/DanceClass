import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Clock, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getEventBySlug, createEventOrder, verifyEventPayment } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';
import Countdown from '../components/common/Countdown';
import { loadRazorpay } from '../utils/razorpay';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [booked, setBooked] = useState(false);
  const [attendeeInfo, setAttendeeInfo] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => getEventBySlug(slug).then((r) => r.data.data),
  });

  const hasBooked = isAuthenticated && user && event
    ? user.bookedEvents?.some((b) => (b.event?._id || b.event) === event._id)
    : false;

  const now = new Date();
  const isSoldOut = event?.isLimitedSeats && event?.bookedSeats >= event?.totalSeats;
  const isExpired = event ? new Date(event.bookingCloseDate) < now : false;
  const bookingOpen = event ? (new Date(event.bookingOpenDate) <= now && new Date(event.bookingCloseDate) >= now) : false;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book this event');
      navigate('/login', { state: { redirect: `/events/${slug}` } });
      return;
    }

    setIsProcessing(true);
    try {
      if (event.isFree || event.price === 0) {
        const res = await createEventOrder({
          eventId: event._id,
          attendeeName: attendeeInfo.name,
          attendeeEmail: attendeeInfo.email,
          attendeePhone: attendeeInfo.phone,
        });
        if (res.data.success) {
          toast.success(`Booking confirmed! Ticket ID: ${res.data.ticketId}`);
          setBooked(true);
        }
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      const orderRes = await createEventOrder({
        eventId: event._id,
        attendeeName: attendeeInfo.name,
        attendeeEmail: attendeeInfo.email,
        attendeePhone: attendeeInfo.phone,
      });
      const { orderId, amount, currency, keyId, eventName } = orderRes.data.data;

      const options = {
        key: keyId, amount, currency,
        name: APP_NAME, description: eventName,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await verifyEventPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success(`Booking confirmed! Ticket ID: ${verifyRes.data.ticketId}`);
            setBooked(true);
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        prefill: { name: attendeeInfo.name, email: attendeeInfo.email, contact: attendeeInfo.phone },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setIsProcessing(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <Spinner size="lg" className="min-h-screen" />;
  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-white text-2xl font-bold mb-4">Event Not Found</h2>
        <Link to="/events" className="btn-primary">View All Events</Link>
      </div>
    </div>
  );

  const banner = event.bannerImage || event.thumbnail;
  const bannerUrl = banner ? (banner.startsWith('http') ? banner : `${API_URL}${banner}`) : null;
  const seatsLeft = event.isLimitedSeats ? Math.max(0, event.totalSeats - event.bookedSeats) : null;

  return (
    <>
      <Helmet>
        <title>{event.metaTitle || event.title} - {APP_NAME}</title>
        <meta name="description" content={event.metaDescription || event.shortDescription || event.description?.slice(0, 160)} />
        <meta name="keywords" content={event.metaKeywords?.join(', ')} />
        <meta property="og:title" content={event.title} />
        {bannerUrl && <meta property="og:image" content={bannerUrl} />}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Banner */}
      {bannerUrl && (
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img src={bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
        </div>
      )}

      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {isSoldOut && <span className="badge-danger">Sold Out</span>}
                {isExpired && !isSoldOut && <span className="badge-warning">Booking Closed</span>}
                {bookingOpen && !isSoldOut && <span className="badge-success">Booking Open</span>}
                {event.isFree && <span className="badge-free">FREE</span>}
                <span className="badge-primary capitalize">{event.eventType}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-4">{event.title}</h1>
              <p className="text-dark-300 text-lg">{event.shortDescription}</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Start Date', value: format(new Date(event.startDate), 'dd MMM yyyy') },
                { icon: Clock, label: 'Time', value: format(new Date(event.startDate), 'hh:mm a') },
                { icon: MapPin, label: event.eventType === 'online' ? 'Platform' : 'Venue', value: event.eventType === 'online' ? 'Online' : (event.venue || 'TBA') },
                { icon: Users, label: 'Seats', value: event.isLimitedSeats ? `${event.bookedSeats}/${event.totalSeats}` : 'Unlimited' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass-card p-4 text-center">
                  <Icon size={18} className="text-primary-500 mx-auto mb-2" />
                  <p className="text-xs text-dark-400 mb-1">{label}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Hype */}
            {event.hypeMessage && bookingOpen && !isSoldOut && (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={18} className="text-primary-400 shrink-0" />
                <p className="text-primary-300 font-medium">{event.hypeMessage}</p>
              </div>
            )}

            {/* Sold Out / Expired message */}
            {(isSoldOut || isExpired) && (
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center">
                <p className="text-2xl mb-3">{isSoldOut ? '😔' : '⏰'}</p>
                <h3 className="text-white font-bold text-xl mb-2">
                  {isSoldOut ? 'Booking Sold Out' : 'Booking Period Over'}
                </h3>
                <p className="text-dark-400 mb-4">
                  {isSoldOut ? 'All seats for this event have been booked.' : 'The booking window for this event has closed.'}
                </p>
                <Link to="/" className="btn-primary">
                  <ExternalLink size={16} /> Visit Our Website
                </Link>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-heading font-bold text-white mb-4">About This Event</h2>
              <p className="text-dark-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Sponsors */}
            {event.sponsors?.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-white mb-6">Our Sponsors & Partners</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {event.sponsors.map((sponsor, idx) => (
                    <a
                      key={idx}
                      href={sponsor.website || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-4 text-center hover:border-primary-500/30 transition-all duration-300"
                    >
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo.startsWith('http') ? sponsor.logo : `${API_URL}${sponsor.logo}`}
                          alt={sponsor.name || sponsor.partnerType}
                          className="w-16 h-16 object-contain mx-auto mb-2 rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-dark-700 rounded-lg mx-auto mb-2" />
                      )}
                      <p className="text-white text-sm font-medium">{sponsor.name || sponsor.partnerType}</p>
                      <p className="text-primary-400 text-xs">{sponsor.partnerType}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Booking Card */}
          <div>
            <div className="sticky top-24">
              {booked || hasBooked ? (
                <div className="card p-6 text-center">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">You're Booked!</h3>
                  <p className="text-dark-400 text-sm">Check your email for booking confirmation.</p>
                </div>
              ) : (
                <div className="card p-6">
                  <div className="mb-4">
                    {event.isFree ? (
                      <span className="text-emerald-400 font-bold text-3xl">FREE</span>
                    ) : (
                      <div>
                        <span className="text-white font-bold text-3xl">₹{(event.discountedPrice || event.price)?.toLocaleString()}</span>
                        {event.discountedPrice && (
                          <span className="text-dark-500 text-lg line-through ml-2">₹{event.price?.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {event.showCountdown && bookingOpen && (
                    <div className="mb-5">
                      <Countdown targetDate={event.bookingCloseDate} label="Booking closes in" />
                    </div>
                  )}

                  {seatsLeft !== null && !isSoldOut && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-dark-400 mb-1">
                        <span>{event.bookedSeats} booked</span>
                        <span>{seatsLeft} left</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${(event.bookedSeats / event.totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isSoldOut && !isExpired && bookingOpen && (
                    <form onSubmit={handleBook} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={attendeeInfo.name}
                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, name: e.target.value })}
                        className="input-field text-sm py-2.5"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={attendeeInfo.email}
                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, email: e.target.value })}
                        className="input-field text-sm py-2.5"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={attendeeInfo.phone}
                        onChange={(e) => setAttendeeInfo({ ...attendeeInfo, phone: e.target.value })}
                        className="input-field text-sm py-2.5"
                      />
                      <button type="submit" disabled={isProcessing} className="btn-primary w-full">
                        {isProcessing ? <Spinner size="sm" /> : event.isFree ? 'Book for Free' : 'Pay & Book Now'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
