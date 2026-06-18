import axiosInstance from './axiosInstance';

export const loginApi = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  return response.data; // { accessToken, refreshToken, user }
};

export const registerApi = async (name, email, password) => {
  const response = await axiosInstance.post('/api/auth/register', { name, email, password });
  return response.data; // { accessToken, refreshToken, user }
};