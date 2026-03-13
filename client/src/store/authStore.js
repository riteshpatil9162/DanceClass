import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      // Update the stored user object (used after profile fetch / purchase grant)
      updateUser: (user) => set({ user }),
      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      hasCourseAccess: (courseId) => {
        const { user } = get();
        if (!user || !courseId) return false;
        const idStr = courseId.toString();
        const entry = user.purchasedCourses?.find((p) => {
          const pid = (p.course?._id || p.course || '').toString();
          return pid === idStr;
        });
        if (!entry) return false;
        if (!entry.expiresAt) return true;
        return new Date(entry.expiresAt) > new Date();
      },

      hasEventBooked: (eventId) => {
        const { user } = get();
        if (!user || !eventId) return false;
        const idStr = eventId.toString();
        return user.bookedEvents?.some((b) => {
          const bid = (b.event?._id || b.event || '').toString();
          return bid === idStr;
        });
      },
    }),
    {
      name: 'user-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = false;
      },
    },
  ),
);

export { useAuthStore };
export default useAuthStore;
