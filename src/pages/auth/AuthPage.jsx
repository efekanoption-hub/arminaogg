import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Lock, User, KeyRound, Phone, Calendar, Ruler, Weight, Award, Camera, ShieldCheck, ArrowRight } from 'lucide-react'

const STEPS = {
    CHOICE: 'choice',
    LOGIN: 'login',
    REGISTER: 'register'
}

const pageTransition = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.98 },
    transition: { type: 'spring', stiffness: 300, damping: 25 }
}

export default function AuthPage() {
    const [step, setStep] = useState(STEPS.CHOICE)
    const [loading, setLoading] = useState(false)
    const [secretClicks, setSecretClicks] = useState(0)

    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    const [form, setForm] = useState({
        full_name: '', email: '', password: '', password2: '',
        tc_no: '', phone: '', birth_date: '', height: '', weight: '', certificate: '',
    })

    const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
        if (error) {
            showToast(error.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : error.message, 'error')
        } else {
            showToast('Giriş yapılıyor...', 'success')
            // Let AuthContext pick up the change
        }
        setLoading(false)
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (form.password !== form.password2) { showToast('Şifreler eşleşmiyor!', 'error'); return }
        if (form.tc_no.length !== 11 || !/^\d+$/.test(form.tc_no)) { showToast('TC Kimlik No 11 haneli olmalıdır!', 'error'); return }

        setLoading(true)
        // 1. Hesap yaratılır, bu aşamada supabase arkaplanda onAuthStateChange tetikleyip App.jsx'i re-render edebilir.
        const { data, error } = await supabase.auth.signUp({
            email: form.email, password: form.password, options: { emailRedirectTo: window.location.origin }
        })

        if (error) { showToast(error.message, 'error'); setLoading(false); return }
        const userId = data.user?.id
        if (!userId) { showToast('Kullanıcı oluşturulamadı.', 'error'); setLoading(false); return }

        // 2. AuthContext "user's" profilini çektiğinde veriyi boş bulmasın diye Profile Upsert ediyoruz
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId, full_name: form.full_name, tc_no: form.tc_no, phone: form.phone,
            birth_date: form.birth_date || null, height: form.height ? parseInt(form.height) : null,
            weight: form.weight ? parseInt(form.weight) : null, certificate: form.certificate, role: 'personel',
        })

        if (profileError) {
            showToast('Profil kaydedilemedi: ' + profileError.message, 'error');
            setLoading(false);
            return
        }

        showToast('Hesap oluşturuldu! Sisteme yönlendiriliyorsunuz...', 'success')

        // 3. Race-condition ve React state/memory leak'i engellemek için Hard-Reload yapıyoruz. 
        // Sayfa tekrar açıldığında AuthContext önce user'ı bulacak sonra kusursuz şekilde profile'i okuyacak.
        setTimeout(() => {
            window.location.href = '/'
        }, 500)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="animated-bg" />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>

                {/* Logo Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 40 }}
                >
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(59,130,246,0.05))',
                        border: '1px solid rgba(59,130,246,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', boxShadow: '0 0 50px rgba(59,130,246,0.2)',
                    }}>
                        <ShieldCheck size={40} color="#60a5fa" strokeWidth={1.5} />
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px' }}>ARMİNA</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4, letterSpacing: '0.5px' }}>
                        Operasyon Sistemi
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* CHOICE */}
                    {step === STEPS.CHOICE && (
                        <motion.div key="choice" className="glass-strong" style={{ padding: 36 }} {...pageTransition}>
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Hoş Geldiniz</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 32 }}>Sisteme erişmek için devam edin.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <button className="btn-primary" onClick={() => setStep(STEPS.LOGIN)}>
                                    <Lock size={18} /> Giriş Yap
                                </button>
                                <button className="btn-outline" onClick={() => setStep(STEPS.REGISTER)}>
                                    <User size={18} /> Yeni Personel Kaydı
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* LOGIN */}
                    {step === STEPS.LOGIN && (
                        <motion.div key="login" className="glass-strong" style={{ padding: 36 }} {...pageTransition}>
                            <button
                                onClick={() => setStep(STEPS.CHOICE)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}
                            >
                                <ArrowLeft size={16} /> Geri Dön
                            </button>

                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28 }}>Giriş Yap</h2>

                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input className="input-field" type="email" placeholder="E-posta adresiniz" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                                </div>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input className="input-field" type="password" placeholder="Şifreniz" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                </div>

                                <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 12 }}>
                                    {loading ? 'Yükleniyor...' : <><ArrowRight size={18} /> Sisteme Gir</>}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* REGISTER */}
                    {step === STEPS.REGISTER && (
                        <motion.div key="register" className="glass-strong" style={{ padding: 32 }} {...pageTransition}>
                            <button onClick={() => setStep(STEPS.CHOICE)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500 }}>
                                <ArrowLeft size={16} /> Geri Dön
                            </button>

                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Kayıt Ol</h2>
                            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Lütfen kişisel bilgilerinizi eksiksiz doldurun.</p>

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Field icon={<User size={18} />} name="full_name" placeholder="Ad Soyad" value={form.full_name} onChange={handleFormChange} required />
                                <Field icon={<KeyRound size={18} />} name="tc_no" placeholder="TC Kimlik No (11 Hane)" value={form.tc_no} onChange={handleFormChange} maxLength={11} required />
                                <Field icon={<Mail size={18} />} name="email" type="email" placeholder="E-posta Adresi" value={form.email} onChange={handleFormChange} required />
                                <Field icon={<Phone size={18} />} name="phone" placeholder="Telefon Numarası" value={form.phone} onChange={handleFormChange} />
                                <Field icon={<Calendar size={18} />} name="birth_date" type="date" value={form.birth_date} onChange={handleFormChange} />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <Field icon={<Ruler size={18} />} name="height" type="number" placeholder="Boy (cm)" value={form.height} onChange={handleFormChange} />
                                    <Field icon={<Weight size={18} />} name="weight" type="number" placeholder="Kilo (kg)" value={form.weight} onChange={handleFormChange} />
                                </div>

                                <Field icon={<Award size={18} />} name="certificate" placeholder="Sertifika Bilgisi" value={form.certificate} onChange={handleFormChange} />
                                <Field icon={<Lock size={18} />} name="password" type="password" placeholder="Şifre" value={form.password} onChange={handleFormChange} required />
                                <Field icon={<Lock size={18} />} name="password2" type="password" placeholder="Şifre Tekrar" value={form.password2} onChange={handleFormChange} required />

                                <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                                    {loading ? 'Kayıt Yapılıyor...' : <><User size={18} /> Hesabı Oluştur</>}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Secret Admin Entry Trigger */}
                <div
                    onClick={() => {
                        const newClicks = secretClicks + 1
                        setSecretClicks(newClicks)
                        if (newClicks >= 3) {
                            window.location.hash = '#admin'
                            setSecretClicks(0)
                        }
                    }}
                    style={{
                        textAlign: 'center', marginTop: 40, fontSize: 12, fontWeight: 500,
                        color: 'rgba(255,255,255,0.1)', cursor: 'default', userSelect: 'none'
                    }}
                >
                    &copy; 2026 ARMİNA GÜVENLİK
                </div>
            </div>
        </div>
    )
}

const Field = ({ icon, name, type = 'text', placeholder, value, onChange, required, maxLength }) => (
    <div className="input-wrapper">
        <div className="input-icon" style={{ left: 14 }}>{icon}</div>
        <input
            className="input-field" style={{ paddingLeft: 42 }}
            type={type} name={name} placeholder={placeholder}
            value={value} onChange={onChange} required={required} maxLength={maxLength}
        />
    </div>
)
