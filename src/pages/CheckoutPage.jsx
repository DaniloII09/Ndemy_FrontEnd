import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetailApi, checkoutApi, previewCouponApi } from '../api/courses';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]       = useState(null);
  const [coupon, setCoupon]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Cupón aplicado (preview)
  const [discount, setDiscount]       = useState(null); // { code, discountPercent, originalPrice, discountAmount, finalPrice }
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying]   = useState(false);

  useEffect(() => {
    getCourseDetailApi(id)
      .then(data => {
        if (data.isEnrolled) {
          // ya inscrito, no tiene sentido estar aquí
          navigate(`/courses/${id}`, { replace: true });
          return;
        }
        setCourse(data);
      })
      .catch(() => setError('No se pudo cargar el curso.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleApplyCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;
    setCouponError('');
    setIsApplying(true);
    try {
      const preview = await previewCouponApi(id, code);
      setDiscount(preview);
    } catch (err) {
      setDiscount(null);
      setCouponError(err.response?.data?.message ?? 'Cupón inválido.');
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(null);
    setCoupon('');
    setCouponError('');
  };

  const handlePay = async () => {
    setError('');
    setIsPaying(true);
    try {
      await checkoutApi(id, discount ? discount.code : (coupon.trim() || null));
      setSuccess(true);
      // Espera 2 s y redirige al detalle (ya con acceso)
      setTimeout(() => navigate(`/courses/${id}`), 2000);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al procesar el pago. Intenta de nuevo.';
      setError(msg);
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div style={s.center}>Cargando...</div>;
  if (error && !course) return <div style={s.center}>{error}</div>;
  if (!course) return null;

  if (success) {
    return (
      <div style={s.center}>
        <div style={s.successBox}>
          <span style={s.successIcon}>🎉</span>
          <h2 style={s.successTitle}>¡Pago exitoso!</h2>
          <p style={s.successSub}>Ya tienes acceso a <strong>{course.title}</strong>. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <button onClick={() => navigate(`/courses/${id}`)} style={s.back}>
        ← Volver al curso
      </button>

      <div style={s.layout}>
        {/* Formulario */}
        <div style={s.form}>
          <h1 style={s.heading}>Completa tu compra</h1>
          <p style={s.sub}>Accede al curso de forma inmediata tras el pago.</p>

          {/* Cupón */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Cupón de descuento <span style={s.optional}>(opcional)</span></label>
            <div style={s.couponRow}>
              <input
                type="text"
                value={coupon}
                onChange={e => {
                  setCoupon(e.target.value.toUpperCase());
                  if (discount) setDiscount(null);
                  if (couponError) setCouponError('');
                }}
                placeholder="Ej: NDEMY20"
                style={s.input}
                disabled={!!discount}
              />
              {discount ? (
                <button type="button" onClick={removeCoupon} style={s.couponRemoveBtn}>
                  Quitar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplying || !coupon.trim()}
                  style={{ ...s.couponApplyBtn, ...(isApplying || !coupon.trim() ? s.couponApplyDisabled : {}) }}
                >
                  {isApplying ? '...' : 'Aplicar'}
                </button>
              )}
            </div>
            {couponError && <p style={s.couponErrorMsg}>{couponError}</p>}
            {discount && (
              <p style={s.couponOkMsg}>
                ✅ Cupón {discount.code} aplicado — {discount.discountPercent}% de descuento
              </p>
            )}
          </div>

          {/* Datos de tarjeta — decorativos, el backend no los necesita */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Número de tarjeta</label>
            <input type="text" placeholder="1234 5678 9012 3456" style={s.input} maxLength={19} readOnly />
          </div>

          <div style={s.row2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Vencimiento</label>
              <input type="text" placeholder="MM / AA" style={s.input} readOnly />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>CVC</label>
              <input type="text" placeholder="123" style={s.input} readOnly />
            </div>
          </div>

          <p style={s.disclaimer}>
            🔒 Pago simulado — no se requieren datos reales de tarjeta.
          </p>

          {error && <p style={s.errorMsg}>{error}</p>}

          <button
            onClick={handlePay}
            disabled={isPaying}
            style={{ ...s.payBtn, ...(isPaying ? s.payBtnDisabled : {}) }}
          >
            {isPaying ? 'Procesando...' : `Pagar $${discount ? discount.finalPrice : course.price}`}
          </button>
        </div>

        {/* Resumen */}
        <div style={s.summary}>
          <h2 style={s.summaryTitle}>Resumen</h2>
          <div style={s.summaryCard}>
            <img src={course.thumbnailUrl} alt={course.title} style={s.thumbnail} />
            <div style={s.summaryBody}>
              <p style={s.courseTitle}>{course.title}</p>
              <p style={s.instructor}>por {course.instructorName}</p>

              <hr style={s.divider} />

              <div style={s.priceRow}>
                <span style={s.priceLabel}>Precio</span>
                <span style={{ ...s.priceValue, ...(discount ? s.priceStruck : {}) }}>${course.price}</span>
              </div>
              {discount && (
                <>
                  <div style={s.priceRow}>
                    <span style={s.couponLabel}>Cupón {discount.code} (-{discount.discountPercent}%)</span>
                    <span style={s.discountValue}>− ${discount.discountAmount}</span>
                  </div>
                  <div style={s.priceRow}>
                    <span style={s.totalLabel}>Total</span>
                    <span style={s.priceValue}>${discount.finalPrice}</span>
                  </div>
                </>
              )}

              <hr style={s.divider} />

              <ul style={s.features}>
                <li>⏱ {course.durationHours}h de contenido</li>
                <li>📱 Acceso de por vida</li>
                <li>🏆 Certificado al completar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
    fontFamily: 'var(--sans)',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    fontFamily: 'var(--sans)',
  },
  back: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--accent)',
    fontSize: '0.875rem',
    padding: 0,
    marginBottom: '1.75rem',
    fontWeight: 500,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '2.5rem',
    alignItems: 'start',
    width: '100%',
  },
  // Formulario
  form: { minWidth: 0, textAlign: 'left' },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-h)',
    margin: '0 0 0.35rem',
    letterSpacing: '-0.5px',
  },
  sub: { fontSize: '0.9rem', color: 'var(--text)', margin: '0 0 1.75rem' },
  fieldGroup: { marginBottom: '1.1rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.4rem' },
  optional: { fontWeight: 400, color: 'var(--text)' },
  couponRow: { display: 'flex', gap: '0.5rem' },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    boxSizing: 'border-box',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  disclaimer: {
    fontSize: '0.78rem',
    color: 'var(--text)',
    margin: '0.5rem 0 1.25rem',
    padding: '0.6rem 0.85rem',
    background: 'var(--code-bg)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  errorMsg: {
    fontSize: '0.85rem',
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    margin: '0 0 1rem',
  },
  payBtn: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.9rem 1.5rem',
    background: '#aa3bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
    marginTop: '0.5rem',
    minHeight: '50px',
  },
  payBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  // Resumen
  summary: {},
  summaryTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    margin: '0 0 0.85rem',
  },
  summaryCard: {
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  thumbnail: { width: '100%', height: '170px', objectFit: 'cover', display: 'block' },
  summaryBody: { padding: '1.1rem 1.25rem' },
  courseTitle: { fontWeight: 700, color: 'var(--text-h)', fontSize: '0.95rem', margin: '0 0 0.2rem', lineHeight: 1.4 },
  instructor: { fontSize: '0.8rem', color: 'var(--text)', margin: '0 0 0.75rem' },
  divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
  priceLabel: { fontSize: '0.85rem', color: 'var(--text)' },
  priceValue: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-h)' },
  couponLabel: { fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 },
  couponValue: { fontSize: '0.78rem', color: 'var(--text)' },
  couponApplyBtn: {
    padding: '0 1.1rem',
    background: 'var(--accent, #aa3bff)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  couponApplyDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  couponRemoveBtn: {
    padding: '0 1.1rem',
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  couponErrorMsg: { fontSize: '0.8rem', color: '#dc2626', margin: '0.45rem 0 0' },
  couponOkMsg: { fontSize: '0.8rem', color: '#16a34a', fontWeight: 500, margin: '0.45rem 0 0' },
  priceStruck: { textDecoration: 'line-through', color: 'var(--text)', fontSize: '1rem', fontWeight: 600 },
  discountValue: { fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 },
  totalLabel: { fontSize: '0.85rem', color: 'var(--text-h)', fontWeight: 700 },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: 'var(--text)',
  },
  // Success
  successBox: { textAlign: 'center' },
  successIcon: { fontSize: '3rem', display: 'block', marginBottom: '0.75rem' },
  successTitle: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-h)', margin: '0 0 0.4rem' },
  successSub: { color: 'var(--text)', fontSize: '0.95rem' },
};