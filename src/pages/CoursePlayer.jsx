// src/pages/CoursePlayer.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getCourseDetailApi } from '../api/courses';

export default function CoursePlayer() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeLesson, setActiveLesson] = useState(location.state?.lesson ?? null);
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    let cancel = false;
    setIsLoading(true);
    getCourseDetailApi(id)
      .then(data => {
        if (cancel) return;
        setCourse(data);
        // Selecciona la lección: la que venía por state (si existe en el curso),
        // o la primera lección disponible.
        const allLessons = (data.modules ?? []).flatMap(m => m.lessons ?? []);
        const fromState = location.state?.lesson
          ? allLessons.find(l => l.id === location.state.lesson.id)
          : null;
        setActiveLesson(fromState ?? allLessons[0] ?? null);
      })
      .catch(() => { if (!cancel) setNotFound(true); })
      .finally(() => { if (!cancel) setIsLoading(false); });
    return () => { cancel = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div style={styles.center}>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div style={styles.center}>
        <p>Curso no encontrado.</p>
        <button onClick={() => navigate('/courses')} style={styles.backBtn}>
          ← Volver al catálogo
        </button>
      </div>
    );
  }

  const allLessons = (course.modules ?? []).flatMap(m => m.lessons ?? []);
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = () => {
    setCompleted(prev => new Set([...prev, activeLesson.id]));
    if (nextLesson) setActiveLesson(nextLesson);
  };

  const progressPercent = Math.round((completed.size / allLessons.length) * 100);

  const renderContent = () => {
    if (!activeLesson) return null;

    if (activeLesson.contentType === 'VIDEO') {
      return (
        <iframe
          src={activeLesson.contentUrl}
          title={activeLesson.title}
          style={styles.video}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    if (activeLesson.contentType === 'PDF') {
      return (
        <div style={styles.pdfContainer}>
          <div style={styles.pdfIcon}>📄</div>
          <h3 style={styles.pdfTitle}>{activeLesson.title}</h3>
          <p style={styles.pdfDesc}>Este es un recurso en formato PDF.</p>
          <a
            href={activeLesson.contentUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.pdfLink}
          >
            Abrir recurso →
          </a>
        </div>
      );
    }

    if (activeLesson.contentType === 'QUIZ') {
      return (
        <div style={styles.pdfContainer}>
          <div style={styles.pdfIcon}>📝</div>
          <h3 style={styles.pdfTitle}>{activeLesson.title}</h3>
          <p style={styles.pdfDesc}>Quiz — próximamente disponible.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button onClick={() => navigate('/courses/' + id)} style={styles.backBtn}>
          ← Volver al curso
        </button>
        <span style={styles.courseTitle}>{course.title}</span>
        <div style={styles.progressWrap}>
          <span style={styles.progressLabel}>{progressPercent}% completado</span>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: progressPercent + '%' }} />
          </div>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.content}>
          <div style={styles.videoWrap}>
            {renderContent()}
          </div>

          <div style={styles.lessonInfo}>
            <h2 style={styles.lessonTitle}>{activeLesson?.title}</h2>
            <div style={styles.lessonMeta}>
              <span style={styles.badge}>{activeLesson?.contentType}</span>
              {activeLesson?.durationMinutes != null && (
                <span style={styles.duration}>⏱ {activeLesson.durationMinutes} min</span>
              )}
            </div>
          </div>

          <div style={styles.navButtons}>
            <button
              onClick={() => prevLesson && setActiveLesson(prevLesson)}
              disabled={!prevLesson}
              style={{ ...styles.navBtn, opacity: prevLesson ? 1 : 0.4 }}
            >
              ← Anterior
            </button>

            <button onClick={handleComplete} style={styles.completeBtn}>
              {completed.has(activeLesson?.id)
                ? '✅ Completada'
                : nextLesson
                ? 'Marcar y continuar →'
                : 'Marcar como completada ✓'}
            </button>

            <button
              onClick={() => nextLesson && setActiveLesson(nextLesson)}
              disabled={!nextLesson}
              style={{ ...styles.navBtn, opacity: nextLesson ? 1 : 0.4 }}
            >
              Siguiente →
            </button>
          </div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Contenido del curso</h3>
          {course.modules.map(module => (
            <div key={module.id} style={styles.module}>
              <p style={styles.moduleName}>{module.title}</p>
              {module.lessons.map(lesson => {
                const isActive = lesson.id === activeLesson?.id;
                const isDone = completed.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      ...styles.lessonItem,
                      ...(isActive ? styles.lessonActive : {}),
                    }}
                  >
                    <span style={styles.lessonCheck}>
                      {isDone ? '✅' : isActive ? '▶' : '○'}
                    </span>
                    <span
                      style={{
                        ...styles.lessonName,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {lesson.title}
                    </span>
                    <span style={styles.lessonMin}>{lesson.durationMinutes != null ? `${lesson.durationMinutes}m` : ''}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#0f0f0f', color: '#fff' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem', background: '#1a1a1a', borderBottom: '1px solid #333', flexShrink: 0 },
  backBtn: { background: 'none', border: '1px solid #555', color: '#ccc', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  courseTitle: { flex: 1, fontSize: '0.95rem', fontWeight: 500, color: '#eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
  progressLabel: { fontSize: '0.8rem', color: '#aaa', whiteSpace: 'nowrap' },
  progressBar: { width: '120px', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#2563eb', borderRadius: '3px', transition: 'width 0.3s' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' },
  content: { display: 'flex', flexDirection: 'column', overflow: 'auto', background: '#111' },
  videoWrap: { background: '#000', aspectRatio: '16/9', width: '100%' },
  video: { width: '100%', height: '100%', border: 'none', display: 'block' },
  pdfContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', gap: '1rem' },
  pdfIcon: { fontSize: '4rem' },
  pdfTitle: { fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: 0 },
  pdfDesc: { color: '#aaa', margin: 0 },
  pdfLink: { padding: '0.6rem 1.5rem', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 },
  lessonInfo: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #222' },
  lessonTitle: { fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#fff' },
  lessonMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  badge: { fontSize: '0.75rem', padding: '2px 8px', background: '#2563eb22', color: '#60a5fa', borderRadius: '4px', border: '1px solid #2563eb44' },
  duration: { fontSize: '0.85rem', color: '#888' },
  navButtons: { display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', alignItems: 'center' },
  navBtn: { padding: '0.6rem 1rem', background: '#222', color: '#ccc', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
  completeBtn: { flex: 1, padding: '0.7rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  sidebar: { background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', overflow: 'auto' },
  sidebarTitle: { fontSize: '0.9rem', fontWeight: 600, padding: '1rem 1rem 0.5rem', margin: 0, color: '#eee', borderBottom: '1px solid #2a2a2a' },
  module: { borderBottom: '1px solid #2a2a2a' },
  moduleName: { fontSize: '0.8rem', fontWeight: 600, color: '#888', padding: '0.75rem 1rem 0.25rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' },
  lessonItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer', borderRadius: '4px', margin: '0 0.25rem' },
  lessonActive: { background: '#2563eb22' },
  lessonCheck: { fontSize: '0.75rem', flexShrink: 0, width: '16px', textAlign: 'center' },
  lessonName: { flex: 1, fontSize: '0.825rem', color: '#ddd', lineHeight: 1.4 },
  lessonMin: { fontSize: '0.75rem', color: '#666', flexShrink: 0 },
};
