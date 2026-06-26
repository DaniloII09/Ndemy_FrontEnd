import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  STUDENT: 'Estudiante',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Administrador',
};

const ROLE_COLORS = {
  STUDENT: '#a78bfa',
  INSTRUCTOR: '#c084fc',
  ADMIN: '#f87171',
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const dashboardPath = user ? `/${user.role.toLowerCase()}/dashboard` : '/';

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav style={s.nav}>
      <div style={s.inner}>

        {/* Logo */}
        <Link to="/courses" style={s.logo}>
          <span style={s.logoIcon}>N</span>
          <span style={s.logoText}>ndemy</span>
        </Link>

        {/* Links centrales */}
        <div style={s.links}>
          <Link
            to="/courses"
            style={{ ...s.link, ...(isActive('/courses') ? s.linkActive : {}) }}
          >
            Explorar
          </Link>
          {isAuthenticated && (
            <Link
              to={dashboardPath}
              style={{ ...s.link, ...(isActive(dashboardPath) ? s.linkActive : {}) }}
            >
              Mi perfil
            </Link>
          )}
        </div>

        {/* Derecha */}
        <div style={s.right}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate('/login')} style={s.btnGhost}>
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/register')} style={s.btnAccent}>
                Registrarse
              </button>
            </>
          ) : (
            <div ref={menuRef} style={s.avatarWrap}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={s.avatarBtn}
                aria-label="Menú de usuario"
              >
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} style={s.avatarImg} />
                ) : (
                  <span style={s.avatarInitials}>{initials}</span>
                )}
                <span style={s.chevron}>{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropHeader}>
                    <p style={s.dropName}>{user.name}</p>
                    <span style={{
                      ...s.dropRole,
                      color: ROLE_COLORS[user.role] ?? '#a78bfa',
                      background: (ROLE_COLORS[user.role] ?? '#a78bfa') + '22',
                    }}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                    <p style={s.dropEmail}>{user.email}</p>
                  </div>

                  <hr style={s.divider} />

                  <button
                    onClick={() => { navigate(dashboardPath); setMenuOpen(false); }}
                    style={s.dropItem}
                  >
                    <span>👤</span> Mi perfil
                  </button>

                  <hr style={s.divider} />

                  <button onClick={handleLogout} style={{ ...s.dropItem, ...s.dropLogout }}>
                    <span>↩</span> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#0f0d14',
    borderBottom: '1px solid #2a2535',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#f3f0ff',
    letterSpacing: '-0.4px',
  },
  links: {
    display: 'flex',
    gap: '0.2rem',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    color: '#9d97aa',
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  },
  linkActive: {
    background: 'rgba(170,59,255,0.15)',
    color: '#c084fc',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  btnGhost: {
    padding: '0.42rem 1rem',
    border: '1px solid #2a2535',
    borderRadius: '8px',
    background: 'transparent',
    color: '#c9c3d5',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnAccent: {
    padding: '0.42rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  avatarWrap: { position: 'relative' },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.28rem 0.55rem 0.28rem 0.28rem',
    border: '1px solid #2a2535',
    borderRadius: '999px',
    background: 'transparent',
    cursor: 'pointer',
  },
  avatarImg: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarInitials: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: '0.5rem',
    color: '#9d97aa',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '210px',
    background: '#1a1625',
    border: '1px solid #2a2535',
    borderRadius: '12px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    padding: '0.5rem',
    zIndex: 200,
  },
  dropHeader: {
    padding: '0.5rem 0.75rem 0.7rem',
  },
  dropName: {
    fontWeight: 700,
    color: '#f3f0ff',
    fontSize: '0.92rem',
    margin: '0 0 0.3rem',
  },
  dropRole: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '999px',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  dropEmail: {
    fontSize: '0.78rem',
    color: '#7a7388',
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #2a2535',
    margin: '0.3rem 0',
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.52rem 0.75rem',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: '#c9c3d5',
    fontSize: '0.865rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
  },
  dropLogout: {
    color: '#f87171',
  },
};