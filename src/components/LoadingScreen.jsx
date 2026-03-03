export const LoadingScreen = ({ text = 'Yükleniyor...' }) => (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'var(--color-bg-deep)',
    }}>
        <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 0 30px rgba(59,130,246,0.4)',
        }}>🛡️</div>
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{text}</p>
    </div>
)
