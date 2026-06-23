import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import CoursePlayer from '../pages/CoursePlayer';

// Muestra un loader mientras verifica la sesión
function AuthGate({ children }) {
  const { isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  return children;
}

// Ruta privada, para redirigir al login si no hay sesión
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Ruta por rol, redirige si el rol no coincide
function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  return children;
}

// Placeholder temporal para páginas que aún no he trabajado, muestra el nombre y el usuario logueado
function Placeholder({ name }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1> PROXIMAMENTE </h1>
      {user && <p>Hola, <strong>{user.name}</strong> — Rol: {user.role}</p>}
      {user && <button onClick={logout}>Cerrar sesión</button>}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/player" element={
          <PrivateRoute><CoursePlayer /></PrivateRoute>
          } />

          {/* Privadas —- estudiante */}
          <Route path="/student/dashboard" element={
            <PrivateRoute><RoleRoute role="STUDENT"><Placeholder name="Dashboard Estudiante" /></RoleRoute></PrivateRoute>
          } />

          {/* Privadas —- instructor */}
          <Route path="/instructor/dashboard" element={
            <PrivateRoute><RoleRoute role="INSTRUCTOR"><Placeholder name="Dashboard Instructor" /></RoleRoute></PrivateRoute>
          } />

          {/* Privadas —- admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute><RoleRoute role="ADMIN"><Placeholder name="Dashboard Admin" /></RoleRoute></PrivateRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}