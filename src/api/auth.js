import axiosInstance from './axiosInstance';


// ─── MOCK TEMPORAL __

/*const MOCK_USERS = {
  'student@ndemy.com':{ password: '12345678', role: 'STUDENT', name: 'Ana Estudiante' },
  'instructor@ndemy.com':{ password: '12345678', role: 'INSTRUCTOR', name: 'Carlos Instructor' },
  'admin@ndemy.com':{ password: '12345678', role: 'ADMIN', name: 'Admin Ndemy' },
};

const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = MOCK_USERS[email];
      if (!found || found.password !== password) {
        reject({ response: { status: 401, data: { message: 'Credenciales inválidas' } } });
        return;
      }
      resolve({
        accessToken:  'mock-access-token-' + found.role,
        refreshToken: 'mock-refresh-token',
        user: {
          id:        'uuid-mock-001',
          name:      found.name,
          email:     email,
          role:      found.role,
          isActive:  true,
          isLocked:  false,
          createdAt: new Date().toISOString(),
        },
      });
    }, 600); // latencia de red
  });
};

const mockRegister = (name, email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken:  'mock-access-token-STUDENT',
        refreshToken: 'mock-refresh-token',
        user: {
          id:        'uuid-mock-002',
          name:      name,
          email:     email,
          role:      'STUDENT',
          isActive:  true,
          isLocked:  false,
          createdAt: new Date().toISOString(),
        },
      });
    }, 600);
  });
};
// ─── FIN MOCK ────
*/

export const loginApi = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  return response.data;
};
 
export const registerApi = async (name, email, password) => {
  const response = await axiosInstance.post('/api/auth/register', { name, email, password });
  return response.data;
};