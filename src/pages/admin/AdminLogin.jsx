import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import { motion } from 'framer-motion'
import { Crown, Mail, Lock, ShieldAlert } from 'lucide-react'

export default function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        if (password !== 'arminaadmin1') {
            showToast('Admin şifresi yanlış!', 'error'); return
        }
        setLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: 'arminaadmin1' })
        if (error) {
            showToast(error.message, 'error')
            setLoading(false)
            return
        }

        const { data: profileData } = await supabase
            .from('profiles').select('role').eq('id', data.user.id).single()

        if (profileData?.role !== 'admin') {
            await supabase.auth.signOut()
            showToast('Bu hesabın admin yetkisi yok!', 'error')
            setLoading(false)
            return
        }

        showToast('Admin paneline hoş geldiniz!', 'success')
        onLogin()
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div className="animated-bg admin-bg" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ width: '100%', maxWidth: 460 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.05))',
                        border: '1px solid rgba(168,85,247,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', boxShadow: '0 0 50px rgba(168,85,247,0.3)',
                    }}>
                        <Crown size={36} color="#c084fc" strokeWidth={1.5} />
                    </div>
                    <h1 className="gradient-text-admin" style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px' }}>
                        YÖNETİM MODELİ
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginTop: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Güvenlik Yönetim Paneli
                    </p>
                </div>

                <div className="glass-strong" style={{ padding: 40 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Giriş Yap</h2>
                    <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Sadece yetkilendirilmiş personel erişebilir.</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                className="input-field input-field-admin"
                                style={{ paddingLeft: 46 }}
                                type="email"
                                placeholder="Admin E-Posta"
                                value={email} onChange={e => setEmail(e.target.value)} required
                            />
                        </div>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                className="input-field input-field-admin"
                                style={{ paddingLeft: 46 }}
                                type="password"
                                placeholder="Özel Şifre"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                        </div>

                        <button className="btn-admin" type="submit" disabled={loading} style={{ marginTop: 12 }}>
                            {loading ? 'Bağlanıyor...' : <><Crown size={18} /> Güvenli Giriş</>}
                        </button>
                    </form>

                    <div style={{
                        marginTop: 32, padding: '16px', borderRadius: 16,
                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', gap: 12
                    }}>
                        <ShieldAlert size={24} color="#f87171" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.5 }}>
                            Yüksek güvenlik protokolü devrede. Tüm giriş denemeleri kayıt altına alınır.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
