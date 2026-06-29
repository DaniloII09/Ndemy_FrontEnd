import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetailApi } from '../api/courses';
import { getCourseReviewsApi, createReviewApi, updateReviewApi, deleteReviewApi } from '../api/reviews';
import { getWishlistApi, addToWishlistApi, removeFromWishlistApi } from '../api/wishlist';
import { useAuth } from '../context/AuthContext';

function Stars({ value = 0, size = '1rem', onSelect = null }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={onSelect ? () => onSelect(n) : undefined}
          style={{
            fontSize: size,
            color: n <= value ? '#f59e0b' : '#d1d5db',
            cursor: onSelect ? 'pointer' : 'default',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

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

  // Reseñas
  const [reviews, setReviews] = useState([]);
  const [rForm, setRForm] = useState({ rating: 0, comment: '' });
  const [rSubmitting, setRSubmitting] = useState(false);
  const [rError, setRError] = useState('');
  const [editingReview, setEditingReview] = useState(false);

  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const loadReviews = () => {
    getCourseReviewsApi(id)
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  };

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
    loadReviews();
  }, [id]);

  // Verifica si el curso ya está en la wishlist del estudiante autenticado
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STUDENT') return;
    let active = true;
    getWishlistApi()
      .then(list => {
        if (!active) return;
        setInWishlist(Array.isArray(list) && list.some(c => c.id === id));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [id, isAuthenticated, user?.role]);

  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlistApi(id);
        setInWishlist(false);
      } else {
        await addToWishlistApi(id);
        setInWishlist(true);
      }
    } catch {
      // si el backend dice que ya estaba o no estaba, sincronizamos el estado visual igual
      setInWishlist(v => !v);
    } finally {
      setWishlistLoading(false);
    }
  };

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

  const myReview = user ? reviews.find(r => r.studentId === user.id) : null;
  const canReview = isEnrolled && user?.role === 'STUDENT';

  const startEdit = () => {
    setEditingReview(true);
    setRForm({ rating: myReview.rating, comment: myReview.comment ?? '' });
    setRError('');
  };

  const submitReview = async () => {
    setRError('');
    if (!rForm.rating) { setRError('Selecciona una calificación de 1 a 5 estrellas.'); return; }
    setRSubmitting(true);
    try {
      if (myReview && editingReview) {
        await updateReviewApi(myReview.id, { rating: rForm.rating, comment: rForm.comment });
      } else {
        await createReviewApi(id, { rating: rForm.rating, comment: rForm.comment });
      }
      setRForm({ rating: 0, comment: '' });
      setEditingReview(false);
      loadReviews();
      // refresca el rating promedio del curso
      getCourseDetailApi(id).then(setCourse).catch(() => {});
    } catch (e) {
      setRError(e.response?.data?.message ?? 'No se pudo guardar la reseña.');
    } finally {
      setRSubmitting(false);
    }
  };

  const removeReview = async () => {
    if (!myReview) return;
    setRSubmitting(true);
    try {
      await deleteReviewApi(myReview.id);
      setEditingReview(false);
      setRForm({ rating: 0, comment: '' });
      loadReviews();
      getCourseDetailApi(id).then(setCourse).catch(() => {});
    } catch (e) {
      setRError(e.response?.data?.message ?? 'No se pudo eliminar la reseña.');
    } finally {
      setRSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

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

          {/* Reseñas */}
          <h2 style={{ ...styles.sectionTitle, marginTop: '2.5rem' }}>
            Reseñas {reviews.length > 0 && <span style={styles.reviewCount}>({reviews.length})</span>}
          </h2>

          {/* Formulario / mi reseña */}
          {canReview && (!myReview || editingReview) && (
            <div style={styles.reviewForm}>
              <p style={styles.reviewFormTitle}>
                {editingReview ? 'Edita tu reseña' : '¿Qué te pareció el curso?'}
              </p>
              <Stars value={rForm.rating} size="1.6rem" onSelect={(n) => setRForm(f => ({ ...f, rating: n }))} />
              <textarea
                style={styles.reviewTextarea}
                value={rForm.comment}
                onChange={e => setRForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Comparte tu opinión (opcional)"
              />
              {rError && <p style={styles.reviewError}>{rError}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={styles.reviewSubmit} onClick={submitReview} disabled={rSubmitting}>
                  {rSubmitting ? 'Guardando...' : editingReview ? 'Guardar cambios' : 'Publicar reseña'}
                </button>
                {editingReview && (
                  <button style={styles.reviewCancel} onClick={() => { setEditingReview(false); setRForm({ rating: 0, comment: '' }); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          {canReview && myReview && !editingReview && (
            <div style={styles.myReviewBox}>
              <p style={styles.reviewFormTitle}>Tu reseña</p>
              <Stars value={myReview.rating} />
              {myReview.comment && <p style={styles.reviewComment}>{myReview.comment}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button style={styles.reviewLink} onClick={startEdit}>Editar</button>
                <button style={{ ...styles.reviewLink, color: '#dc2626' }} onClick={removeReview} disabled={rSubmitting}>Eliminar</button>
              </div>
            </div>
          )}

          {isAuthenticated && !isEnrolled && !isOwner && (
            <p style={styles.reviewHint}>Debes inscribirte en el curso para dejar una reseña.</p>
          )}

          {/* Lista de reseñas */}
          {reviews.length === 0 ? (
            <p style={styles.reviewHint}>Este curso aún no tiene reseñas.</p>
          ) : (
            <div style={styles.reviewList}>
              {reviews.map(r => (
                <div key={r.id} style={styles.reviewItem}>
                  <div style={styles.reviewItemHead}>
                    <span style={styles.reviewAuthor}>{r.studentName}</span>
                    <span style={styles.reviewDate}>{formatDate(r.createdAt)}</span>
                  </div>
                  <Stars value={r.rating} size="0.9rem" />
                  {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
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

              {isAuthenticated && user?.role === 'STUDENT' && !isEnrolled && !isOwner && (
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  style={{ ...styles.wishlistButton, ...(inWishlist ? styles.wishlistButtonActive : {}) }}
                >
                  {inWishlist ? '💜 Guardado en tu lista de deseos' : '🤍 Guardar en lista de deseos'}
                </button>
              )}

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
  wishlistButton: { width: '100%', padding: '0.7rem', background: '#fff', color: '#555', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' },
  wishlistButtonActive: { background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff' },
  enrolledBadge: { fontSize: '0.85rem', color: '#16a34a', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 },
  ownerBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem 0.9rem', marginBottom: '1rem' },
  ownerTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.4rem' },
  ownerLine: { fontSize: '0.8rem', color: '#555', margin: '0.2rem 0' },
  reviewCount: { color: '#888', fontWeight: 500, fontSize: '1rem' },
  reviewForm: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' },
  reviewFormTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.6rem' },
  reviewTextarea: { width: '100%', minHeight: '70px', marginTop: '0.75rem', padding: '0.65rem 0.85rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  reviewError: { color: '#dc2626', fontSize: '0.82rem', margin: '0.5rem 0' },
  reviewSubmit: { padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.75rem' },
  reviewCancel: { padding: '0.6rem 1.1rem', background: 'transparent', color: '#555', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.75rem' },
  myReviewBox: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' },
  reviewLink: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 },
  reviewHint: { color: '#888', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  reviewItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' },
  reviewItemHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' },
  reviewAuthor: { fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' },
  reviewDate: { fontSize: '0.78rem', color: '#999' },
  reviewComment: { fontSize: '0.9rem', color: '#444', margin: '0.4rem 0 0', lineHeight: 1.6 },
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