import axiosInstance from './axiosInstance';

// Perfil del usuario autenticado (UserResponse directo, sin wrapper)
export const getMyProfileApi = async () => {
  const res = await axiosInstance.get('/api/users/me');
  return res.data;
};

// Actualiza nombre y/o foto. Devuelve el UserResponse actualizado.
export const updateMyProfileApi = async ({ name, photoUrl }) => {
  const res = await axiosInstance.put('/api/users/me', { name, photoUrl });
  return res.data;
};

// Cambia la contraseña del usuario autenticado.
export const changePasswordApi = async ({ currentPassword, newPassword }) => {
  const res = await axiosInstance.put('/api/users/me/password', { currentPassword, newPassword });
  return res.data;
};
