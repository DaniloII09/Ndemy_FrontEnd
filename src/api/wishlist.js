import axiosInstance from './axiosInstance';

// Lista de cursos guardados por el estudiante autenticado
export const getWishlistApi = async () => {
  const res = await axiosInstance.get('/api/wishlist');
  return res.data.data;
};

// Agrega un curso a la wishlist
export const addToWishlistApi = async (courseId) => {
  const res = await axiosInstance.post(`/api/wishlist/${courseId}`);
  return res.data;
};

// Quita un curso de la wishlist
export const removeFromWishlistApi = async (courseId) => {
  const res = await axiosInstance.delete(`/api/wishlist/${courseId}`);
  return res.data;
};
