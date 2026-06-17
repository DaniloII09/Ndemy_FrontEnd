import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Página temporal ya que me falta trabajar en f/auth
function Placeholder({ name }) {
  return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h1> NDEMY INICIO </h1>
    <p>Página en construcción</p>
  </div>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder name="Home" />} />
        <Route path="/login" element={<Placeholder name="Login" />} />
        <Route path="/register" element={<Placeholder name="Register" />} />
        <Route path="/courses" element={<Placeholder name="Courses" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}