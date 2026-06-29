import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamApi, submitExamApi } from '../api/exams';

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});   // { questionId: optionId }
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getExamApi(id)
      .then(data => { if (active) setExam(data); })
      .catch(err => {
        if (!active) return;
        setLoadError(err.response?.data?.message ?? 'No se pudo cargar el examen.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [id]);

  const selectOption = (questionId, optionId) =>
    setAnswers(a => ({ ...a, [questionId]: optionId }));

  const allAnswered = exam && exam.questions.every(q => answers[q.id]);

  const handleSubmit = async () => {
    setError('');
    if (!allAnswered) { setError('Responde todas las preguntas antes de enviar.'); return; }
    setSubmitting(true);
    try {
      const payload = exam.questions.map(q => ({ questionId: q.id, optionId: answers[q.id] }));
      const res = await submitExamApi(id, payload);
      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.response?.data?.message ?? 'No se pudo enviar el examen.');
    } finally { setSubmitting(false); }
  };

  if (isLoading) return <div style={s.center}>Cargando examen...</div>;

  if (loadError) {
    return (
      <div style={s.center}>
        <p style={{ marginBottom: '1rem' }}>{loadError}</p>
        <button style={s.secondaryBtn} onClick={() => navigate(`/courses/${id}/player`)}>← Volver al curso</button>
      </div>
    );
  }

  // Pantalla de resultado
  if (result) {
    const passed = result.passed;
    return (
      <div style={s.page}>
        <div style={{ ...s.resultBox, borderColor: passed ? '#16a34a' : '#dc2626' }}>
          <span style={{ fontSize: '3rem' }}>{passed ? '🎉' : '😕'}</span>
          <h1 style={s.resultTitle}>{passed ? '¡Aprobaste!' : 'No alcanzaste la nota'}</h1>
          <p style={s.resultScore}>Tu puntaje: <strong>{Number(result.score)}%</strong></p>

          {passed ? (
            <>
              <p style={s.resultMsg}>Se generó tu certificado. Ya puedes descargarlo.</p>
              <button style={s.primaryBtn} onClick={() => navigate('/certificates')}>Ver mis certificados</button>
            </>
          ) : result.courseReset ? (
            <>
              <p style={s.resultMsg}>
                Agotaste los 3 intentos. El progreso del curso se reinició; deberás
                volver a completar las lecciones para reintentar.
              </p>
              <button style={s.primaryBtn} onClick={() => navigate(`/courses/${id}/player`)}>Volver al curso</button>
            </>
          ) : (
            <>
              <p style={s.resultMsg}>Te quedan <strong>{result.attemptsRemaining}</strong> intento(s).</p>
              <button style={s.primaryBtn} onClick={() => { setResult(null); setAnswers({}); }}>Reintentar</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(`/courses/${id}/player`)}>← Volver al curso</button>
      <h1 style={s.heading}>Examen final</h1>
      <p style={s.sub}>
        Nota mínima para aprobar: <strong>{exam.passingScore}%</strong>
        {exam.timeLimitMinutes ? ` · Tiempo sugerido: ${exam.timeLimitMinutes} min` : ''} ·
        {' '}{exam.questions.length} pregunta(s)
      </p>

      {exam.questions.map((q, qi) => (
        <div key={q.id} style={s.questionCard}>
          <p style={s.questionText}><span style={s.qNum}>{qi + 1}.</span> {q.text}</p>
          <div style={s.options}>
            {q.options.map(o => {
              const selected = answers[q.id] === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => selectOption(q.id, o.id)}
                  style={{ ...s.option, ...(selected ? s.optionSelected : {}) }}
                >
                  <span style={{ ...s.radio, ...(selected ? s.radioOn : {}) }}>{selected ? '●' : '○'}</span>
                  <span>{o.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p style={s.errMsg}>{error}</p>}

      <button style={{ ...s.primaryBtn, ...(submitting ? { opacity: 0.6 } : {}) }} onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar examen'}
      </button>
    </div>
  );
}

const s = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'var(--sans, sans-serif)', textAlign: 'left' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', fontFamily: 'var(--sans, sans-serif)', color: 'var(--text, #6b7280)' },
  backBtn: { background: 'none', border: 'none', color: 'var(--accent, #aa3bff)', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '1.25rem' },
  heading: { fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-h, #111827)', margin: '0 0 0.35rem' },
  sub: { color: 'var(--text, #6b7280)', margin: '0 0 1.75rem', fontSize: '0.9rem' },
  questionCard: { background: 'var(--bg, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' },
  questionText: { fontSize: '1rem', fontWeight: 600, color: 'var(--text-h, #111827)', margin: '0 0 0.9rem', lineHeight: 1.5 },
  qNum: { color: 'var(--accent, #aa3bff)', fontWeight: 800, marginRight: '0.3rem' },
  options: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  option: { display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.7rem 0.9rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '10px', background: 'var(--bg, #fff)', color: 'var(--text-h, #111827)', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' },
  optionSelected: { borderColor: 'var(--accent, #aa3bff)', background: 'rgba(170,59,255,0.08)' },
  radio: { color: '#9ca3af', flexShrink: 0 },
  radioOn: { color: 'var(--accent, #aa3bff)' },
  errMsg: { fontSize: '0.85rem', color: '#dc2626', margin: '0 0 1rem' },
  primaryBtn: { padding: '0.8rem 1.6rem', background: 'var(--accent, #aa3bff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' },
  secondaryBtn: { padding: '0.6rem 1.25rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '10px', background: 'transparent', color: 'var(--text-h, #111827)', cursor: 'pointer' },
  resultBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center', border: '2px solid', borderRadius: '18px', padding: '2.5rem 2rem', background: 'var(--bg, #fff)' },
  resultTitle: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-h, #111827)', margin: '0.25rem 0' },
  resultScore: { fontSize: '1.05rem', color: 'var(--text, #374151)', margin: 0 },
  resultMsg: { color: 'var(--text, #6b7280)', fontSize: '0.92rem', maxWidth: '420px', margin: '0.25rem 0 1rem' },
};
