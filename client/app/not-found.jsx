import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textAlign: 'center',
      padding: '40px 20px',
      color: '#0f172a'
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 800, color: '#0f766e', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '12px 0 8px' }}>Page not found</h2>
      <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '420px', marginBottom: '24px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: '#0f766e',
          color: '#ffffff',
          borderRadius: '10px',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '14px'
        }}
      >
        Return to Home →
      </Link>
    </div>
  );
}

