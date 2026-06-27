import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfileApi, updateMyProfileApi, changePasswordApi } from '../api/profile';

export default function ProfilePage() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Cambio de contraseña
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  useEffect(() => {
    let active = true;
    getMyProfileApi()
      .then(data => {
        if (!active) return;
        setProfile(data);
        setName(data.name ?? '');
        setPhotoUrl(data.photoUrl ?? '');
      })
      .catch(() => { if (active) setErr('No se pudo cargar el perfil.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const syncAuth = (updated) => {
    // Mantiene el Navbar/avatar sincronizados sin tocar tokens
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    login({ accessToken, refreshToken, user: { ...user, ...updated } });
  };

  const handleSave = async () => {
    setMsg(''); setErr('');
    if (!name.trim()) { setErr('El nombre no puede estar vacío.'); return; }
    setSaving(true);
    try {
      const updated = await updateMyProfileApi({ name: name.trim(), photoUrl: photoUrl.trim() || null });
      setProfile(updated);
      syncAuth({ name: updated.name, photoUrl: updated.photoUrl });
      setMsg('✅ Perfil actualizado.');
    } catch (e) {
      setErr(e.response?.data?.message ?? 'No se pudo actualizar el perfil.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwdMsg(''); setPwdErr('');
    if (pwd.newPassword.length < 8) { setPwdErr('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (pwd.newPassword !== pwd.confirm) { setPwdErr('Las contraseñas no coinciden.'); return; }
    setPwdSaving(true);
    try {
      await changePasswordApi({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setPwdMsg('✅ Contraseña actualizada.');
    } catch (e) {
      setPwdErr(e.response?.data?.message ?? 'No se pudo cambiar la contraseña.');
    } finally { setPwdSaving(false); }
  };

  if (isLoading) return <div style={s.center}>Cargando perfil...</div>;

  const initials = (name || profile?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Mi perfil</h1>

      <div style={s.card}>
        <div style={s.avatarRow}>
          {photoUrl ? (
            <img src={photoUrl} alt={name} style={s.avatarImg} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span style={s.avatarInitials}>{initials}</span>
          )}
          <div>
            <p style={s.profileName}>{profile?.name}</p>
            <p style={s.profileEmail}>{profile?.email}</p>
            <span style={s.roleBadge}>{profile?.role}</span>
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Nombre</label>
          <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div style={s.field}>
          <label style={s.label}>URL de foto de perfil</label>
          <input style={s.input} value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." />
        </div>

        {err && <p style={s.errMsg}>{err}</p>}
        {msg && <p style={s.okMsg}>{msg}</p>}

        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Cambiar contraseña</h2>
        <div style={s.field}>
          <label style={s.label}>Contraseña actual</label>
          <input style={s.input} type="password" value={pwd.currentPassword}
            onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Nueva contraseña</label>
          <input style={s.input} type="password" value={pwd.newPassword}
            onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Confirmar nueva contraseña</label>
          <input style={s.input} type="password" value={pwd.confirm}
            onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />
        </div>

        {pwdErr && <p style={s.errMsg}>{pwdErr}</p>}
        {pwdMsg && <p style={s.okMsg}>{pwdMsg}</p>}

        <button style={s.saveBtn} onClick={handleChangePassword} disabled={pwdSaving}>
          {pwdSaving ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans, sans-serif)', textAlign: 'left' },
  center: { textAlign: 'center', padding: '4rem', color: 'var(--text, #6b7280)', fontFamily: 'var(--sans, sans-serif)' },
  heading: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-h, #111827)', margin: '0 0 1.5rem' },
  card: { background: 'var(--bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-h, #111827)', margin: '0 0 1rem' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  avatarImg: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarInitials: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent, #aa3bff)', color: '#fff', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileName: { fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-h, #111827)', margin: '0 0 0.15rem' },
  profileEmail: { fontSize: '0.85rem', color: 'var(--text, #6b7280)', margin: '0 0 0.35rem' },
  roleBadge: { display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'rgba(170,59,255,0.12)', color: 'var(--accent, #aa3bff)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-h, #111827)', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '0.9rem', background: 'var(--bg, #fff)', color: 'var(--text-h, #111827)', boxSizing: 'border-box' },
  errMsg: { fontSize: '0.85rem', color: '#dc2626', margin: '0 0 0.75rem' },
  okMsg: { fontSize: '0.85rem', color: '#16a34a', fontWeight: 500, margin: '0 0 0.75rem' },
  saveBtn: { padding: '0.7rem 1.5rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
};
