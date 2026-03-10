import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { BookOpen, Gift, ArrowRight, ShoppingCart, CheckCircle } from 'lucide-react';
import { getPackages, createPackageOrder, verifyPackagePayment } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';
import { loadRazorpay } from '../utils/razorpay';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function PackagesPage() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages-all'],
    queryFn: () => getPackages().then((r) => r.data.data),
  });

  return (
    <>
      <Helmet>
        <title>Course Packages - {APP_NAME}</title>
        <meta name="description" content="Get more value with our course packages and combo deals. Buy multiple courses at a discounted price." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="bg-dark-900/80 border-b border-dark-700 py-12">
        <div className="page-container text-center">
          <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">Best Value</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-2">Course Packages & Combos</h1>
          <p className="text-dark-400">Bundle up and save more on your learning journey</p>
        </div>
      </div>

      <div className="page-container py-12">
        {isLoading ? (
          <Spinner size="lg" className="py-24" />
        ) : !packages?.length ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📦</p>
            <h3 className="text-white text-xl font-semibold mb-2">No Packages Available</h3>
            <p className="text-dark-400 mb-6">Check back soon for amazing bundle deals!</p>
            <Link to="/courses" className="btn-primary">Browse Individual Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function PackageCard({ pkg }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const thumbnail = pkg.thumbnail
    ? pkg.thumbnail.startsWith('http') ? pkg.thumbnail : `${API_URL}${pkg.thumbnail}`
    : null;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }
    if (pkg.isFree || pkg.price === 0) {
      setIsProcessing(true);
      try {
        const res = await createPackageOrder({ packageId: pkg._id });
        if (res.data.isFree) toast.success('Free package access granted!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    setIsProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway error'); return; }
      const orderRes = await createPackageOrder({ packageId: pkg._id });
      const { orderId, amount, currency, keyId, packageName } = orderRes.data.data;
      const options = {
        key: keyId, amount, currency, name: APP_NAME, description: packageName, order_id: orderId,
        handler: async (response) => {
          try {
            await verifyPackagePayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              packageId: pkg._id,
            });
            toast.success('Package purchased! Access granted to all courses.');
            setTimeout(() => window.location.reload(), 1500);
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setIsProcessing(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card flex flex-col h-full">
      {thumbnail && (
        <img src={thumbnail} alt={pkg.title} className="w-full aspect-video object-cover" />
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            {pkg.isFree && <span className="badge-free text-xs mb-2 block w-fit">FREE</span>}
            {pkg.discount > 0 && <span className="badge-danger text-xs mb-2 block w-fit">{pkg.discount}% OFF</span>}
            <h3 className="text-white font-bold text-xl">{pkg.title}</h3>
          </div>
        </div>
        <p className="text-dark-400 text-sm mb-5 flex-1">{pkg.description}</p>

        {/* Included courses */}
        {pkg.courses?.length > 0 && (
          <div className="mb-4">
            <p className="text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen size={12} className="text-primary-500" /> Included Courses ({pkg.courses.length})
            </p>
            <ul className="space-y-1">
              {pkg.courses.slice(0, 4).map((c) => (
                <li key={c._id} className="flex items-center gap-2 text-xs text-dark-400">
                  <CheckCircle size={10} className="text-primary-500 shrink-0" />
                  {c.title}
                </li>
              ))}
              {pkg.courses.length > 4 && <li className="text-xs text-dark-500">+{pkg.courses.length - 4} more courses</li>}
            </ul>
          </div>
        )}

        {/* Bonus courses */}
        {pkg.bonusCourses?.length > 0 && (
          <div className="mb-5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-emerald-400 text-xs font-semibold mb-1.5 flex items-center gap-1">
              <Gift size={12} /> Bonus Courses (FREE)
            </p>
            {pkg.bonusCourses.map((c) => (
              <p key={c._id} className="text-xs text-emerald-300/70">{c.title}</p>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-dark-700 mt-auto">
          <div>
            {pkg.isFree ? (
              <span className="text-emerald-400 font-bold text-2xl">FREE</span>
            ) : (
              <div>
                <span className="text-white font-bold text-2xl">₹{(pkg.discountedPrice || pkg.price)?.toLocaleString()}</span>
                {pkg.discountedPrice && (
                  <span className="text-dark-500 text-sm line-through ml-2">₹{pkg.price?.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          <button onClick={handlePurchase} disabled={isProcessing} className="btn-primary btn-sm disabled:opacity-60">
            {isProcessing ? <Spinner size="sm" /> : (
              <>
                <ShoppingCart size={14} /> {pkg.isFree ? 'Get Free' : 'Buy Package'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
