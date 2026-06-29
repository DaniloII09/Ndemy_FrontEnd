import axiosInstance from './axiosInstance';

export const getCoursesApi = async ({ search = '', category = '', page = 0, size = 6 } = {}) => {
  const response = await axiosInstance.get('/api/courses', {
    params: { search: search || undefined, category: category || undefined, page, size },
  });
  // El backend devuelve GeneralResponse { data: Page<CourseSummaryResponse> }
  return response.data.data;
};

export const getCourseDetailApi = async (courseId) => {
  const response = await axiosInstance.get(`/api/courses/${courseId}`);
  // El backend devuelve GeneralResponse { data: CourseDetailResponse }
  return response.data.data;
};

export const checkoutApi = async (courseId, couponCode = null) => {
  const response = await axiosInstance.post('/api/payment/checkout', {
    courseId,
    ...(couponCode ? { couponCode } : {}),
  });
  return response.data.data;
};

// Valida un cupón y devuelve el precio con descuento (sin cobrar todavía)
export const previewCouponApi = async (courseId, code) => {
  const response = await axiosInstance.get('/api/coupons/preview', {
    params: { courseId, code },
  });
  // GeneralResponse { data: CouponPreviewResponse }
  return response.data.data;
};

// ── Instructor ──────────────────────────────────────────────
export const getMyCoursesApi = async () => {
  const res = await axiosInstance.get('/api/instructor/me/courses');
  return res.data.data;
};

export const createCourseApi = async (payload) => {
  const res = await axiosInstance.post('/api/courses', payload);
  return res.data.data;
};

export const updateCourseApi = async (courseId, payload) => {
  const res = await axiosInstance.put(`/api/courses/${courseId}`, payload);
  return res.data.data;
};

export const createModuleApi = async (courseId, data) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/modules`, data);
  return res.data.data;
};

export const createLessonApi = async (moduleId, data) => {
  const res = await axiosInstance.post(`/api/modules/${moduleId}/lessons`, data);
  return res.data.data;
};

export const publishCourseApi = async (courseId) => {
  const res = await axiosInstance.patch(`/api/courses/${courseId}/publish`);
  return res.data.data;
};