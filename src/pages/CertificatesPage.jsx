import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCertificatesApi } from '../api/student';
import { buildCertificateSvg, downloadCertificate } from '../utils/certificate';

function svgDataUrl(cert) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildCertificateSvg(cert))}`;
}

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    let active = true;
    getMyCertificatesApi()
      .then(data => { if (active) setCerts(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setCerts([]); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDownload = async (cert) => {
    setDownloading(cert.id);
    try {
      await downloadCertificate(cert);
    } catch {
      // noop
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.heading}>Mis certificados</h1>
        <p style={s.sub}>Descarga el certificado de los cursos que completaste.</p>
      </div>

      {isLoading ? (
        <div style={s.center}>Cargando...</div>
      ) : certs.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: '2.5rem' }}>🏅</span>
          <p>Aún no tienes certificados. Completa un curso y aprueba su examen para obtener el tuyo.</p>
          <button style={s.exploreBtn} onClick={() => navigate('/my-courses')}>Ir a mis cursos</button>
        </div>
      ) : (
        <div style={s.grid}>
          {certs.map(cert => (
            <div key={cert.id} style={s.card}>
              <div style={s.previewWrap}>
                <img src={svgDataUrl(cert)} alt={`Certificado de ${cert.courseTitle}`} style={s.preview} />
              </div>
              <div style={s.body}>
                <h3 style={s.title}>{cert.courseTitle}</h3>
                <p style={s.meta}>Emitido el {formatDate(cert.issuedAt)}</p>
                <p style={s.code}>Código: {cert.certificateCode}</p>
                <button
                  style={s.downloadBtn}
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === cert.id}
                >
                  {downloading === cert.id ? 'Generando...' : '⬇ Descargar certificado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans, sans-serif)', textAlign: 'left' },
  header: { marginBottom: '1.75rem' },
  heading: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-h, #111827)', margin: '0 0 0.25rem' },
  sub: { color: 'var(--text, #6b7280)', margin: 0, fontSize: '0.95rem' },
  center: { textAlign: 'center', padding: '4rem', color: 'var(--text, #6b7280)' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', padding: '4rem 2rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '16px', color: 'var(--text, #6b7280)', textAlign: 'center' },
  exploreBtn: { padding: '0.6rem 1.4rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' },
  card: { background: 'var(--bg, #fff)', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border, #e5e7eb)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  previewWrap: { background: '#0f0d14', padding: '0.5rem' },
  preview: { width: '100%', borderRadius: '6px', display: 'block' },
  body: { padding: '1.1rem 1.25rem' },
  title: { fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem', color: 'var(--text-h, #1a1a1a)' },
  meta: { fontSize: '0.82rem', color: 'var(--text, #6b7280)', margin: '0 0 0.2rem' },
  code: { fontSize: '0.72rem', color: 'var(--text, #9ca3af)', margin: '0 0 0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' },
  downloadBtn: { width: '100%', padding: '0.65rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' },
};
