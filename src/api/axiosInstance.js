import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({ baseURL: BASE_URL });

// Adjunta el access token a cada petición
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresca el token ante un 401; limpia sesión ante 403
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // El endpoint espera el refresh token en el header Authorization
          const res = await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          const newToken = res.data?.accessToken ?? res.data?.data?.accessToken;
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch {
          // refresh falló — sesión caducada
        }
      }

      clearSessionAndRedirect();
    }

    // 403 = Spring Security rechazó la petición (token inválido/expirado sin 401)
    if (status === 403) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export default axiosInstance;