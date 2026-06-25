import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const MOCK_ADMIN_DATA = {
  stats: {
    totalStudents: 4820,
    totalInstructors: 18,
    totalCourses: 34,
    totalRevenue: 48920.75,
  },
  recentUsers: [
    { id: 'u1', name: 'Ana Martínez', email: 'ana@email.com', role: 'STUDENT', isActive: true, createdAt: '2024-05-10' },
    { id: 'u2', name: 'Pedro López', email: 'pedro@email.com', role: 'INSTRUCTOR', isActive: true, createdAt: '2024-05-08' },
    { id: 'u3', name: 'Laura Gómez', email: 'laura@email.com', role: 'STUDENT', isActive: false, createdAt: '2024-05-06' },
    { id: 'u4', name: 'Carlos Ruiz', email: 'carlos@email.com', role: 'STUDENT', isActive: true, createdAt: '2024-05-05' },
    { id: 'u5', name: 'María Pérez', email: 'maria@email.com', role: 'INSTRUCTOR', isActive: true, createdAt: '2024-05-03' },
  ],
  recentCourses: [
    { id: 'uuid-course-001', title: 'Desarrollo Web con React', instructor: 'Carlos Instructor', students: 1240, isPublished: true },
    { id: 'uuid-course-002', title: 'Java Spring Boot', instructor: 'María González', students: 980, isPublished: true },
    { id: 'uuid-course-003', title: 'Diseño UX/UI con Figma', instructor: 'Sofía Ramírez', students: 760, isPublished: true },
    { id: 'uuid-course-004', title: 'Python para Data Science', instructor: 'Luis Martínez', students: 1540, isPublished: false },
  ],
};

function StatCard({ icon, label, value, color, prefix }) {
  return (
    <div style={{ ...statStyles.card, borderTop: '3px solid ' + color }}>
      <span style={statStyles.icon}>{icon}</span>
      <div>
        <div style={statStyles.value}>{prefix}{value}</div>
        <div style={statStyles.label}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const data = MOCK_ADMIN_DATA;
  const [activeTab, setActiveTab] = useState('users');

  return (
    <DashboardLayout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Panel de Administración</h1>
          <span style={styles.badge}>Admin</span>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="👥" label="Total estudiantes" value={data.stats.totalStudents.toLocaleString()} color="#2563eb" />
          <StatCard icon="🎓" label="Instructores" value={data.stats.totalInstructors} color="#9333ea" />
          <StatCard icon="📚" label="Cursos totales" value={data.stats.totalCourses} color="#16a34a" />
          <StatCard icon="💰" label="Ingresos totales" value={data.stats.totalRevenue.toLocaleString()} color="#f59e0b" prefix="$" />
        </div>

        {/* Tabs */}
        <div style={styles.section}>
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab('users')}
              style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
            >
              👥 Usuarios recientes
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              style={{ ...styles.tab, ...(activeTab === 'courses' ? styles.tabActive : {}) }}
            >
              📚 Cursos
            </button>
          </div>

          {/* Tabla de usuarios */}
          {activeTab === 'users' && (
            <div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Rol</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Registro</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map(user => (
                    <tr key={user.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatar}>
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{user.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.roleBadge,
                          background: user.role === 'ADMIN' ? '#fef3c7' : user.role === 'INSTRUCTOR' ? '#ede9fe' : '#dbeafe',
                          color: user.role === 'ADMIN' ? '#92400e' : user.role === 'INSTRUCTOR' ? '#6d28d9' : '#1d4ed8',
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: user.isActive ? '#dcfce7' : '#fee2e2',
                          color: user.isActive ? '#16a34a' : '#dc2626',
                        }}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionBtn}>
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.tableFooter}>
                <button
                  onClick={() => navigate('/admin/users')}
                  style={styles.seeAllBtn}
                >
                  Ver todos los usuarios →
                </button>
              </div>
            </div>
          )}

          {/* Tabla de cursos */}
          {activeTab === 'courses' && (
            <div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Curso</th>
                    <th style={styles.th}>Instructor</th>
                    <th style={styles.th}>Estudiantes</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCourses.map(course => (
                    <tr key={course.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.courseTitle}>{course.title}</span>
                      </td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{course.instructor}</td>
                      <td style={styles.td}>
                        <span style={styles.studentsCount}>
                          👥 {course.students.toLocaleString()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: course.isPublished ? '#dcfce7' : '#fef9c3',
                          color: course.isPublished ? '#16a34a' : '#a16207',
                        }}>
                          {course.isPublished ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionsRow}>
                          <button
                            onClick={() => navigate('/courses/' + course.id)}
                            style={styles.actionBtn}
                          >
                            Ver
                          </button>
                          <button style={{ ...styles.actionBtn, color: '#dc2626', borderColor: '#fca5a5' }}>
                            {course.isPublished ? 'Despublicar' : 'Publicar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.tableFooter}>
                <button
                  onClick={() => navigate('/admin/courses')}
                  style={styles.seeAllBtn}
                >
                  Ver todos los cursos →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: { maxWidth: '960px' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  heading: { fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#0f172a' },
  badge: { padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  tab: { padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b', borderRadius: '8px' },
  tabActive: { background: '#eff6ff', color: '#2563eb', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f1f5f9' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '0.75rem', fontSize: '0.875rem', color: '#0f172a', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 },
  roleBadge: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  statusBadge: { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  actionBtn: { padding: '0.3rem 0.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.775rem', color: '#475569' },
  actionsRow: { display: 'flex', gap: '0.4rem' },
  courseTitle: { fontWeight: 500 },
  studentsCount: { fontSize: '0.8rem', color: '#64748b' },
  tableFooter: { marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' },
  seeAllBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.875rem' },
};

const statStyles = {
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  icon: { fontSize: '1.75rem' },
  value: { fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 },
  label: { fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' },
};