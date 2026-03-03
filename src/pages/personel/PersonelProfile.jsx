import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../components/Toast'
import { motion } from 'framer-motion'
import { User, LogOut, Save, Edit2, Phone, Calendar, Ruler, Weight, Award, ShieldAlert, ShieldCheck, Mail, Fingerprint, Crown } from 'lucide-react'

export default function PersonelProfile() {
    const { profile, refreshProfile, signOut } = useAuth()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        full_name: profile?.full_name || '', phone: profile?.phone || '',
        birth_date: profile?.birth_date || '', height: profile?.height || '',
        weight: profile?.weight || '', certificate: profile?.certificate || '',
    })


    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile?.full_name || '', phone: profile?.phone || '',
                birth_date: profile?.birth_date || '', height: profile?.height || '',
                weight: profile?.weight || '', certificate: profile?.certificate || '',
            })
        }
    }, [profile, editing])

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSave = async () => {
        setLoading(true)
        const { error } = await supabase.from('profiles').update({
            full_name: form.full_name, phone: form.phone, birth_date: form.birth_date || null,
            height: form.height ? parseInt(form.height) : null, weight: form.weight ? parseInt(form.weight) : null,
            certificate: form.certificate,
        }).eq('id', profile.id)

        if (error) { showToast('Güncelleme başarısız: ' + error.message, 'error') }
        else { showToast('Profil güncellendi!', 'success'); await refreshProfile(); setEditing(false) }
        setLoading(false)
    }

    const infoItems = [
        { label: 'E-posta', value: profile?.email || '—', icon: <Mail size={18} /> },
        { label: 'TC Kimlik No', value: profile?.tc_no, icon: <Fingerprint size={18} /> },
        { label: 'Telefon', value: profile?.phone || '—', icon: <Phone size={18} /> },
        { label: 'Doğum Tarihi', value: profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('tr-TR') : '—', icon: <Calendar size={18} /> },
        { label: 'Boy', value: profile?.height ? profile.height + ' cm' : '—', icon: <Ruler size={18} /> },
        { label: 'Kilo', value: profile?.weight ? profile.weight + ' kg' : '—', icon: <Weight size={18} /> },
        { label: 'Sertifika', value: profile?.certificate || '—', icon: <Award size={18} /> },
    ]

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 110 }}>
            {/* Profile Header */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, transparent 100%)',
                padding: '50px 20px 30px', borderBottom: '1px solid rgba(59,130,246,0.1)',
                textAlign: 'center', position: 'relative'
            }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{
                        width: 100, height: 100, borderRadius: '30px',
                        background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 10px 40px rgba(59,130,246,0.4)',
                        border: '2px solid rgba(255,255,255,0.2)', rotate: '5deg'
                    }}>
                    <motion.div style={{ rotate: '-5deg' }}>
                        <User size={46} color="#fff" strokeWidth={1.5} />
                    </motion.div>
                </motion.div>

                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>{profile?.full_name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    <span className="badge badge-info" style={{ padding: '6px 14px' }}>
                        {profile?.role === 'admin' ? <><Crown size={14} /> Yönetici</> : <><ShieldCheck size={14} /> Saha Görevlisi</>}
                    </span>
                    <span className={`badge ${profile?.qr_code_id ? 'badge-success' : 'badge-danger'}`} style={{ padding: '6px 14px' }}>
                        {profile?.qr_code_id ? <><ShieldCheck size={14} /> QR Onaylı</> : <><ShieldAlert size={14} /> QR Bekliyor</>}
                    </span>
                </div>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
                {!editing ? (
                    <motion.div className="glass-strong" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 32, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Kişisel Dosya</h2>
                            <button onClick={() => setEditing(true)} style={{
                                background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
                                padding: '8px 16px', borderRadius: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <Edit2 size={14} /> Düzenle
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            {infoItems.map((item) => (
                                <div key={item.label} style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', borderRadius: 16,
                                    background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.03)',
                                }}>
                                    <div style={{ color: '#94a3b8' }}>{item.icon}</div>
                                    <div>
                                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.label}</p>
                                        <p style={{ fontSize: 16, fontWeight: 600, marginTop: 4, letterSpacing: '0.3px' }}>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div className="glass-strong" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 32, marginBottom: 24, border: '1px solid rgba(59,130,246,0.3)' }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Dosya Güncellemesi</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {[
                                { label: 'Ad Soyad', name: 'full_name', type: 'text', icon: <User size={18} /> },
                                { label: 'Telefon Numarası', name: 'phone', type: 'tel', icon: <Phone size={18} /> },
                                { label: 'Doğum Tarihi', name: 'birth_date', type: 'date', icon: <Calendar size={18} /> },
                                { label: 'Fiziki Boy (cm)', name: 'height', type: 'number', icon: <Ruler size={18} /> },
                                { label: 'Vücut Ağırlığı (kg)', name: 'weight', type: 'number', icon: <Weight size={18} /> },
                                { label: 'Sertifika No', name: 'certificate', type: 'text', icon: <Award size={18} /> },
                            ].map(field => (
                                <div key={field.name} className="input-wrapper">
                                    <div className="input-icon" style={{ left: 16, zIndex: 10 }}>{field.icon}</div>
                                    <input
                                        className="input-field" style={{ paddingLeft: 46 }}
                                        type={field.type} name={field.name} placeholder={field.label}
                                        value={form[field.name]} onChange={handleChange}
                                    />
                                    <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#60a5fa', fontWeight: 600, borderRadius: 4 }}>
                                        {field.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 32 }}>
                            <button className="btn-outline" onClick={() => setEditing(false)} style={{ padding: '16px 0' }}>İptal</button>
                            <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '16px 0' }}>
                                {loading ? 'Kaydediliyor...' : <><Save size={18} /> Değişiklikleri Uygula</>}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Global Action Banner */}
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={signOut}
                    style={{
                        width: '100%', padding: '20px', borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(15,23,42,0.8))',
                        border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5',
                        fontSize: 16, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    <LogOut size={20} /> Sistemden Çıkış Yap
                </motion.button>
            </div>
        </div>
    )
}
