import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import SetupBanner from './components/SetupBanner'
import LoadingScreen from './components/LoadingScreen'
import AuthPage from './pages/auth/AuthPage'
import QRVerifyPage from './pages/auth/QRVerifyPage'
import PersonelLayout from './pages/personel/PersonelLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPanel from './pages/admin/AdminPanel'

export default function App() {
  const { user, profile, loading, isAdmin, signOut, configured } = useAuth()
  const [adminMode, setAdminMode] = useState(false)

  useEffect(() => {
    // Check hash for admin portal
    if (window.location.hash === '#admin') setAdminMode(true)

    const handleHash = () => {
      setAdminMode(window.location.hash === '#admin')
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  if (!configured) return <SetupBanner />

  if (loading) return <LoadingScreen />

  if (adminMode) {
    if (isAdmin) {
      return <AdminPanel onSignOut={signOut} />
    }
    return <AdminLogin onLogin={() => { }} />
  }

  if (!user) {
    return <AuthPage />
  }

  // Profile is missing even though user exists
  if (!profile && !loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Kritik Profil Hatası</h2>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Hesap bilgileriniz veri tabanına kaydedilemedi veya engellendi.</p>
        <button className="btn-primary" onClick={signOut} style={{ margin: '0 auto' }}>Sistemden Çıkış Yap</button>
      </div>
    )
  }

  // Ensure personnel complete QR verification
  if (profile.role === 'personel' && !profile.qr_code_id) {
    return <QRVerifyPage />
  }

  return <PersonelLayout />
}
