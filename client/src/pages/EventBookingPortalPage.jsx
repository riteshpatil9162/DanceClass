import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getEventByBookingSlug } from '../api';
import Spinner from '../components/common/Spinner';
import { ExternalLink } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

// Temporary booking URL page - minimal layout (no navbar/footer by default)
// This renders the booking portal for temporary event URLs like /book/evt-xxxxx
export default function EventBookingPortalPage() {
  const { bookingSlug } = useParams();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event-booking', bookingSlug],
    queryFn: () => getEventByBookingSlug(bookingSlug).then((r) => r.data.data),
  });

  // Redirect to the event's main slug page once we have it
  useEffect(() => {
    if (event && !isLoading) {
      const now = new Date();
      const isSoldOut = event.isLimitedSeats && event.bookedSeats >= event.totalSeats;
      const isExpired = new Date(event.bookingCloseDate) < now;
      if (!isSoldOut && !isExpired) {
        const timer = setTimeout(() => {
          window.location.href = `/events/${event.slug}`;
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [event, isLoading]);

  if (isLoading) return <Spinner size="lg" className="min-h-screen" />;

  if (error || !event) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">Booking Page Not Found</h1>
          <p className="text-dark-400 mb-8 max-w-md mx-auto">
            This booking link may have expired or is no longer valid.
          </p>
          <Link to="/" className="btn-primary">
            <ExternalLink size={16} /> Visit Our Website
          </Link>
        </div>
      </div>
    );
  }

  // Check if event is sold out or expired
  const now = new Date();
  const isSoldOut = event.isLimitedSeats && event.bookedSeats >= event.totalSeats;
  const isExpired = new Date(event.bookingCloseDate) < now;

  if (isSoldOut || isExpired) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <Helmet>
          <title>{event.title} - Booking Closed | {APP_NAME}</title>
        </Helmet>
        <div className="text-center max-w-lg">
          <p className="text-6xl mb-6">{isSoldOut ? '🎫' : '⏰'}</p>
          <h1 className="text-3xl font-heading font-bold text-white mb-3">
            {isSoldOut ? 'Booking Sold Out!' : 'Booking Period Over'}
          </h1>
          <p className="text-dark-400 mb-4 text-lg">
            {isSoldOut
              ? `All ${event.totalSeats} seats for "${event.title}" have been booked.`
              : `The booking window for "${event.title}" has closed.`}
          </p>
          <p className="text-dark-500 text-sm mb-8">
            Stay tuned for our upcoming events and courses!
          </p>
          <Link to="/" className="btn-primary text-lg px-8 py-4">
            <ExternalLink size={18} /> Visit Our Website
          </Link>
        </div>
      </div>
    );
  }

  // Render full event detail with booking form
  // We override the slug in useParams by passing through EventDetailPage but with booking slug context
  // Since EventDetailPage uses :slug param, we need to render it with the event's actual slug
  // Redirect to the event's main page
  return (
    <div className="min-h-screen bg-dark-950">
      <Helmet>
        <title>Book: {event.title} - {APP_NAME}</title>
      </Helmet>
      {/* Minimal header for portal */}
      <div className="bg-dark-900 border-b border-dark-700 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-dark-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            <ExternalLink size={14} /> Visit {APP_NAME}
          </Link>
          <span className="text-dark-500 text-xs">Secure Booking Portal</span>
        </div>
      </div>

      {/* Re-use event detail logic by redirecting to main slug */}
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="md" />
          <p className="text-dark-400 text-sm mt-2">Redirecting to booking page...</p>
        </div>
      </div>
    </div>
  );
}
