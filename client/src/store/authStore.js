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

      updateUser: (user) => set({ user }),
      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      hasCourseAccess: (courseId) => {
        const { user } = get();
        if (!user) return false;
        const entry = user.purchasedCourses?.find(
          (p) => (p.course?._id || p.course) === courseId
        );
        if (!entry) return false;
        if (!entry.expiresAt) return true;
        return new Date(entry.expiresAt) > new Date();
      },

      hasEventBooked: (eventId) => {
        const { user } = get();
        if (!user) return false;
        return user.bookedEvents?.some(
          (b) => (b.event?._id || b.event) === eventId
        );
      },
    }),
    { name: 'user-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.loading = false;
      },
    }
  )
);

export { useAuthStore };
export default useAuthStore;
