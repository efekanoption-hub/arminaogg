import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toast } from './components/Toast'
import { LoadingScreen } from './components/LoadingScreen'
import AuthPage from './pages/auth/AuthPage'
import PersonelLayout from './pages/personel/PersonelLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPanel from './pages/admin/AdminPanel'
import './index.css'

// Setup banner when Supabase is not configured
function SetupBanner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20, flexDirection: 'column', gap: 24,
    }}>
      <div className="animated-bg" />
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 16px',
          boxShadow: '0 0 40px rgba(59,130,246,0.4)',
        }}>🛡️</div>
        <h1 className="gradient-text" style={{ fontSize: 34, fontWeight: 900 }}>ARMİNA</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
          Güvenlik Personel Operasyon Sistemi
        </p>
      </div>

      <div className="glass-strong" style={{ maxWidth: 480, width: '100%', padding: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
        }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>Kurulum Gerekiyor</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Supabase bağlantısı yapılandırılmamış
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
          Bağlantı Adımları
        </h2>

        {[
          {
            step: '1', title: 'Supabase Projesi Oluştur',
            desc: 'supabase.com adresine gidin, yeni proje oluşturun.',
            link: 'https://supabase.com', linkText: 'supabase.com',
          },
          {
            step: '2', title: 'API Bilgilerini Kopyala',
            desc: 'Settings → API → Project URL ve anon key değerlerini kopyalayın.',
          },
          {
            step: '3', title: '.env Dosyasını Düzenle',
            desc: 'Proje kök dizinindeki .env dosyasına değerleri yapıştırın.',
            code: 'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...',
          },
          {
            step: '4', title: 'Veritabanı Tablolarını Oluştur',
            desc: 'Supabase SQL Editor\'a SQL şemasını yapıştırın.',
          },
          {
            step: '5', title: 'Uygulamayı Yeniden Başlat',
            desc: 'npm run dev ile uygulamayı yeniden başlatın.',
            code: 'npm run dev',
          },
        ].map((item) => (
          <div key={item.step} style={{
            display: 'flex', gap: 14, marginBottom: 18,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>{item.step}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: 'var(--color-accent-light)', display: 'block', marginTop: 4 }}>
                  → {item.linkText}
                </a>
              )}
              {item.code && (
                <div style={{
                  marginTop: 8, padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'monospace', fontSize: 12, color: '#a78bfa',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>{item.code}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AppInner() {
  const { user, profile, loading, configured } = useAuth()
  const [adminMode, setAdminMode] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [signOutFn, setSignOutFn] = useState(null)

  const { signOut } = useAuth()

  // Check if admin mode via URL hash
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.includes('admin')) setAdminMode(true)
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  // Auto admin if profile is admin role
  useEffect(() => {
    if (profile?.role === 'admin') {
      setAdminMode(true)
      setAdminAuthenticated(true)
    }
  }, [profile])

  if (!configured) return <SetupBanner />
  if (loading) return <LoadingScreen text="ARMİNA yükleniyor..." />

  if (adminMode) {
    if (!adminAuthenticated) {
      return <AdminLogin onLogin={() => setAdminAuthenticated(true)} />
    }
    return <AdminPanel onSignOut={async () => {
      await signOut()
      setAdminAuthenticated(false)
      setAdminMode(false)
      window.location.hash = ''
    }} />
  }

  if (!user) return <AuthPage />
  return <PersonelLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <Toast />
      <AppInner />
      {/* Hidden admin portal button */}
      <AdminPortalButton />
    </AuthProvider>
  )
}

function AdminPortalButton() {
  return (
    <button
      onClick={() => { window.location.hash = '#admin'; window.location.reload() }}
      title="Admin Paneli"
      style={{
        position: 'fixed', bottom: 110, right: 16,
        width: 34, height: 34, borderRadius: '50%',
        background: 'rgba(139,92,246,0.12)',
        border: '1px solid rgba(139,92,246,0.25)',
        color: '#a78bfa', fontSize: 14,
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        opacity: 0.35, transition: 'opacity 0.3s', zIndex: 98,
      }}
      onMouseOver={e => e.currentTarget.style.opacity = '1'}
      onMouseOut={e => e.currentTarget.style.opacity = '0.35'}
    >
      👑
    </button>
  )
}
