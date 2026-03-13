import api from './axios';

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getUserProfile = () => api.get('/auth/profile');
export const updateUserProfile = (data) => api.put('/auth/profile', data);
// Alias used by ProfilePage
export const updateProfile = updateUserProfile;
export const changePassword = (data) => api.put('/auth/change-password', data);

// Courses
export const getCourses = (params) => api.get('/courses', { params });
export const getCourseBySlug = (slug) => api.get(`/courses/${slug}`);
export const getCourseContent = (slug) => api.get(`/courses/${slug}/content`);
export const getFeaturedCourses = () => api.get('/courses/featured');
export const getCategories = () => api.get('/courses/categories');

// Events
export const getEvents = (params) => api.get('/events', { params });
export const getEventBySlug = (slug) => api.get(`/events/${slug}`);
export const getEventByBookingSlug = (slug) => api.get(`/events/book/${slug}`);
export const getUpcomingEvents = () => api.get('/events/upcoming');

// Packages
export const getPackages = () => api.get('/packages');
export const getPackageBySlug = (slug) => api.get(`/packages/${slug}`);

// Payments
export const createCourseOrder = (data) => api.post('/payments/course/create-order', data);
export const verifyCoursePayment = (data) => api.post('/payments/course/verify', data);
export const createPackageOrder = (data) => api.post('/payments/package/create-order', data);
export const verifyPackagePayment = (data) => api.post('/payments/package/verify', data);
export const createEventOrder = (data) => api.post('/payments/event/create-order', data);
export const verifyEventPayment = (data) => api.post('/payments/event/verify', data);
export const getUserOrders = () => api.get('/payments/my-orders');

// ===== ADMIN APIs =====
export const adminLogin = (data) => api.post('/admin/login', data);
export const getAdminProfile = () => api.get('/admin/profile');
export const getDashboardStats = () => api.get('/admin/stats');

// Admin - Admins management
export const getAllAdmins = () => api.get('/admin/admins');
export const getAdminAdmins = getAllAdmins; // alias
export const createAdmin = (data) => api.post('/admin/admins', data);
export const updateAdminPermissions = (id, data) => api.put(`/admin/admins/${id}`, data);
export const updateAdmin = updateAdminPermissions; // alias
export const deleteAdmin = (id) => api.delete(`/admin/admins/${id}`);

// Admin - Users
export const getAllUsers = (params) => api.get('/admin/users', { params });
export const getAdminUsers = getAllUsers; // alias
export const toggleUserStatus = (id) => api.put(`/admin/users/${id}/toggle`);
export const updateUserStatus = (id, data) => api.put(`/admin/users/${id}/toggle`, data); // alias

// Admin - Courses
export const adminGetCourses = () => api.get('/courses/admin/all');
export const createCourse = (data) => api.post('/courses/admin/create', data);
export const updateCourse = (id, data) => api.put(`/courses/admin/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/admin/${id}`);
export const toggleCoursePublish = (id) => api.patch(`/courses/admin/${id}/toggle-publish`);

// Admin - Events
export const adminGetEvents = () => api.get('/events/admin/all');
// Aliases for pages that use the older naming convention
export const getAdminEvents = adminGetEvents;
export const createEvent = (data) => api.post('/events/admin/create', data);
export const updateEvent = (id, data) => api.put(`/events/admin/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/admin/${id}`);
export const updateEventSponsors = (id, data) => api.put(`/events/admin/${id}/sponsors`, data);
export const regenerateBookingSlug = (id) => api.post(`/events/admin/${id}/regen-slug`);

// Admin - Packages
export const adminGetPackages = () => api.get('/packages/admin/all');
// Aliases for pages that use the older naming convention
export const getAdminPackages = adminGetPackages;
export const getAdminCourses = adminGetCourses;
export const createPackage = (data) => api.post('/packages/admin/create', data);
export const updatePackage = (id, data) => api.put(`/packages/admin/${id}`, data);
export const deletePackage = (id) => api.delete(`/packages/admin/${id}`);

// Admin - Orders
export const adminGetOrders = (params) => api.get('/payments/admin/all', { params });
export const getAdminOrders = adminGetOrders; // alias
