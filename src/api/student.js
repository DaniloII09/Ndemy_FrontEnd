import axiosInstance from './axiosInstance';

// Cursos en los que el estudiante está inscrito, con progreso
export const getMyEnrolledCoursesApi = async () => {
  const res = await axiosInstance.get('/api/students/me/courses');
  return res.data.data;
};

// Progreso de un curso específico
export const getCourseProgressApi = async (courseId) => {
  const res = await axiosInstance.get(`/api/students/me/courses/${courseId}/progress`);
  return res.data.data;
};

// Certificados del estudiante
export const getMyCertificatesApi = async () => {
  const res = await axiosInstance.get('/api/students/me/certificates');
  return res.data.data;
};

// Marca una lección como completada y devuelve { lessonId, progress, courseCompleted }
export const completeLessonApi = async (lessonId) => {
  const res = await axiosInstance.post(`/api/lessons/${lessonId}/complete`);
  return res.data.data;
};

// Pagos del estudiante (para poder reembolsar / desinscribirse)
export const getMyPaymentsApi = async () => {
  const res = await axiosInstance.get('/api/payment/me');
  return res.data.data;
};

// Reembolso / desinscripción: requiere el ID del pago (no el del curso)
export const refundApi = async (paymentId) => {
  const res = await axiosInstance.post(`/api/payment/${paymentId}/refund`);
  return res.data.data;
};
