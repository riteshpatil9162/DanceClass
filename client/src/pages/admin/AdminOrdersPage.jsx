import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '../../api';

const STATUS_COLORS = {
  completed: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-blue-500/20 text-blue-400',
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, typeFilter],
    queryFn: () => getAdminOrders({ page, limit: 20, status: statusFilter, type: typeFilter }),
    keepPreviousData: true,
  });

  const orders = data?.data?.data || [];
  const total = data?.data?.meta?.total || orders.length;
  const totalPages = Math.ceil(total / 20) || 1;
  const revenue = 0; // Revenue shown on dashboard stats

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-orange-400">
            ₹{revenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="form-input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="form-input w-auto"
        >
          <option value="">All Types</option>
          <option value="course">Course</option>
          <option value="package">Package</option>
          <option value="event">Event</option>
        </select>
        <span className="self-center text-gray-400 text-sm">{total} orders</span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No orders found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      {order.razorpayOrderId || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-white font-medium">{order.user?.name || '—'}</p>
                      <p className="text-gray-500 text-xs">{order.user?.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 max-w-[180px] truncate">
                      {order.course?.title ||
                        order.package?.title ||
                        order.event?.title ||
                        '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                        {order.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white font-semibold">
                      ₹{order.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-40 text-sm"
              >
                Prev
              </button>
              <span className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-40 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
