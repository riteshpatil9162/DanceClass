import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | {import.meta.env.VITE_APP_NAME}</title>
      </Helmet>
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl font-black text-orange-500 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </>
  );
}
