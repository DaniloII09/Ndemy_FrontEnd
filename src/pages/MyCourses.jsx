import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyEnrolledCoursesApi } from '../api/student';

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMyEnrolledCoursesApi()
      .then(data => { if (active) setCourses(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setCourses([]); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.heading}>Mis cursos</h1>
        <p style={s.sub}>Continúa donde lo dejaste.</p>
      </div>

      {isLoading ? (
        <div style={s.center}>Cargando...</div>
      ) : courses.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: '2.5rem' }}>📚</span>
          <p>Aún no estás inscrito en ningún curso.</p>
          <button style={s.exploreBtn} onClick={() => navigate('/courses')}>Explorar cursos</button>
        </div>
      ) : (
        <div style={s.grid}>
          {courses.map(c => {
            const pct = Math.round(c.progress ?? 0);
            return (
              <div key={c.courseId} style={s.card}>
                <div style={s.thumbWrap}>
                  <img src={c.thumbnailUrl} alt={c.courseTitle} style={s.thumb} />
                  {c.isCompleted && <span style={s.doneBadge}>✅ Completado</span>}
                </div>
                <div style={s.body}>
                  <h3 style={s.title}>{c.courseTitle}</h3>

                  <div style={s.progressRow}>
                    <div style={s.progressBar}>
                      <div style={{ ...s.progressFill, width: `${pct}%` }} />
                    </div>
                    <span style={s.progressLabel}>{pct}%</span>
                  </div>

                  <div style={s.actions}>
                    <button style={s.continueBtn} onClick={() => navigate(`/courses/${c.courseId}/player`)}>
                      {pct === 0 ? 'Empezar' : pct === 100 ? 'Repasar' : 'Continuar'}
                    </button>
                    {pct === 100 && (
                      <button style={s.examBtn} onClick={() => navigate(`/courses/${c.courseId}/exam`)}>
                        Ir al examen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans, sans-serif)', textAlign: 'left' },
  header: { marginBottom: '1.75rem' },
  heading: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-h, #111827)', margin: '0 0 0.25rem' },
  sub: { color: 'var(--text, #6b7280)', margin: 0, fontSize: '0.95rem' },
  center: { textAlign: 'center', padding: '4rem', color: 'var(--text, #6b7280)' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', padding: '4rem 2rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '16px', color: 'var(--text, #6b7280)' },
  exploreBtn: { padding: '0.6rem 1.4rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { background: 'var(--bg, #fff)', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border, #f0f0f0)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', height: '160px', objectFit: 'cover', display: 'block' },
  doneBadge: { position: 'absolute', top: '0.6rem', right: '0.6rem', background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' },
  body: { padding: '1.1rem' },
  title: { fontSize: '1rem', fontWeight: 700, margin: '0 0 0.85rem', color: 'var(--text-h, #1a1a1a)', lineHeight: 1.4 },
  progressRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' },
  progressBar: { flex: 1, height: '8px', background: 'var(--code-bg, #eef2ff)', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--accent, #aa3bff)', borderRadius: '999px', transition: 'width 0.3s' },
  progressLabel: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-h, #4f46e5)', minWidth: '36px', textAlign: 'right' },
  actions: { display: 'flex', gap: '0.5rem' },
  continueBtn: { flex: 1, padding: '0.6rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' },
  examBtn: { padding: '0.6rem 0.9rem', background: 'transparent', color: 'var(--accent, #aa3bff)', border: '1px solid var(--accent, #aa3bff)', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' },
};
