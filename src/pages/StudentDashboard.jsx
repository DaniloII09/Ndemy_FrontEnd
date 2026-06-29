import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyEnrolledCoursesApi, getMyCertificatesApi } from '../api/student';

const QUICK_LINKS = [
  { label: 'Explorar cursos',      icon: '🔍', to: '/courses',   desc: 'Descubre nuevos temas' },
  { label: 'Mis cursos',           icon: '📖', to: '/my-courses', desc: 'Continúa donde dejaste' },
  { label: 'Mi perfil',            icon: '👤', to: '/profile',    desc: 'Edita tu información' },
  { label: 'Mis certificados',     icon: '🏅', to: '/certificates', desc: 'Descarga tus logros' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getMyEnrolledCoursesApi(), getMyCertificatesApi()])
      .then(([c, cert]) => {
        if (!active) return;
        if (c.status === 'fulfilled' && Array.isArray(c.value)) setCourses(c.value);
        if (cert.status === 'fulfilled' && Array.isArray(cert.value)) setCerts(cert.value);
      });
    return () => { active = false; };
  }, []);

  const completedLessons = courses.reduce((acc, c) => acc + (c.completedLessons?.length ?? 0), 0);
  const completedCourses = courses.filter(c => c.isCompleted).length;

  const STATS = [
    { label: 'Cursos inscritos', value: courses.length, icon: '📚' },
    { label: 'Lecciones completadas', value: completedLessons, icon: '✅' },
    { label: 'Certificados', value: certs.length, icon: '🏆' },
    { label: 'Cursos completados', value: completedCourses, icon: '🎯' },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const firstName = user?.name?.split(' ')[0] ?? 'estudiante';

  return (
    <div style={s.page}>
      {/* Hero saludo */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <p style={s.heroGreeting}>{greeting} 👋</p>
          <h1 style={s.heroName}>{firstName}</h1>
          <p style={s.heroSub}>
            Sigue aprendiendo — cada lección te acerca a tu próximo certificado.
          </p>
          <button style={s.heroBtn} onClick={() => navigate('/courses')}>
            Explorar cursos
          </button>
        </div>
        <div style={s.heroIllustration}>
          <span style={s.illustrationEmoji}>🎓</span>
        </div>
      </section>

      {/* Estadísticas */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Tu progreso</h2>
        <div style={s.statsGrid}>
          {STATS.map(stat => (
            <div key={stat.label} style={s.statCard}>
              <span style={s.statIcon}>{stat.icon}</span>
              <span style={s.statValue}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Accesos rápidos */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Qué quieres hacer hoy?</h2>
        <div style={s.linksGrid}>
          {QUICK_LINKS.map(link => (
            <button
              key={link.label}
              style={s.linkCard}
              onClick={() => navigate(link.to)}
            >
              <span style={s.linkIcon}>{link.icon}</span>
              <div>
                <p style={s.linkLabel}>{link.label}</p>
                <p style={s.linkDesc}>{link.desc}</p>
              </div>
              <span style={s.linkArrow}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* Próximamente */}
      <section style={s.section}>
        <div style={s.comingSoon}>
          <span style={s.comingIcon}>🚧</span>
          <div>
            <p style={s.comingTitle}>Más funciones en camino</p>
            <p style={s.comingDesc}>
              Tus cursos en progreso, recomendaciones personalizadas y más aparecerán aquí pronto.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const s = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
    fontFamily: 'var(--sans)',
    textAlign: 'left',
  },
  /* Hero */
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, var(--accent-bg) 0%, transparent 70%)',
    border: '1px solid var(--accent-border)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2.5rem',
    gap: '1rem',
    overflow: 'hidden',
  },
  heroContent: { flex: 1 },
  heroGreeting: {
    fontSize: '0.95rem',
    color: 'var(--accent)',
    fontWeight: 600,
    margin: '0 0 0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  heroName: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'var(--text-h)',
    margin: '0 0 0.5rem',
    letterSpacing: '-1px',
  },
  heroSub: {
    fontSize: '1rem',
    color: 'var(--text)',
    margin: '0 0 1.5rem',
    maxWidth: '420px',
    lineHeight: 1.6,
  },
  heroBtn: {
    padding: '0.65rem 1.5rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  heroIllustration: {
    flexShrink: 0,
  },
  illustrationEmoji: {
    fontSize: '5rem',
    opacity: 0.8,
    display: 'block',
  },
  /* Section */
  section: { marginBottom: '2.5rem' },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    margin: '0 0 1rem',
    letterSpacing: '-0.3px',
  },
  /* Stats */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  statIcon: { fontSize: '1.5rem' },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-h)',
    letterSpacing: '-1px',
    lineHeight: 1,
  },
  statLabel: { fontSize: '0.8rem', color: 'var(--text)' },
  /* Quick links */
  linksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  linkCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s',
  },
  linkIcon: { fontSize: '1.6rem', flexShrink: 0 },
  linkLabel: { fontWeight: 600, color: 'var(--text-h)', fontSize: '0.9rem', margin: 0 },
  linkDesc: { fontSize: '0.78rem', color: 'var(--text)', margin: '2px 0 0' },
  linkArrow: { marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, flexShrink: 0 },
  /* Coming soon */
  comingSoon: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
  },
  comingIcon: { fontSize: '1.75rem', flexShrink: 0 },
  comingTitle: { fontWeight: 600, color: 'var(--text-h)', fontSize: '0.9rem', margin: '0 0 0.2rem' },
  comingDesc: { fontSize: '0.82rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 },
};