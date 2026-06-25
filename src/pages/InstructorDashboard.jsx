import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const MOCK_INSTRUCTOR_DATA = {
  stats: {
    totalStudents: 2130,
    totalCourses: 2,
    monthRevenue: 847.50,
    avgRating: 4.75,
  },
  courses: [
    {
      id: 'uuid-course-001',
      title: 'Desarrollo Web con React',
      students: 1240,
      rating: 4.8,
      revenue: 2180.50,
      isPublished: true,
      thumbnailUrl: 'https://placehold.co/80x50/3b82f6/ffffff?text=React',
    },
    {
      id: 'uuid-course-006',
      title: 'Node.js y Express',
      students: 890,
      rating: 4.7,
      revenue: 1560.20,
      isPublished: true,
      thumbnailUrl: 'https://placehold.co/80x50/0f766e/ffffff?text=Node.js',
    },
  ],
  revenueByMonth: [
    { month: 'Ene', amount: 620 },
    { month: 'Feb', amount: 740 },
    { month: 'Mar', amount: 690 },
    { month: 'Abr', amount: 810 },
    { month: 'May', amount: 847 },
  ],
};

function StatCard({ icon, label, value, color, prefix, suffix }) {
  return (
    <div style={{ ...statStyles.card, borderTop: '3px solid ' + color }}>
      <span style={statStyles.icon}>{icon}</span>
      <div>
        <div style={statStyles.value}>{prefix}{value}{suffix}</div>
        <div style={statStyles.label}>{label}</div>
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div style={chartStyles.container}>
      {data.map((item, i) => (
        <div key={i} style={chartStyles.barGroup}>
          <span style={chartStyles.amount}>${item.amount}</span>
          <div style={chartStyles.barWrap}>
            <div style={{
              ...chartStyles.bar,
              height: Math.round((item.amount / max) * 120) + 'px',
            }} />
          </div>
          <span style={chartStyles.label}>{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = MOCK_INSTRUCTOR_DATA;

  return (
    <DashboardLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Dashboard Instructor</h1>
          <button
            onClick={() => navigate('/instructor/courses/new')}
            style={styles.createBtn}
          >
            + Crear nuevo curso
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="👥" label="Total estudiantes" value={data.stats.totalStudents.toLocaleString()} color="#2563eb" />
          <StatCard icon="📚" label="Cursos publicados" value={data.stats.totalCourses} color="#16a34a" />
          <StatCard icon="💰" label="Ingresos este mes" value={data.stats.monthRevenue.toFixed(2)} color="#f59e0b" prefix="$" />
          <StatCard icon="⭐" label="Calificación promedio" value={data.stats.avgRating} color="#9333ea" />
        </div>

        <div style={styles.grid}>
          {/* Mis cursos */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Mis cursos</h2>
              <button
                onClick={() => navigate('/instructor/courses')}
                style={styles.linkBtn}
              >
                Ver todos →
              </button>
            </div>

            <div style={styles.courseList}>
              {data.courses.map(course => (
                <div key={course.id} style={styles.courseRow}>
                  <img src={course.thumbnailUrl} alt={course.title} style={styles.thumb} />
                  <div style={styles.courseInfo}>
                    <p style={styles.courseTitle}>{course.title}</p>
                    <div style={styles.courseMeta}>
                      <span>👥 {course.students.toLocaleString()}</span>
                      <span>⭐ {course.rating}</span>
                      <span>💰 ${course.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={styles.courseActions}>
                    <span style={{
                      ...styles.statusBadge,
                      background: course.isPublished ? '#dcfce7' : '#fef9c3',
                      color: course.isPublished ? '#16a34a' : '#a16207',
                    }}>
                      {course.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                    <button
                      onClick={() => navigate('/courses/' + course.id)}
                      style={styles.editBtn}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfica de ingresos */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Ingresos por mes</h2>
            <RevenueChart data={data.revenueByMonth} />
            <div style={styles.revenueTotal}>
              <span style={styles.revenueTotalLabel}>Total acumulado</span>
              <span style={styles.revenueTotalValue}>
                ${data.revenueByMonth.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: { maxWidth: '960px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#0f172a' },
  createBtn: { padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, margin: 0, color: '#0f172a' },
  linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem' },
  courseList: { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  courseRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' },
  thumb: { width: '72px', height: '45px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
  courseInfo: { flex: 1, minWidth: 0 },
  courseTitle: { fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.3rem 0', color: '#0f172a' },
  courseMeta: { display: 'flex', gap: '0.75rem', fontSize: '0.775rem', color: '#64748b' },
  courseActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 },
  statusBadge: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  editBtn: { padding: '0.3rem 0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.775rem', color: '#475569' },
  revenueTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' },
  revenueTotalLabel: { fontSize: '0.875rem', color: '#64748b' },
  revenueTotalValue: { fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' },
};

const statStyles = {
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  icon: { fontSize: '1.75rem' },
  value: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 },
  label: { fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' },
};

const chartStyles = {
  container: { display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '160px', padding: '0.5rem 0' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.25rem' },
  amount: { fontSize: '0.65rem', color: '#94a3b8' },
  barWrap: { display: 'flex', alignItems: 'flex-end', height: '120px' },
  bar: { width: '32px', background: '#2563eb', borderRadius: '4px 4px 0 0', minHeight: '8px' },
  label: { fontSize: '0.75rem', color: '#64748b' },
};