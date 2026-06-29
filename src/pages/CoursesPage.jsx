import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesApi } from '../api/courses';
import { MOCK_CATEGORIES } from '../api/mockData';

function CourseCard({ course, onClick }) {
  return (
    <div onClick={onClick} style={cardStyles.card}>
      <img src={course.thumbnailUrl} alt={course.title} style={cardStyles.image} />
      <div style={cardStyles.body}>
        <span style={cardStyles.category}>{course.category}</span>
        <h3 style={cardStyles.title}>{course.title}</h3>
        <p style={cardStyles.instructor}>por {course.instructorName}</p>
        <p style={cardStyles.description}>{course.description}</p>
        <div style={cardStyles.footer}>
          <div style={cardStyles.meta}>
            <span style={cardStyles.rating}>⭐ {course.rating != null ? course.rating : 'Nuevo'}</span>
            <span style={cardStyles.students}>· {(course.totalStudents ?? 0).toLocaleString()} estudiantes</span>
          </div>
          <span style={cardStyles.price}>${course.price}</span>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const navigate = useNavigate();

  // Debounce: el texto de búsqueda se aplica solo (no hace falta presionar "Buscar")
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Carga de cursos: corre en el montaje y cada vez que cambia un filtro.
  // Usa un guard para descartar respuestas obsoletas (evita parpadeos/vacíos).
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getCoursesApi({ search, category, page })
      .then(data => {
        if (!active) return;
        setCourses(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 0);
      })
      .catch(err => {
        if (!active) return;
        console.error('Error cargando cursos:', err);
        setCourses([]);
        setTotalPages(0);
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [search, category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const handleCategory = (value) => {
    setCategory(value);
    setPage(0);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>Explora nuestros cursos</h1>
        <p style={styles.subheading}>Aprende a tu ritmo con los mejores instructores</p>
      </div>

      {/* Búsqueda y filtros */}
      <div style={styles.controls}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar cursos..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>Buscar</button>
        </form>

        <div style={styles.categories}>
          {MOCK_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategory(cat.value)}
              style={{
                ...styles.catButton,
                ...(category === cat.value ? styles.catButtonActive : {}),
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cursos */}
      {isLoading ? (
        <div style={styles.loading}>Cargando cursos...</div>
      ) : courses.length === 0 ? (
        <div style={styles.empty}>No se encontraron cursos.</div>
      ) : (
        <div style={styles.grid}>
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            style={styles.pageButton}
          >
            ← Anterior
          </button>
          <span style={styles.pageInfo}>Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            style={styles.pageButton}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'sans-serif' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  heading: { fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1a1a' },
  subheading: { fontSize: '1rem', color: '#666', margin: 0 },
  controls: { marginBottom: '2rem' },
  searchForm: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  searchInput: { flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' },
  searchButton: { padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  categories: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  catButton: { padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: '#444' },
  catButtonActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#666', fontSize: '1rem' },
  empty: { textAlign: 'center', padding: '4rem', color: '#999', fontSize: '1rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  pageButton: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontSize: '0.875rem' },
  pageInfo: { fontSize: '0.875rem', color: '#666' },
};

const cardStyles = {
  card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.15s', border: '1px solid #f0f0f0' },
  image: { width: '100%', height: '180px', objectFit: 'cover' },
  body: { padding: '1rem' },
  category: { fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  title: { fontSize: '1rem', fontWeight: 600, margin: '0.25rem 0', color: '#1a1a1a', lineHeight: 1.4 },
  instructor: { fontSize: '0.8rem', color: '#888', margin: '0 0 0.5rem 0' },
  description: { fontSize: '0.825rem', color: '#666', margin: '0 0 0.75rem 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  meta: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  rating: { fontSize: '0.825rem', fontWeight: 600, color: '#f59e0b' },
  students: { fontSize: '0.75rem', color: '#999' },
  price: { fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' },
};