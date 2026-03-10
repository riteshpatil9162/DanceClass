import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminUsers, updateUserStatus } from '../../api';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => getAdminUsers({ search, page, limit: 20 }),
    keepPreviousData: true,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-users']);
      toast.success('User status updated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const users = data?.data?.data || data?.data || [];
  const total = data?.data?.meta?.total || users.length;
  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <span className="text-gray-400 text-sm">{total} total</span>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="form-input max-w-sm"
          placeholder="Search by name or email..."
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No users found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 pr-4">Orders</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="py-3 pr-4 font-medium text-white">{user.name}</td>
                    <td className="py-3 pr-4 text-gray-300">{user.email}</td>
                    <td className="py-3 pr-4 text-gray-400">{user.phone || '—'}</td>
                    <td className="py-3 pr-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{user.orderCount || 0}</td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({ id: user._id, isActive: !user.isActive })
                        }
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                            : 'bg-red-500/20 text-red-400 hover:bg-green-500/20 hover:text-green-400'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Blocked'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
