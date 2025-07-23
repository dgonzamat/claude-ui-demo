import React, { useState } from 'react';

export default function SimpleLoginApp() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin') {
      setLogged(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setLogged(false);
    setUser('');
    setPass('');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f8fb' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
        {logged ? (
          <>
            <h2 style={{ color: '#003366', marginBottom: 24 }}>¡Bienvenido, admin!</h2>
            <button onClick={handleLogout} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#003366', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cerrar sesión</button>
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <h2 style={{ color: '#003366', marginBottom: 24 }}>Iniciar sesión</h2>
            <input
              type="text"
              placeholder="Usuario"
              value={user}
              onChange={e => setUser(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 14, borderRadius: 6, border: '1px solid #e0e3e8', fontSize: 16 }}
              autoFocus
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 18, borderRadius: 6, border: '1px solid #e0e3e8', fontSize: 16 }}
            />
            {error && <div style={{ color: '#b00', marginBottom: 12 }}>{error}</div>}
            <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 6, border: 'none', background: '#003366', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Acceder</button>
          </form>
        )}
      </div>
    </div>
  );
} 