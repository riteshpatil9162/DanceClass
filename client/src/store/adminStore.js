import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      adminToken: null,
      isAdminAuthenticated: false,
      loading: true,

      setAdminAuth: (admin, token) => {
        localStorage.setItem('adminToken', token);
        set({ admin, adminToken: token, isAdminAuthenticated: true });
      },

      updateAdmin: (admin) => set({ admin }),

      adminLogout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        set({ admin: null, adminToken: null, isAdminAuthenticated: false });
      },

      hasPermission: (permission) => {
        const { admin } = useAdminStore.getState();
        if (!admin) return false;
        if (admin.isSuperAdmin) return true;
        return admin.permissions?.includes(permission) || false;
      },
    }),
    { name: 'admin-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = false;
      },
    }
  )
);

export { useAdminStore };
export default useAdminStore;
