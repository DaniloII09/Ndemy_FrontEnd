import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetailApi } from '../api/courses';
import { useAuth } from '../context/AuthContext';

function ModuleAccordion({ module, isEnrolled, onLessonClick }) {
  const [isOpen, setIsOpen] = useState(true);

  const contentTypeIcon = (type) => {
    if (type === 'VIDEO') return '▶';
    if (type === 'PDF') return '📄';
    if (type === 'QUIZ') return '📝';
    return '•';
  };

  return (
    <div style={moduleStyles.container}>
      <button onClick={() => setIsOpen(o => !o)} style={moduleStyles.header}>
        <span style={moduleStyles.headerLeft}>
          <span style={moduleStyles.arrow}>{isOpen ? '▼' : '▶'}</span>
          <span style={moduleStyles.moduleTitle}>{module.title}</span>
        </span>
        <span style={moduleStyles.lessonCount}>{module.lessons.length} lecciones</span>
      </button>

      {isOpen && (
        <div style={moduleStyles.lessonList}>
          {module.lessons.map(lesson => (
            <div
              key={lesson.id}
              onClick={() => isEnrolled && onLessonClick(lesson)}
              style={{
                ...moduleStyles.lesson,
                ...(isEnrolled ? moduleStyles.lessonClickable : moduleStyles.lessonLocked),
              }}
            >
              <span style={moduleStyles.lessonIcon}>{contentTypeIcon(lesson.contentType)}</span>
              <span style={moduleStyles.lessonTitle}>{lesson.title}</span>
              <span style={moduleStyles.lessonMeta}>
                {isEnrolled ? `${lesson.durationMinutes} min` : '🔒'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await getCourseDetailApi(id);
        setCourse(data);
      } catch (err) {
        setError('No se pudo cargar el curso.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleLessonClick = (lesson) => {
    navigate(`/courses/${id}/player`, { state: { lesson, courseTitle: course.title } });
  };

  const handleActionButton = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOwner) {
      // El instructor dueño no compra su curso; lo previsualiza
      const firstLesson = course.modules?.[0]?.lessons?.[0];
      if (firstLesson) handleLessonClick(firstLesson);
      return;
    }
    if (isEnrolled) {
      // Ir a la primera lección
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) handleLessonClick(firstLesson);
    } else {
      navigate(`/courses/${id}/checkout`);
    }
  };

  const getButtonLabel = () => {
    if (!isAuthenticated) return 'Iniciar sesión para comprar';
    if (isOwner) return 'Previsualizar curso';
    if (isEnrolled) return 'Continuar curso';
    return `Comprar — $${course?.price}`;
  };

  const getTotalLessons = () =>
    course?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;

  if (isLoading) return <div style={styles.center}>Cargando curso...</div>;
  if (error) return <div style={styles.center}>{error}</div>;
  if (!course) return null;

  const isEnrolled = isAuthenticated && course.isEnrolled === true;
  const isOwner = isAuthenticated && !!user && course.instructorId === user.id;

  return (
    <div style={styles.page}>
      {/* Botón volver */}
      <button onClick={() => navigate('/courses')} style={styles.backButton}>
        ← Volver al catálogo
      </button>

      <div style={styles.layout}>
        {/* Columna principal */}
        <div style={styles.main}>
          <span style={styles.category}>{course.category}</span>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.instructor}>Instructor: <strong>{course.instructorName}</strong></p>

          <div style={styles.metaRow}>
            <span>⭐ {course.rating}</span>
            <span>· {course.totalStudents?.toLocaleString()} estudiantes</span>
            <span>· {course.durationHours}h de contenido</span>
            <span>· {getTotalLessons()} lecciones</span>
          </div>

          <p style={styles.description}>{course.description}</p>

          {/* Módulos */}
          <h2 style={styles.sectionTitle}>Contenido del curso</h2>
          {course.modules?.map(module => (
            <ModuleAccordion
              key={module.id}
              module={module}
              isEnrolled={isEnrolled}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sideCard}>
            <img src={course.thumbnailUrl} alt={course.title} style={styles.thumbnail} />

            <div style={styles.sideBody}>
              {!isEnrolled && !isOwner && (
                <div style={styles.priceRow}>
                  <span style={styles.price}>${course.price}</span>
                </div>
              )}

              <button onClick={handleActionButton} style={styles.actionButton}>
                {getButtonLabel()}
              </button>

              {isEnrolled && !isOwner && (
                <p style={styles.enrolledBadge}>✅ Ya estás inscrito en este curso</p>
              )}

              {isOwner && (
                <div style={styles.ownerBox}>
                  <p style={styles.ownerTitle}>👨‍🏫 Eres el instructor de este curso</p>
                  <p style={styles.ownerLine}>
                    Estado: {course.isPublished ? '🟢 Publicado' : '🟡 Borrador'}
                  </p>
                  <p style={styles.ownerLine}>
                    Examen final: {course.hasExam ? '✅ Configurado' : '❌ Sin examen (requerido para publicar)'}
                  </p>
                </div>
              )}

              <ul style={styles.featureList}>
                <li>📱 Acceso desde cualquier dispositivo</li>
                <li>⏱ {course.durationHours} horas de contenido</li>
                <li>📋 {getTotalLessons()} lecciones</li>
                {course.hasExam && <li>🎓 Examen final incluido</li>}
                <li>🏆 Certificado al completar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'sans-serif' },
  center: { textAlign: 'center', padding: '4rem', fontFamily: 'sans-serif', color: '#666' },
  backButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '0.9rem', marginBottom: '1.5rem', padding: 0 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' },
  main: { minWidth: 0 },
  category: { fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  title: { fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0', color: '#1a1a1a', lineHeight: 1.3 },
  instructor: { color: '#555', margin: '0 0 0.75rem 0', fontSize: '0.9rem' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.875rem', color: '#666', marginBottom: '1.25rem' },
  description: { fontSize: '0.95rem', lineHeight: 1.7, color: '#444', marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#1a1a1a' },
  sidebar: { position: 'sticky', top: '1.5rem' },
  sideCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid #f0f0f0' },
  thumbnail: { width: '100%', height: '190px', objectFit: 'cover' },
  sideBody: { padding: '1.25rem' },
  priceRow: { marginBottom: '0.75rem' },
  price: { fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a' },
  actionButton: { width: '100%', padding: '0.85rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' },
  enrolledBadge: { fontSize: '0.85rem', color: '#16a34a', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 },
  ownerBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem 0.9rem', marginBottom: '1rem' },
  ownerTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.4rem' },
  ownerLine: { fontSize: '0.8rem', color: '#555', margin: '0.2rem 0' },
  featureList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#555' },
};

const moduleStyles = {
  container: { border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.75rem', overflow: 'hidden' },
  header: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: '#f9fafb', border: 'none', cursor: 'pointer', textAlign: 'left' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  arrow: { fontSize: '0.7rem', color: '#666' },
  moduleTitle: { fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a' },
  lessonCount: { fontSize: '0.8rem', color: '#888' },
  lessonList: { borderTop: '1px solid #e5e7eb' },
  lesson: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' },
  lessonClickable: { cursor: 'pointer', color: '#1a1a1a' },
  lessonLocked: { cursor: 'default', color: '#999' },
  lessonIcon: { fontSize: '0.8rem', width: '16px', textAlign: 'center', flexShrink: 0 },
  lessonTitle: { flex: 1 },
  lessonMeta: { fontSize: '0.8rem', color: '#888', flexShrink: 0 },
};