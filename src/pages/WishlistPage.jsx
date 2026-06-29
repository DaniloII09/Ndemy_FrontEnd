import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWishlistApi, removeFromWishlistApi } from '../api/wishlist';

function WishlistCard({ course, onOpen, onRemove, removing }) {
  return (
    <div style={s.card}>
      <img
        src={course.thumbnailUrl}
        alt={course.title}
        style={s.image}
        onClick={() => onOpen(course.id)}
      />
      <div style={s.body}>
        <span style={s.category}>{course.category}</span>
        <h3 style={s.title} onClick={() => onOpen(course.id)}>{course.title}</h3>
        <p style={s.instructor}>por {course.instructorName}</p>
        <div style={s.footer}>
          <span style={s.price}>${course.price}</span>
          <div style={s.actions}>
            <button style={s.viewBtn} onClick={() => onOpen(course.id)}>Ver curso</button>
            <button style={s.removeBtn} onClick={() => onRemove(course.id)} disabled={removing === course.id}>
              {removing === course.id ? '...' : '🗑 Quitar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getWishlistApi()
      .then(data => { if (active) setCourses(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError('No se pudo cargar tu lista de deseos.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await removeFromWishlistApi(courseId);
      setCourses(cs => cs.filter(c => c.id !== courseId));
    } catch {
      setError('No se pudo quitar el curso. Intenta de nuevo.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.heading}>Tu lista de deseos</h1>
        <p style={s.subheading}>Cursos que guardaste para comprar más tarde</p>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {isLoading ? (
        <div style={s.empty}>Cargando...</div>
      ) : courses.length === 0 ? (
        <div style={s.emptyState}>
          <span style={{ fontSize: '2.5rem' }}>🤍</span>
          <p style={s.emptyTitle}>Tu lista de deseos está vacía</p>
          <p style={s.emptyDesc}>Guarda cursos que te interesen para encontrarlos fácilmente después.</p>
          <button style={s.exploreBtn} onClick={() => navigate('/courses')}>Explorar cursos</button>
        </div>
      ) : (
        <div style={s.grid}>
          {courses.map(course => (
            <WishlistCard
              key={course.id}
              course={course}
              onOpen={(id) => navigate(`/courses/${id}`)}
              onRemove={handleRemove}
              removing={removing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans)' },
  header: { marginBottom: '2rem' },
  heading: { fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.3rem', color: 'var(--text-h)', letterSpacing: '-0.5px' },
  subheading: { fontSize: '0.95rem', color: 'var(--text)', margin: 0 },
  error: { color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' },
  empty: { textAlign: 'center', padding: '3rem', color: 'var(--text)' },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    padding: '3.5rem 2rem', border: '2px dashed var(--border)', borderRadius: '16px', color: 'var(--text)',
  },
  emptyTitle: { fontWeight: 700, color: 'var(--text-h)', fontSize: '1.05rem', margin: '0.25rem 0 0' },
  emptyDesc: { fontSize: '0.875rem', margin: 0, textAlign: 'center', maxWidth: '320px' },
  exploreBtn: {
    marginTop: '0.75rem', padding: '0.65rem 1.5rem', background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { background: 'var(--bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' },
  image: { width: '100%', height: '160px', objectFit: 'cover', cursor: 'pointer' },
  body: { padding: '1rem' },
  category: { fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  title: { fontSize: '0.98rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--text-h)', lineHeight: 1.4, cursor: 'pointer' },
  instructor: { fontSize: '0.8rem', color: 'var(--text)', margin: '0 0 0.75rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' },
  price: { fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-h)' },
  actions: { display: 'flex', gap: '0.5rem' },
  viewBtn: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-h)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  removeBtn: { padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
};
