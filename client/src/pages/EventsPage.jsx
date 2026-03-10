import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getEvents } from '../api';
import EventCard from '../components/events/EventCard';
import Spinner from '../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function EventsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['events', page],
    queryFn: () => getEvents({ page, limit: 9 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const events = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      <Helmet>
        <title>Upcoming Events - {APP_NAME}</title>
        <meta name="description" content="Join our live events, workshops, and seminars. Limited seats available - book your spot now!" />
        <meta name="keywords" content="live events, workshops, seminars, online events, bootcamp" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="bg-dark-900/80 border-b border-dark-700 py-12">
        <div className="page-container">
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Events</h1>
          <p className="text-dark-400">Join our live workshops, seminars, and bootcamps</p>
        </div>
      </div>

      <div className="page-container py-10">
        {isLoading ? (
          <Spinner size="lg" className="py-24" />
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-white font-semibold text-xl mb-2">No Events Scheduled</h3>
            <p className="text-dark-400">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isFetching ? 'opacity-60' : 'opacity-100'} transition-opacity`}>
              {events.map((event) => (
                <EventCard key={event._id} event={event} showCountdown />
              ))}
            </div>
            {meta && meta.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-dark btn-sm disabled:opacity-40">
                  Previous
                </button>
                {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="btn-dark btn-sm disabled:opacity-40">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
