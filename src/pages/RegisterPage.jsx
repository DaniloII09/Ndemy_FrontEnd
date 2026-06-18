import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerApi(name, email, password);
      login(data);
      // Nuestro registro siempre crea STUDENT
      navigate('/student/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || '';
      if (message.toLowerCase().includes('email')) {
        setError('Este email ya está registrado. Intenta iniciar sesión.');
      } else {
        setError('Error al registrarse. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Ndemy</h1>
        <h2 style={styles.subtitle}>Crear cuenta</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: '0 0 4px 0', fontSize: '1.8rem', color: '#1a1a1a' },
  subtitle: { margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#666', fontWeight: 400 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#333' },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
  },
  error: {
    background: '#fff0f0',
    color: '#c0392b',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    margin: 0,
  },
  button: {
    padding: '0.75rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  link: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#666' },
};