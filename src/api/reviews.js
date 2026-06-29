import axiosInstance from './axiosInstance';

// Reseñas de un curso (público)
export const getCourseReviewsApi = async (courseId) => {
  const res = await axiosInstance.get(`/api/courses/${courseId}/reviews`);
  return res.data.data;
};

// Crear reseña por estudiante inscrito. { rating: 1-5, comment }
export const createReviewApi = async (courseId, { rating, comment }) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/reviews`, { rating, comment });
  return res.data.data;
};

// Editar la reseña propia
export const updateReviewApi = async (reviewId, { rating, comment }) => {
  const res = await axiosInstance.put(`/api/reviews/${reviewId}`, { rating, comment });
  return res.data.data;
};

// Eliminar la reseña propia
export const deleteReviewApi = async (reviewId) => {
  const res = await axiosInstance.delete(`/api/reviews/${reviewId}`);
  return res.data;
};
