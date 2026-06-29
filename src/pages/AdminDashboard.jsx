import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsersApi, lockUserApi, unlockUserApi, deactivateUserApi, updateUserApi } from '../api/admin';
import { getAdminOverviewApi } from '../api/reports';

const ROLE_LABELS = { ADMIN: 'Admin', INSTRUCTOR: 'Instructor', STUDENT: 'Estudiante' };
const ROLE_COLORS = {
  ADMIN:      { bg: '#fef2f2', fg: '#dc2626' },
  INSTRUCTOR: { bg: 'rgba(170,59,255,0.1)', fg: '#aa3bff' },
  STUDENT:    { bg: '#eff6ff', fg: '#2563eb' },
};

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] ?? ROLE_COLORS.STUDENT;
  return (
    <span style={{ background: c.bg, color: c.fg, borderRadius: 999, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function StatusBadge({ isLocked, isActive }) {
  if (!isActive)  return <span style={badge('#fef2f2','#dc2626')}>Desactivado</span>;
  if (isLocked)   return <span style={badge('#fef9c3','#ca8a04')}>Baneado</span>;
  return              <span style={badge('#dcfce7','#16a34a')}>Activo</span>;
}
const badge = (bg, fg) => ({ background: bg, color: fg, borderRadius: 999, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 });

// ── Modal confirmación ────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }) {
  return (
    <div style={ov.overlay}>
      <div style={ov.box}>
        <h3 style={{ ...ov.title, color: danger ? '#dc2626' : 'var(--text-h)' }}>{title}</h3>
        <p style={ov.msg}>{message}</p>
        <div style={ov.row}>
          <button onClick={onClose} style={ov.cancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...ov.confirm, background: danger ? '#dc2626' : 'var(--accent)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
const ov = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  box: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  title: { margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 },
  msg: { color: 'var(--text)', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.5 },
  row: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancel: { padding: '0.55rem 1.1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', color: 'var(--text-h)', cursor: 'pointer', fontWeight: 500 },
  confirm: { padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 700 },
};

// ── Modal cambio de rol ───────────────────────────────────────
function RoleModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await updateUserApi(user.id, { role });
      onSaved({ ...user, role });
      onClose();
    } catch { /* silent */ } finally { setLoading(false); }
  };

  return (
    <div style={ov.overlay}>
      <div style={ov.box}>
        <h3 style={{ ...ov.title, color: 'var(--text-h)' }}>Cambiar rol — {user.name}</h3>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', background: 'var(--bg)', color: 'var(--text-h)' }}>
          <option value="STUDENT">Estudiante</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <div style={ov.row}>
          <button onClick={onClose} style={ov.cancel}>Cancelar</button>
          <button onClick={save} disabled={loading} style={{ ...ov.confirm, background: 'var(--accent)' }}>{loading ? '...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Panel de reporte general de la plataforma ───────────────────
function OverviewPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminOverviewApi()
      .then(setData)
      .catch(() => setError('No se pudo cargar el reporte general.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text)' }}>Cargando reporte...</p>;
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!data) return null;

  const rows = [
    { icon: '🎓', label: 'Estudiantes', value: data.totalStudents },
    { icon: '👨‍🏫', label: 'Instructores', value: data.totalInstructors },
    { icon: '🛡️', label: 'Administradores', value: data.totalAdmins },
    { icon: '📚', label: 'Cursos publicados', value: data.totalPublishedCourses },
    { icon: '✅', label: 'Inscripciones activas', value: data.totalActiveEnrollments },
    { icon: '💰', label: 'Ingresos de la plataforma', value: `$${Number(data.totalPlatformRevenue ?? 0).toFixed(2)}` },
  ];

  return (
    <div>
      <div style={{ ...s.statsRow, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {rows.map(r => (
          <div key={r.label} style={s.statCard}>
            <span style={s.statIcon}>{r.icon}</span>
            <span style={{ ...s.statValue, color: 'var(--text-h)' }}>{r.value}</span>
            <span style={s.statLabel}>{r.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.75rem' }}>
        <RankList title="🏆 Cursos con más inscripciones" items={data.topCoursesByEnrollments} valueKey="enrollments" valueSuffix=" inscritos" />
        <RankList title="💵 Cursos con más ingresos" items={data.topCoursesByRevenue} valueKey="revenue" valuePrefix="$" />
      </div>
    </div>
  );
}

function RankList({ title, items, valueKey, valuePrefix = '', valueSuffix = '' }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div style={s.table}>
      <div style={s.tableHead}><span>{title}</span></div>
      {list.length === 0 ? (
        <p style={{ padding: '1.25rem', color: 'var(--text)', fontSize: '0.875rem' }}>Sin datos aún.</p>
      ) : (
        list.map((c, i) => (
          <div key={c.courseId} style={{ ...s.tableRow, justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-h)', fontSize: '0.875rem' }}>{i + 1}. {c.courseTitle}</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text)' }}>{c.instructorName}</p>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
              {valuePrefix}{Number(c[valueKey]).toLocaleString()}{valueSuffix}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user: me } = useAuth();
  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');   // all | active | banned | inactive
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null);    // { type, user }
  const [roleModal, setRoleModal] = useState(null);
  const [toast, setToast]       = useState('');
  const [tab, setTab]           = useState('usuarios'); // usuarios | reporte

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    getAllUsersApi()
      .then(data => { setUsers(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = users;
    if (search) list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'active')   list = list.filter(u => u.isActive && !u.isLocked);
    if (filter === 'banned')   list = list.filter(u => u.isLocked);
    if (filter === 'inactive') list = list.filter(u => !u.isActive);
    setFiltered(list);
  }, [search, filter, users]);

  const updateLocal = (id, patch) => setUsers(us => us.map(u => u.id === id ? { ...u, ...patch } : u));

  const handleBan = async (u) => {
    try {
      await lockUserApi(u.id);
      updateLocal(u.id, { isLocked: true });
      showToast(`🔒 ${u.name} baneado`);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message ?? 'Error')); }
    setConfirm(null);
  };

  const handleUnban = async (u) => {
    try {
      await unlockUserApi(u.id);
      updateLocal(u.id, { isLocked: false, failedLoginAttempts: 0 });
      showToast(`✅ ${u.name} desbaneado`);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message ?? 'Error')); }
    setConfirm(null);
  };

  const handleDeactivate = async (u) => {
    try {
      await deactivateUserApi(u.id);
      updateLocal(u.id, { isActive: false });
      showToast(`🗑 ${u.name} desactivado`);
    } catch (e) { showToast('❌ ' + (e.response?.data?.message ?? 'Error')); }
    setConfirm(null);
  };

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.isActive && !u.isLocked).length,
    banned:   users.filter(u => u.isLocked).length,
    inactive: users.filter(u => !u.isActive).length,
  };

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}

      {/* Modales */}
      {confirm?.type === 'ban' && (
        <ConfirmModal
          title="Banear usuario"
          message={`¿Seguro que quieres banear a ${confirm.user.name}? No podrá iniciar sesión hasta que lo desbanees.`}
          confirmLabel="Banear"
          danger
          onConfirm={() => handleBan(confirm.user)}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'unban' && (
        <ConfirmModal
          title="Desbanear usuario"
          message={`¿Deseas restaurar el acceso de ${confirm.user.name}?`}
          confirmLabel="Desbanear"
          onConfirm={() => handleUnban(confirm.user)}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'deactivate' && (
        <ConfirmModal
          title="Desactivar usuario"
          message={`¿Seguro que quieres desactivar a ${confirm.user.name}? Esta acción es difícil de revertir.`}
          confirmLabel="Desactivar"
          danger
          onConfirm={() => handleDeactivate(confirm.user)}
          onClose={() => setConfirm(null)}
        />
      )}
      {roleModal && (
        <RoleModal
          user={roleModal}
          onClose={() => setRoleModal(null)}
          onSaved={(updated) => { updateLocal(updated.id, { role: updated.role }); showToast(`✅ Rol actualizado`); }}
        />
      )}

      {/* Hero */}
      <section style={s.hero}>
        <div>
          <p style={s.heroSub}>Panel de administrador</p>
          <h1 style={s.heroName}>Gestión de usuarios</h1>
          <p style={s.heroDesc}>Controla el acceso y roles de todos los miembros de la plataforma.</p>
        </div>
        <span style={{ fontSize: '3.5rem' }}>🛡️</span>
      </section>

      {/* Tabs */}
      <div style={s.tabsRow}>
        <button onClick={() => setTab('usuarios')} style={{ ...s.tabBtn, ...(tab === 'usuarios' ? s.tabBtnActive : {}) }}>👥 Usuarios</button>
        <button onClick={() => setTab('reporte')} style={{ ...s.tabBtn, ...(tab === 'reporte' ? s.tabBtnActive : {}) }}>📊 Reporte general</button>
      </div>

      {tab === 'reporte' ? (
        <OverviewPanel />
      ) : (
        <>
          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: 'Total usuarios', value: stats.total, icon: '👥', color: '' },
              { label: 'Activos', value: stats.active, icon: '✅', color: '#16a34a' },
              { label: 'Baneados', value: stats.banned, icon: '🔒', color: '#ca8a04' },
              { label: 'Desactivados', value: stats.inactive, icon: '❌', color: '#dc2626' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={s.statIcon}>{st.icon}</span>
                <span style={{ ...s.statValue, color: st.color || 'var(--text-h)' }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div style={s.toolbar}>
            <input
              style={s.search}
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={s.filterRow}>
              {['all', 'active', 'banned', 'inactive'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }}
                >
                  {{ all: 'Todos', active: 'Activos', banned: 'Baneados', inactive: 'Inactivos' }[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <p style={{ color: 'var(--text)' }}>Cargando usuarios...</p>
          ) : (
            <div style={s.table}>
              <div style={s.tableHead}>
                <span style={{ flex: 3 }}>Usuario</span>
                <span style={{ flex: 1 }}>Rol</span>
                <span style={{ flex: 1 }}>Estado</span>
                <span style={{ flex: 2 }}>Acciones</span>
              </div>
              {filtered.length === 0 && <p style={{ padding: '1.5rem', color: 'var(--text)', fontSize: '0.875rem' }}>Sin resultados.</p>}
              {filtered.map(u => (
                <div key={u.id} style={{ ...s.tableRow, ...(u.isLocked ? s.rowBanned : {}) }}>
                  {/* Info */}
                  <div style={{ flex: 3 }}>
                    <div style={s.userInfo}>
                      <div style={s.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p style={s.userName}>
                          {u.name}
                          {u.id === me?.id && <span style={s.meTag}> (tú)</span>}
                        </p>
                        <p style={s.userEmail}>{u.email}</p>
                      </div>
                    </div>
                  </div>
                  <span style={{ flex: 1 }}><RoleBadge role={u.role} /></span>
                  <span style={{ flex: 1 }}><StatusBadge isLocked={u.isLocked} isActive={u.isActive} /></span>

                  {/* Acciones */}
                  <div style={{ flex: 2, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {u.id !== me?.id && u.isActive && (
                      <>
                        <button onClick={() => setRoleModal(u)} style={s.actionBtn}>Rol</button>
                        {u.isLocked
                          ? <button onClick={() => setConfirm({ type: 'unban', user: u })} style={{ ...s.actionBtn, ...s.btnGreen }}>Desbanear</button>
                          : <button onClick={() => setConfirm({ type: 'ban', user: u })} style={{ ...s.actionBtn, ...s.btnOrange }}>Banear</button>
                        }
                        <button onClick={() => setConfirm({ type: 'deactivate', user: u })} style={{ ...s.actionBtn, ...s.btnRed }}>Desactivar</button>
                      </>
                    )}
                    {u.id === me?.id && <span style={{ fontSize: '0.78rem', color: 'var(--text)' }}>Tu cuenta</span>}
                    {!u.isActive && <span style={{ fontSize: '0.78rem', color: '#dc2626' }}>Desactivado</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans)', textAlign: 'left' },
  tabsRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' },
  tabBtn: { padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', background: 'transparent', color: 'var(--text)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  tabBtnActive: { background: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1a1a1a', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem', zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, transparent 70%)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '20px', padding: '2rem 2.5rem', marginBottom: '2rem' },
  heroSub: { fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.2rem' },
  heroName: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 0.3rem', letterSpacing: '-0.5px' },
  heroDesc: { fontSize: '0.9rem', color: 'var(--text)', margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' },
  statCard: { border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'var(--bg)' },
  statIcon: { fontSize: '1.3rem' },
  statValue: { fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 },
  statLabel: { fontSize: '0.75rem', color: 'var(--text)' },
  toolbar: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },
  search: { flex: 1, minWidth: '200px', padding: '0.6rem 0.85rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--bg)', color: 'var(--text-h)' },
  filterRow: { display: 'flex', gap: '0.4rem' },
  filterBtn: { padding: '0.45rem 0.85rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 },
  filterBtnActive: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
  table: { border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' },
  tableHead: { display: 'flex', padding: '0.75rem 1.25rem', background: 'var(--code-bg)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', gap: '0.75rem' },
  rowBanned: { background: 'rgba(234,179,8,0.04)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, border: '1px solid var(--accent-border)' },
  userName: { fontWeight: 600, color: 'var(--text-h)', fontSize: '0.875rem', margin: '0 0 0.1rem' },
  userEmail: { fontSize: '0.75rem', color: 'var(--text)', margin: 0 },
  meTag: { fontWeight: 400, color: 'var(--accent)', fontSize: '0.75rem' },
  actionBtn: { padding: '0.32rem 0.65rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', color: 'var(--text-h)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 },
  btnGreen:  { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' },
  btnOrange: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
  btnRed:    { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
};