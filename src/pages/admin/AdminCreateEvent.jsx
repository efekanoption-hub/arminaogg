import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import { motion } from 'framer-motion'
import { PenTool, Calendar, Clock, MapPin, AlignLeft, Send, CheckCircle2 } from 'lucide-react'

export default function AdminCreateEvent({ onCreated }) {
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', description: '' })
    const [loading, setLoading] = useState(false)
    const [sendNotif, setSendNotif] = useState(true)

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const dateTime = form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : new Date(form.date).toISOString()

        const { data, error } = await supabase.from('events').insert({
            title: form.title, date: dateTime, location: form.location, description: form.description, status: 'aktif',
        }).select().single()

        if (error) { showToast('Etkinlik oluşturulamadı: ' + error.message, 'error'); setLoading(false); return }
        showToast('🚀 Operasyon Kaydedildi!', 'success')

        if (sendNotif && data) {
            try {
                await supabase.functions.invoke('send-notification', {
                    body: { title: '🛡️ Yeni Görev: ' + form.title, body: `📍 ${form.location} | 📅 ${new Date(dateTime).toLocaleDateString('tr-TR')}`, event_id: data.id }
                })
                showToast('Telsiz çağrısı (Push Notif) tüm birimlere geçildi!', 'success')
            } catch (err) { }
        }

        setForm({ title: '', date: '', time: '', location: '', description: '' })
        if (onCreated) onCreated()
        setLoading(false)
    }

    return (
        <div className="glass-strong" style={{ padding: 40, borderTop: '4px solid #a78bfa' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <PenTool color="#c084fc" /> Operasyon Emri Oluştur
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Sahadaki güvenlik personeline iletilecek görev emrini hazırlayın.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div className="input-wrapper">
                    <AlignLeft className="input-icon" size={20} />
                    <input className="input-field input-field-admin" style={{ paddingLeft: 46 }} name="title" placeholder="Operasyon Adı (Örn: Galatasaray - Fenerbahçe Derbisi)" value={form.title} onChange={handleChange} required />
                    <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Operasyon Adı</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="input-wrapper">
                        <Calendar className="input-icon" size={20} />
                        <input className="input-field input-field-admin" style={{ paddingLeft: 46 }} type="date" name="date" value={form.date} onChange={handleChange} required />
                        <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Tarih</div>
                    </div>
                    <div className="input-wrapper">
                        <Clock className="input-icon" size={20} />
                        <input className="input-field input-field-admin" style={{ paddingLeft: 46 }} type="time" name="time" value={form.time} onChange={handleChange} />
                        <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Saat</div>
                    </div>
                </div>

                <div className="input-wrapper">
                    <MapPin className="input-icon" size={20} />
                    <input className="input-field input-field-admin" style={{ paddingLeft: 46 }} name="location" placeholder="Mekan / Konum" value={form.location} onChange={handleChange} />
                    <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Konum</div>
                </div>

                <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                    <AlignLeft className="input-icon" size={20} style={{ top: 16 }} />
                    <textarea className="input-field input-field-admin" style={{ paddingLeft: 46, paddingTop: 16 }} name="description" placeholder="Ekipmanlar, toplanma yeri, özel talimatlar..." value={form.description} onChange={handleChange} rows={4} />
                    <div style={{ position: 'absolute', top: -10, left: 16, background: '#0f172a', padding: '0 6px', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Operasyon Detayı</div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setSendNotif(n => !n)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: '16px',
                        background: sendNotif ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${sendNotif ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer', transition: 'all 0.3s'
                    }}>
                    <div style={{ width: 28, height: 28, borderRadius: '8px', background: sendNotif ? 'linear-gradient(135deg, #7c3aed, #c084fc)' : 'transparent', border: sendNotif ? 'none' : '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sendNotif && <CheckCircle2 size={18} color="#fff" />}
                    </div>
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: sendNotif ? '#e9d5ff' : '#f8fafc' }}>Acil Telsiz Çağrısı (Push Notification)</p>
                        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Görev oluşturulduğu an personelin telefonuna bildirim yolla.</p>
                    </div>
                </motion.div>

                <button className="btn-admin" type="submit" disabled={loading} style={{ width: '100%', padding: '20px', fontSize: 16 }}>
                    {loading ? 'Sisteme İşleniyor...' : <><Send size={20} /> Emri Yayımla</>}
                </button>
            </form>
        </div>
    )
}
