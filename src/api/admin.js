import axiosInstance from './axiosInstance';

export const getAllUsersApi = async () => {
  const res = await axiosInstance.get('/api/admin/users');
  return res.data;           // este endpoint devuelve List<UserResponse> directo
};

export const updateUserApi = async (id, data) => {
  const res = await axiosInstance.put(`/api/admin/users/${id}`, data);
  return res.data;
};

export const lockUserApi = async (id) => {
  // banear = poner isLocked true via updateUser
  return updateUserApi(id, { isLocked: true });
};

export const unlockUserApi = async (id) => {
  const res = await axiosInstance.put(`/api/admin/users/${id}/unlock`);
  return res.data;
};

export const deactivateUserApi = async (id) => {
  const res = await axiosInstance.delete(`/api/admin/users/${id}`);
  return res.data;
};