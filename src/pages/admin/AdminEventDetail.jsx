import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Users, Download, UserCheck, ShieldAlert } from 'lucide-react'

export default function AdminEventDetail({ event, onBack }) {
    const [participants, setParticipants] = useState([])
    const [declined, setDeclined] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchParticipants()
        const channel = supabase.channel(`event-${event.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `event_id=eq.${event.id}` }, () => fetchParticipants())
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [event.id])

    const fetchParticipants = async () => {
        const { data, error } = await supabase.from('applications').select(`*, profiles (full_name, phone, tc_no)`).eq('event_id', event.id)
        if (!error) {
            setParticipants(data?.filter(a => a.status === 'katılıyor') || [])
            setDeclined(data?.filter(a => a.status === 'katılmıyor') || [])
        }
        setLoading(false)
    }

    const exportExcel = () => {
        const rows = participants.map(p => ({
            'Sıra': '', 'Ad Soyad': p.profiles?.full_name || '-', 'TC Kimlik No': p.profiles?.tc_no || '-',
            'Telefon': p.profiles?.phone || '-', 'Onay Zamanı': new Date(p.created_at).toLocaleString('tr-TR'), 'Durum': 'ONAYLI'
        }))
        const ws = XLSX.utils.json_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Kadrolu Saha Personeli')
        ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 15 }]
        XLSX.writeFile(wb, `${event.title.replace(/\s+/g, '_')}_Liste.xlsx`)
        showToast('Excel raporu oluşturuldu!', 'success')
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 12,
                fontSize: 14, fontWeight: 600, marginBottom: 24, transition: 'all 0.2s'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <ArrowLeft size={16} /> Panoya Dön
            </button>

            {/* Header Info */}
            <div className="glass-strong" style={{ padding: 32, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)', filter: 'blur(40px)' }} />

                <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>{event.title}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 16, color: '#f8fafc', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color="#c084fc" /> {formatDate(event.date)}</span>
                    {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} color="#f472b6" /> {event.location}</span>}
                </div>

                {/* Analytic Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginTop: 32 }}>
                    {[
                        { label: 'Onaylayanlar', value: participants.length, color: '#10b981', icon: <UserCheck size={28} /> },
                        { label: 'Reddedenler', value: declined.length, color: '#ef4444', icon: <ShieldAlert size={28} /> },
                        { label: 'Toplam Çağrı', value: participants.length + declined.length, color: '#3b82f6', icon: <Users size={28} /> },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            style={{
                                padding: '24px', borderRadius: '20px',
                                background: `linear-gradient(135deg, rgba(15,23,42,0.8), rgba(${stat.color === '#10b981' ? '16,185,129' : stat.color === '#ef4444' ? '239,68,68' : '59,130,246'}, 0.15))`,
                                border: `1px solid ${stat.color}40`, boxShadow: `0 8px 30px ${stat.color}20`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                            }}>
                            <div style={{ color: stat.color, marginBottom: 16 }}>{stat.icon}</div>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <button className="btn-success" onClick={exportExcel} disabled={participants.length === 0}
                style={{ width: '100%', marginBottom: 32, fontSize: 16, padding: '20px' }}>
                <Download size={20} /> Görev Listesini İndir (XLSX)
            </button>

            {loading ? (
                <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
            ) : (
                <div style={{ display: 'grid', gap: 32 }}>
                    {/* Confirmed List */}
                    <div className="glass-strong" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '24px', background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <CheckCircle size={24} /> ONAYLI PERSONEL GÜCÜ
                            </h3>
                        </div>
                        {participants.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Henüz kayıt alınmadı</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead><tr><th>Sicil / TC</th><th>Personel Adı</th><th>İletişim</th><th>Onay Damgası</th></tr></thead>
                                    <tbody>
                                        {participants.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{p.profiles?.tc_no || '-'}</td>
                                                <td style={{ fontWeight: 700, fontSize: 15 }}>{p.profiles?.full_name || '-'}</td>
                                                <td style={{ fontWeight: 500 }}>{p.profiles?.phone || '-'}</td>
                                                <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(p.created_at).toLocaleString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Declined List */}
                    {declined.length > 0 && (
                        <div className="glass-strong" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '24px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <XCircle size={24} /> REDDEDEN PERSONEL
                                </h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead><tr><th>Sicil / TC</th><th>Personel Adı</th><th>İletişim</th><th>Ret Damgası</th></tr></thead>
                                    <tbody>
                                        {declined.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{p.profiles?.tc_no || '-'}</td>
                                                <td style={{ fontWeight: 700 }}>{p.profiles?.full_name || '-'}</td>
                                                <td>{p.profiles?.phone || '-'}</td>
                                                <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(p.created_at).toLocaleString('tr-TR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
