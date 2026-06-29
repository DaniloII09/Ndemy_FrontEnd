import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import CoursePlayer from '../pages/CoursePlayer';
import StudentDashboard from '../pages/StudentDashboard';
import CheckoutPage from '../pages/CheckoutPage';
import InstructorDashboard from '../pages/InstructorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import MyCourses from '../pages/MyCourses';
import ProfilePage from '../pages/ProfilePage';
import CertificatesPage from '../pages/CertificatesPage';
import ExamPage from '../pages/ExamPage';
import WishlistPage from '../pages/WishlistPage';

function AuthGate({ children }) {
  const { isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  return children;
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  return children;
}

// Placeholder para dashboards de instructor/admin (pendientes)
function Placeholder({ name }) {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🚧 {name}</h1>
      {user && <p>Hola, <strong>{user.name}</strong> — Rol: {user.role}</p>}
      {user && <button onClick={logout}>Cerrar sesión</button>}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Navbar />
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
          <Route path="/courses/:id/checkout" element={
            <PrivateRoute><CheckoutPage /></PrivateRoute>
          } />
          <Route path="/courses/:id/exam" element={
            <PrivateRoute><ExamPage /></PrivateRoute>
          } />

          {/* Estudiante */}
          <Route path="/my-courses" element={
            <PrivateRoute>
              <RoleRoute role="STUDENT"><MyCourses /></RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/certificates" element={
            <PrivateRoute>
              <RoleRoute role="STUDENT"><CertificatesPage /></RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/wishlist" element={
            <PrivateRoute>
              <RoleRoute role="STUDENT"><WishlistPage /></RoleRoute>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><ProfilePage /></PrivateRoute>
          } />
          <Route path="/student/dashboard" element={
            <PrivateRoute>
              <RoleRoute role="STUDENT">
                <StudentDashboard />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={
            <PrivateRoute>
              <RoleRoute role="INSTRUCTOR">
                <InstructorDashboard />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute>
              <RoleRoute role="ADMIN">
                <AdminDashboard />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}