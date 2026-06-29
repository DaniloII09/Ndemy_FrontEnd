import axiosInstance from './axiosInstance';

export const getCoursesApi = async ({ search = '', category = '', page = 0, size = 6 } = {}) => {
  const response = await axiosInstance.get('/api/courses', {
    params: { search: search || undefined, category: category || undefined, page, size },
  });
  return response.data.data;
};

export const getCourseDetailApi = async (courseId) => {
  const response = await axiosInstance.get(`/api/courses/${courseId}`);
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
  return response.data.data;
};

// ── Instructor: cursos ───────────────────────────────────────
export const getMyCoursesApi = async () => {
  const res = await axiosInstance.get('/api/instructor/me/courses');
  return res.data.data;
};

export const createCourseApi = async (payload) => {
  const res = await axiosInstance.post('/api/courses', payload);
  return res.data.data;
};

// Editar datos del curso (solo instructor dueño)
export const updateCourseApi = async (courseId, payload) => {
  const res = await axiosInstance.put(`/api/courses/${courseId}`, payload);
  return res.data.data;
};

// Eliminar curso (instructor dueño o admin)
export const deleteCourseApi = async (courseId) => {
  const res = await axiosInstance.delete(`/api/courses/${courseId}`);
  return res.data;
};

export const publishCourseApi = async (courseId) => {
  const res = await axiosInstance.patch(`/api/courses/${courseId}/publish`);
  return res.data.data;
};

// Estudiantes inscritos en un curso del instructor (con progreso y pago)
export const getInstructorCourseStudentsApi = async (courseId) => {
  const res = await axiosInstance.get(`/api/instructor/me/courses/${courseId}/students`);
  return res.data.data;
};

// ── Módulos ──────────────────────────────────────────────────
export const createModuleApi = async (courseId, data) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/modules`, data);
  return res.data.data;
};

export const updateModuleApi = async (moduleId, data) => {
  const res = await axiosInstance.put(`/api/modules/${moduleId}`, data);
  return res.data.data;
};

export const deleteModuleApi = async (moduleId) => {
  const res = await axiosInstance.delete(`/api/modules/${moduleId}`);
  return res.data;
};

// ── Lecciones ────────────────────────────────────────────────
export const createLessonApi = async (moduleId, data) => {
  const res = await axiosInstance.post(`/api/modules/${moduleId}/lessons`, data);
  return res.data.data;
};

export const updateLessonApi = async (lessonId, data) => {
  const res = await axiosInstance.put(`/api/lessons/${lessonId}`, data);
  return res.data.data;
};

export const deleteLessonApi = async (lessonId) => {
  const res = await axiosInstance.delete(`/api/lessons/${lessonId}`);
  return res.data;
};