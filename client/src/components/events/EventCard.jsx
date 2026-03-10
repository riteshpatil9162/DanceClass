import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Countdown from '../common/Countdown';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function EventCard({ event, showCountdown = false }) {
  const now = new Date();
  const bookingOpen = new Date(event.bookingOpenDate) <= now && new Date(event.bookingCloseDate) >= now;
  const isSoldOut = event.isLimitedSeats && event.bookedSeats >= event.totalSeats;
  const isExpired = new Date(event.bookingCloseDate) < now;
  const seatsLeft = event.isLimitedSeats ? Math.max(0, event.totalSeats - event.bookedSeats) : null;

  const thumbnail = event.thumbnail
    ? event.thumbnail.startsWith('http') ? event.thumbnail : `${API_URL}${event.thumbnail}`
    : null;

  const getStatusBadge = () => {
    if (isSoldOut) return { text: 'Sold Out', cls: 'badge-danger' };
    if (isExpired) return { text: 'Booking Closed', cls: 'badge-warning' };
    if (bookingOpen) return { text: 'Booking Open', cls: 'badge-success' };
    return { text: 'Coming Soon', cls: 'badge-primary' };
  };

  const status = getStatusBadge();

  return (
    <div className="card group flex flex-col h-full overflow-hidden">
      {/* Banner */}
      <div className="relative aspect-video bg-dark-800 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900/40 to-dark-800 flex items-center justify-center">
            <span className="text-5xl">🎯</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`${status.cls} text-xs px-2 py-1`}>{status.text}</span>
        </div>
        {event.isFree && (
          <div className="absolute top-3 right-3">
            <span className="badge-free text-xs px-2 py-1">FREE</span>
          </div>
        )}
        {event.isLimitedSeats && !isSoldOut && seatsLeft !== null && seatsLeft <= 20 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-dark-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-red-400 font-medium">
              🔥 Only {seatsLeft} seats left!
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-dark-400 text-sm line-clamp-2 mb-4 flex-1">
          {event.shortDescription || event.description}
        </p>

        {/* Meta */}
        <div className="space-y-2 mb-4 text-xs text-dark-400">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary-500 shrink-0" />
            <span>{format(new Date(event.startDate), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-primary-500 shrink-0" />
            <span>{event.eventType === 'online' ? 'Online Event' : event.venue || 'TBA'}</span>
          </div>
          {event.isLimitedSeats && (
            <div className="flex items-center gap-2">
              <Users size={12} className="text-primary-500 shrink-0" />
              <span>{event.bookedSeats} / {event.totalSeats} seats booked</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        {showCountdown && bookingOpen && !isSoldOut && (
          <div className="mb-4">
            <Countdown targetDate={event.bookingCloseDate} label="Booking closes in" />
          </div>
        )}

        {/* Hype Message */}
        {event.hypeMessage && !isSoldOut && !isExpired && (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-2 mb-4">
            <p className="text-primary-400 text-xs font-medium">{event.hypeMessage}</p>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 border-t border-dark-700">
          <div>
            {event.isFree ? (
              <span className="text-emerald-400 font-bold text-lg">FREE</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">
                  ₹{(event.discountedPrice || event.price)?.toLocaleString()}
                </span>
                {event.discountedPrice && (
                  <span className="text-dark-500 text-sm line-through">₹{event.price?.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          {isSoldOut || isExpired ? (
            <Link to="/" className="btn-dark btn-sm text-xs px-3 py-2">
              <ExternalLink size={12} /> Visit Website
            </Link>
          ) : (
            <Link to={`/events/${event.slug}`} className="btn-primary btn-sm text-xs px-4 py-2">
              {event.isFree ? 'Book Free' : 'Book Now'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
