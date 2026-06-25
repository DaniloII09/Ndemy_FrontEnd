import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Mock de datos del estudiante
const MOCK_STUDENT_DATA = {
  activeCourses: [
    { id: 'uuid-course-001', title: 'Desarrollo Web con React', progress: 35, thumbnailUrl: 'https://placehold.co/120x70/3b82f6/ffffff?text=React', instructor: 'Carlos Instructor' },
    { id: 'uuid-course-002', title: 'Java Spring Boot', progress: 10, thumbnailUrl: 'https://placehold.co/120x70/16a34a/ffffff?text=Spring', instructor: 'María González' },
  ],
  certificates: [
    { id: 'cert-001', courseTitle: 'Introducción a Python', certificateCode: 'NDEMY-2024-001', issuedAt: '2024-03-15' },
  ],
  stats: {
    activeCourses: 2,
    completedCourses: 1,
    certificates: 1,
    hoursLearned: 14,
  },
};

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...statStyles.card, borderTop: '3px solid ' + color }}>
      <span style={statStyles.icon}>{icon}</span>
      <div>
        <div style={statStyles.value}>{value}</div>
        <div style={statStyles.label}>{label}</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = MOCK_STUDENT_DATA;

  return (
    <DashboardLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>¡Hola, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={styles.subheading}>Continúa aprendiendo donde lo dejaste.</p>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="📚" label="Cursos activos" value={data.stats.activeCourses} color="#2563eb" />
          <StatCard icon="✅" label="Completados" value={data.stats.completedCourses} color="#16a34a" />
          <StatCard icon="🏆" label="Certificados" value={data.stats.certificates} color="#f59e0b" />
          <StatCard icon="⏱" label="Horas aprendidas" value={data.stats.hoursLearned} color="#9333ea" />
        </div>

        {/* Cursos activos */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Mis cursos activos</h2>
            <button onClick={() => navigate('/student/my-courses')} style={styles.seeAllBtn}>
              Ver todos →
            </button>
          </div>

          {data.activeCourses.length === 0 ? (
            <div style={styles.empty}>
              <p>No tienes cursos activos.</p>
              <button onClick={() => navigate('/courses')} style={styles.exploreBtn}>
                Explorar cursos
              </button>
            </div>
          ) : (
            <div style={styles.courseList}>
              {data.activeCourses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <img src={course.thumbnailUrl} alt={course.title} style={styles.courseThumb} />
                  <div style={styles.courseInfo}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <p style={styles.courseInstructor}>por {course.instructor}</p>
                    <div style={styles.progressRow}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: course.progress + '%' }} />
                      </div>
                      <span style={styles.progressLabel}>{course.progress}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/courses/' + course.id + '/player')}
                    style={styles.continueBtn}
                  >
                    Continuar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificados */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Mis certificados</h2>
          {data.certificates.length === 0 ? (
            <p style={styles.emptyText}>Aún no tienes certificados. ¡Completa tu primer curso!</p>
          ) : (
            <div style={styles.certList}>
              {data.certificates.map(cert => (
                <div key={cert.id} style={styles.certCard}>
                  <span style={styles.certIcon}>🏆</span>
                  <div>
                    <p style={styles.certTitle}>{cert.courseTitle}</p>
                    <p style={styles.certCode}>Código: {cert.certificateCode}</p>
                    <p style={styles.certDate}>Emitido: {new Date(cert.issuedAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: { maxWidth: '900px' },
  header: { marginBottom: '1.5rem' },
  heading: { fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' },
  subheading: { color: '#64748b', margin: 0, fontSize: '0.95rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#0f172a' },
  seeAllBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  emptyText: { color: '#94a3b8', fontSize: '0.9rem', margin: 0 },
  exploreBtn: { marginTop: '0.75rem', padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  courseList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  courseCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' },
  courseThumb: { width: '100px', height: '60px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
  courseInfo: { flex: 1, minWidth: 0 },
  courseTitle: { fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: '#0f172a' },
  courseInstructor: { fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0' },
  progressRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  progressBar: { flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#2563eb', borderRadius: '3px' },
  progressLabel: { fontSize: '0.75rem', color: '#64748b', flexShrink: 0 },
  continueBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 },
  certList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  certCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' },
  certIcon: { fontSize: '1.75rem', flexShrink: 0 },
  certTitle: { fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: '#0f172a' },
  certCode: { fontSize: '0.8rem', color: '#92400e', margin: '0 0 0.1rem 0' },
  certDate: { fontSize: '0.75rem', color: '#a16207', margin: 0 },
};

const statStyles = {
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  icon: { fontSize: '1.75rem' },
  value: { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 },
  label: { fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' },
};