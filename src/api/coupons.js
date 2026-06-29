import axiosInstance from './axiosInstance';

// Lista de cupones: admin ve todos, instructor solo los suyos
export const getAllCouponsApi = async () => {
  const res = await axiosInstance.get('/api/coupons');
  return res.data.data;
};

// payload: { code, discountPercent, maxUses, expiresAt }
export const createCouponApi = async (payload) => {
  const res = await axiosInstance.post('/api/coupons', payload);
  return res.data.data;
};

export const updateCouponApi = async (id, payload) => {
  const res = await axiosInstance.put(`/api/coupons/${id}`, payload);
  return res.data.data;
};

// Desactiva (soft-delete) el cupón
export const deactivateCouponApi = async (id) => {
  const res = await axiosInstance.delete(`/api/coupons/${id}`);
  return res.data;
};
