import axiosInstance from './axiosInstance';

export const getAllUsersApi = async () => {
  const res = await axiosInstance.get('/api/admin/users');
  return res.data;           // endpoint devuelve List<UserResponse> directo
};

export const updateUserApi = async (id, data) => {
  const res = await axiosInstance.put(`/api/admin/users/${id}`, data);
  return res.data;
};

export const lockUserApi = async (id) => {
  // banear = bloquear la cuenta vía endpoint dedicado (isLocked = true)
  const res = await axiosInstance.put(`/api/admin/users/${id}/lock`);
  return res.data;
};

export const unlockUserApi = async (id) => {
  const res = await axiosInstance.put(`/api/admin/users/${id}/unlock`);
  return res.data;
};

export const deactivateUserApi = async (id) => {
  const res = await axiosInstance.delete(`/api/admin/users/${id}`);
  return res.data;
};