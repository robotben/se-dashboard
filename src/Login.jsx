import { useState } from 'react';

const PASSWORD = 'VimeoP0w3r!';

export default function Login({ onSuccess }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0E12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter Tight', sans-serif",
    }}>
      <div style={{
        backgroundColor: '#141A20',
        border: '1px solid #28313A',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{
          color: '#17D5FF',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '16px',
        }}>
          Vimeo SE Analytics
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 800, color: '#FAFCFD' }}>
          Sign in
        </h1>
        <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: '#3D4751' }}>
          Enter the password to access the dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{
              backgroundColor: '#0A0E12',
              border: `1px solid ${error ? '#FF5757' : '#28313A'}`,
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#FAFCFD',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ fontSize: '12px', color: '#FF5757' }}>
              Incorrect password. Try again.
            </div>
          )}
          <button
            type="submit"
            style={{
              backgroundColor: '#17D5FF',
              color: '#0A0E12',
              border: 'none',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
