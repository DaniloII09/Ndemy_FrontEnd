import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = {
  STUDENT: [
    { label: 'Mi Dashboard', path: '/student/dashboard', icon: '🏠' },
    { label: 'Explorar cursos', path: '/courses', icon: '🔍' },
    { label: 'Mis cursos', path: '/student/my-courses', icon: '📚' },
    { label: 'Certificados', path: '/student/certificates', icon: '🏆' },
    { label: 'Wishlist', path: '/student/wishlist', icon: '❤️' },
  ],
  INSTRUCTOR: [
    { label: 'Mi Dashboard', path: '/instructor/dashboard', icon: '🏠' },
    { label: 'Mis cursos', path: '/instructor/courses', icon: '📚' },
    { label: 'Crear curso', path: '/instructor/courses/new', icon: '➕' },
    { label: 'Ingresos', path: '/instructor/revenue', icon: '💰' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
    { label: 'Usuarios', path: '/admin/users', icon: '👥' },
    { label: 'Cursos', path: '/admin/courses', icon: '📚' },
    { label: 'Cupones', path: '/admin/coupons', icon: '🎟️' },
    { label: 'Auditoría', path: '/admin/audit', icon: '📋' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = MENU_ITEMS[user?.role] || [];

  return (
    <div style={styles.container}>
      {/* sidebar */}
      <aside style={styles.sidebar}>
        {/* logo */}
        <div style={styles.logo} onClick={() => navigate('/courses')}>
          <span style={styles.logoText}>Ndemy</span>
        </div>

        {/* info del usuario */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.name}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
        </div>

        {/* Menú */}
        <nav style={styles.nav}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button onClick={logout} style={styles.logoutBtn}>
          <span>⏻</span>
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* Contenido principal */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f8fafc' },
  sidebar: { width: '240px', background: '#1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  logo: { padding: '1.5rem 1.25rem 1rem', cursor: 'pointer', borderBottom: '1px solid #334155' },
  logoText: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid #334155' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  userDetails: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  userName: { fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  nav: { flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', width: '100%', transition: 'all 0.15s' },
  navItemActive: { background: '#2563eb', color: '#fff' },
  navIcon: { fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', borderTop: '1px solid #334155', width: '100%' },
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
};