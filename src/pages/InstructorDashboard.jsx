import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getMyCoursesApi,
  createCourseApi,
  createModuleApi,
  createLessonApi,
  publishCourseApi,
} from '../api/courses';

// ── Utilidades ────────────────────────────────────────────────
const CONTENT_TYPES = ['VIDEO', 'PDF', 'QUIZ'];

function Badge({ text, color }) {
  const colors = {
    green:  { bg: '#dcfce7', fg: '#16a34a' },
    yellow: { bg: '#fef9c3', fg: '#ca8a04' },
    blue:   { bg: 'rgba(170,59,255,0.12)', fg: '#aa3bff' },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <span style={{ background: c.bg, color: c.fg, borderRadius: 999, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {text}
    </span>
  );
}

// ── Modal creación de curso ───────────────────────────────────
function CreateCourseModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1: curso, 2: módulos y lecciones
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', durationHours: '', thumbnailUrl: '' });
  const [modules, setModules] = useState([]);               // [{ title, lessons: [{title, contentType, contentUrl}] }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Paso 1: crear el curso
  const handleCreateCourse = async () => {
    if (!form.title || !form.price) { setError('Título y precio son obligatorios.'); return; }
    setError(''); setLoading(true);
    try {
      const created = await createCourseApi({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        durationHours: form.durationHours ? parseInt(form.durationHours) : null,
        thumbnailUrl: form.thumbnailUrl || null,
      });
      setCourse(created);
      setModules([{ title: '', lessons: [{ title: '', contentType: 'VIDEO', contentUrl: '' }] }]);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al crear el curso.');
    } finally { setLoading(false); }
  };

  // Paso 2: guardar módulos y lecciones
  const handleSaveStructure = async () => {
    setError(''); setLoading(true);
    try {
      for (const mod of modules) {
        if (!mod.title.trim()) continue;
        const createdMod = await createModuleApi(course.id, { title: mod.title });
        for (const les of mod.lessons) {
          if (!les.title.trim()) continue;
          await createLessonApi(createdMod.id, {
            title: les.title,
            contentType: les.contentType,
            contentUrl: les.contentUrl || null,
          });
        }
      }
      onCreated(course);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al guardar la estructura.');
    } finally { setLoading(false); }
  };

  // Helpers para módulos / lecciones
  const addModule = () => setModules(m => [...m, { title: '', lessons: [{ title: '', contentType: 'VIDEO', contentUrl: '' }] }]);
  const setModTitle = (i, v) => setModules(m => m.map((x, j) => j === i ? { ...x, title: v } : x));
  const addLesson = (mi) => setModules(m => m.map((x, j) => j === mi ? { ...x, lessons: [...x.lessons, { title: '', contentType: 'VIDEO', contentUrl: '' }] } : x));
  const setLesson = (mi, li, k, v) => setModules(m => m.map((x, j) => j !== mi ? x : {
    ...x, lessons: x.lessons.map((l, k2) => k2 !== li ? l : { ...l, [k]: v })
  }));
  const removeLesson = (mi, li) => setModules(m => m.map((x, j) => j !== mi ? x : { ...x, lessons: x.lessons.filter((_, k) => k !== li) }));

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        {/* Header */}
        <div style={m.header}>
          <div>
            <p style={m.stepLabel}>Paso {step} de 2</p>
            <h2 style={m.title}>{step === 1 ? 'Nuevo curso' : 'Estructura del curso'}</h2>
          </div>
          <button onClick={onClose} style={m.closeBtn}>✕</button>
        </div>

        {/* Progress */}
        <div style={m.progressBar}><div style={{ ...m.progressFill, width: step === 1 ? '50%' : '100%' }} /></div>

        <div style={m.body}>
          {error && <p style={m.error}>{error}</p>}

          {step === 1 && (
            <div style={m.grid2}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={m.label}>Título <span style={m.req}>*</span></label>
                <input style={m.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Java Spring Boot desde Cero" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={m.label}>Descripción</label>
                <textarea style={{ ...m.input, height: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="¿Qué aprenderán los estudiantes?" />
              </div>
              <div>
                <label style={m.label}>Precio (USD) <span style={m.req}>*</span></label>
                <input style={m.input} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="29.99" />
              </div>
              <div>
                <label style={m.label}>Categoría</label>
                <input style={m.input} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Programación" />
              </div>
              <div>
                <label style={m.label}>Duración (horas)</label>
                <input style={m.input} type="number" min="1" value={form.durationHours} onChange={e => set('durationHours', e.target.value)} placeholder="20" />
              </div>
              <div>
                <label style={m.label}>URL de miniatura</label>
                <input style={m.input} value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={m.hint}>Agrega módulos y sus lecciones. Puedes dejarlo vacío y editarlo después.</p>
              {modules.map((mod, mi) => (
                <div key={mi} style={m.moduleCard}>
                  <div style={m.moduleHeader}>
                    <span style={m.moduleNum}>Módulo {mi + 1}</span>
                    <input
                      style={{ ...m.input, flex: 1, marginBottom: 0 }}
                      value={mod.title}
                      onChange={e => setModTitle(mi, e.target.value)}
                      placeholder="Título del módulo"
                    />
                  </div>
                  {mod.lessons.map((les, li) => (
                    <div key={li} style={m.lessonRow}>
                      <input style={{ ...m.input, flex: 2, marginBottom: 0 }} value={les.title} onChange={e => setLesson(mi, li, 'title', e.target.value)} placeholder="Lección" />
                      <select style={{ ...m.input, flex: 1, marginBottom: 0 }} value={les.contentType} onChange={e => setLesson(mi, li, 'contentType', e.target.value)}>
                        {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <input style={{ ...m.input, flex: 2, marginBottom: 0 }} value={les.contentUrl} onChange={e => setLesson(mi, li, 'contentUrl', e.target.value)} placeholder="URL (opcional)" />
                      <button onClick={() => removeLesson(mi, li)} style={m.removeBtn}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => addLesson(mi)} style={m.addLessonBtn}>+ Lección</button>
                </div>
              ))}
              <button onClick={addModule} style={m.addModuleBtn}>+ Agregar módulo</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={m.footer}>
          {step === 2 && <button onClick={() => setStep(1)} style={m.btnSecondary}>← Atrás</button>}
          {step === 1 && <button onClick={handleCreateCourse} disabled={loading} style={m.btnPrimary}>{loading ? 'Creando...' : 'Crear curso →'}</button>}
          {step === 2 && <button onClick={handleSaveStructure} disabled={loading} style={m.btnPrimary}>{loading ? 'Guardando...' : 'Guardar y terminar'}</button>}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────
export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    getMyCoursesApi()
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async (courseId) => {
    setPublishing(courseId);
    try {
      await publishCourseApi(courseId);
      setCourses(cs => cs.map(c => c.courseId === courseId ? { ...c, isPublished: true } : c));
      showToast('✅ Curso publicado exitosamente');
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message ?? 'No se pudo publicar'));
    } finally { setPublishing(null); }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Instructor';

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}

      {/* Modal */}
      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => { setCourses(cs => [{ ...c, courseId: c.courseId ?? c.id }, ...cs]); showToast('✅ Curso creado'); }}
        />
      )}

      {/* Hero */}
      <section style={s.hero}>
        <div>
          <p style={s.heroSub}>Panel de instructor</p>
          <h1 style={s.heroName}>Hola, {firstName} 👋</h1>
          <p style={s.heroDesc}>Gestiona tus cursos y crea nuevo contenido.</p>
        </div>
        <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ Nuevo curso</button>
      </section>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { icon: '📚', label: 'Cursos totales', value: courses.length },
          { icon: '✅', label: 'Publicados', value: courses.filter(c => c.isPublished).length },
          { icon: '🔒', label: 'Borradores', value: courses.filter(c => !c.isPublished).length },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <span style={s.statValue}>{stat.value}</span>
            <span style={s.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabla de cursos */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Mis cursos</h2>
        {loading ? (
          <p style={s.empty}>Cargando...</p>
        ) : courses.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <p>Aún no tienes cursos. ¡Crea el primero!</p>
            <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ Nuevo curso</button>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span style={{ flex: 3 }}>Curso</span>
              <span style={{ flex: 1 }}>Precio</span>
              <span style={{ flex: 1 }}>Estado</span>
              <span style={{ flex: 1 }}>Acciones</span>
            </div>
            {courses.map(course => (
              <div key={course.courseId} style={s.tableRow}>
                <div style={{ flex: 3 }}>
                  <p style={s.courseTitle}>{course.title}</p>
                  <p style={s.courseCategory}>{course.category}</p>
                </div>
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-h)' }}>${course.price}</span>
                <span style={{ flex: 1 }}>
                  <Badge text={course.isPublished ? 'Publicado' : 'Borrador'} color={course.isPublished ? 'green' : 'yellow'} />
                </span>
                <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => navigate(`/courses/${course.courseId}`)} style={s.rowBtn}>Ver</button>
                  {!course.isPublished && (
                    <button
                      onClick={() => handlePublish(course.courseId)}
                      disabled={publishing === course.courseId}
                      style={{ ...s.rowBtn, ...s.rowBtnPublish }}
                    >
                      {publishing === course.courseId ? '...' : 'Publicar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// === EL ARCHIVO ES IGUAL HASTA LOS ESTILOS ===
// (todo el código que pegaste arriba permanece IGUAL)


// ── Estilos ───────────────────────────────────────────────────
const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'system-ui, sans-serif', textAlign: 'left' },

  toast: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: '#111827',
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    zIndex: 999,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  },

  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, transparent 70%)',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    padding: '2rem 2.5rem',
    marginBottom: '2rem',
  },

  heroSub: { fontSize: '0.78rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' },
  heroName: { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  heroDesc: { fontSize: '0.9rem', color: '#6b7280' },

  createBtn: {
    padding: '0.65rem 1.4rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' },

  statCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '1.25rem',
    background: '#ffffff',
  },

  statIcon: { fontSize: '1.4rem' },
  statValue: { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  statLabel: { fontSize: '0.78rem', color: '#6b7280' },

  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#111827' },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '3rem',
    border: '2px dashed #e5e7eb',
    borderRadius: '16px',
    color: '#6b7280',
  },

  section: { marginTop: '0.5rem' },
  empty: { color: '#6b7280', fontSize: '0.9rem', padding: '1rem 0' },

  table: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#ffffff',
    marginTop: '1rem',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.25rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f3f4f6',
  },
  courseTitle: { fontWeight: 600, color: '#111827', fontSize: '0.95rem', margin: 0 },
  courseCategory: { fontSize: '0.78rem', color: '#6b7280', margin: '0.15rem 0 0' },

  rowBtn: {
    padding: '0.4rem 0.85rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  rowBtnPublish: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
  },
};


// ── Estilos del modal (CORREGIDOS) ─────────────────────────────
const m = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },

  modal: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1.5rem',
  },

  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#111827',
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#6b7280',
  },

  body: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    flex: 1,
  },

  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#111827',
  },

  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: '#ffffff',
    color: '#111827',
  },

  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },

  btnPrimary: {
    padding: '0.6rem 1.5rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  btnSecondary: {
    padding: '0.6rem 1.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },

  stepLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 },
  progressBar: { height: '4px', background: '#eef2ff', margin: '0 1.5rem', borderRadius: '999px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#6366f1', borderRadius: '999px', transition: 'width 0.3s' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' },
  req: { color: '#dc2626' },
  error: {
    fontSize: '0.85rem',
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    margin: '0 0 1rem',
  },
  hint: { fontSize: '0.82rem', color: '#6b7280', margin: '0 0 1rem' },
  moduleCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    background: '#fafafa',
  },
  moduleHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' },
  moduleNum: { fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  lessonRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' },
  removeBtn: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '0.45rem 0.6rem',
    fontSize: '0.8rem',
  },
  addLessonBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '0.25rem 0',
  },
  addModuleBtn: {
    width: '100%',
    padding: '0.65rem',
    border: '2px dashed #c7d2fe',
    borderRadius: '10px',
    background: '#eef2ff',
    color: '#4f46e5',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};