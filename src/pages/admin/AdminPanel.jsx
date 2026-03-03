import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import AdminCreateEvent from './AdminCreateEvent'
import AdminEventDetail from './AdminEventDetail'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, PlusCircle, Users, LogOut, Crown, LayoutList, PauseCircle, PlayCircle, Eye, Trash2, Ghost } from 'lucide-react'

const TABS = [
    { id: 'events', label: 'Tüm Görevler', icon: <LayoutList size={18} /> },
    { id: 'create', label: 'Yeni Oluştur', icon: <PlusCircle size={18} /> },
    { id: 'personel', label: 'Personel Takip', icon: <Users size={18} /> },
]

export default function AdminPanel({ onSignOut }) {
    const [activeTab, setActiveTab] = useState('events')
    const [events, setEvents] = useState([])
    const [personel, setPersonel] = useState([])
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEvents()
        fetchPersonel()
    }, [])

    const fetchEvents = async () => {
        const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
        setEvents(data || [])
        setLoading(false)
    }

    const fetchPersonel = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'personel').order('full_name')
        setPersonel(data || [])
    }

    const toggleEventStatus = async (event) => {
        const newStatus = event.status === 'aktif' ? 'pasif' : 'aktif'
        const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id)
        if (!error) { showToast(`Etkinlik ${newStatus === 'aktif' ? 'yayına alındı' : 'donduruldu'}!`, 'success'); fetchEvents() }
    }

    const deleteEvent = async (eventId) => {
        if (!confirm('Bu etkinliği tamamen silmek istediğinize emin misiniz?')) return
        const { error } = await supabase.from('events').delete().eq('id', eventId)
        if (!error) { showToast('Görev sistemden silindi!', 'success'); fetchEvents() }
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', paddingBottom: 60 }}>
            {/* Background */}
            <div className="animated-bg admin-bg" />

            {/* Top Header Layer */}
            <div style={{
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(32px)',
                borderBottom: '1px solid rgba(168,85,247,0.2)', padding: '16px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                    }}>
                        <Crown size={24} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '1px', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ARMİNA</h1>
                        <p style={{ fontSize: 12, color: '#a78bfa', fontWeight: 500, letterSpacing: '0.5px' }}>KOMUTA MERKEZİ</p>
                    </div>
                </div>

                <button onClick={onSignOut} style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5',
                    padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'
                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                    <LogOut size={16} /> Sistemi Kapat
                </button>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                {/* Animated Tabs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 40, overflowX: 'auto', paddingBottom: 10 }}>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedEvent(null); }}
                            style={{
                                position: 'relative', padding: '12px 24px', borderRadius: '16px', fontSize: 15, fontWeight: 600,
                                border: '1px solid', borderColor: activeTab === tab.id ? 'rgba(168,85,247,0.4)' : 'transparent',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                background: activeTab === tab.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                                color: activeTab === tab.id ? '#c084fc' : '#94a3b8', transition: 'color 0.3s'
                            }}>
                            {tab.icon} {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="admintab" style={{
                                    position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)',
                                    width: '60%', height: 3, background: '#c084fc', borderRadius: '4px 4px 0 0',
                                    boxShadow: '0 -2px 15px rgba(168,85,247,0.6)'
                                }} />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* EVENTS */}
                    {activeTab === 'events' && !selectedEvent && (
                        <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 28, fontWeight: 800 }}>Aktif Operasyonlar</h2>
                            </div>

                            {events.length === 0 ? (
                                <div className="glass-strong" style={{ padding: 80, textAlign: 'center', marginTop: 40 }}>
                                    <Ghost size={60} color="#64748b" style={{ margin: '0 auto 20px', opacity: 0.5 }} />
                                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>Sistemde görev bulunmuyor</h3>
                                    <p style={{ color: '#94a3b8', marginTop: 10, fontSize: 15 }}>Tüm birimler şu an beklemede. Yeni bir operasyon başlatabilirsiniz.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {events.map((event, i) => (
                                        <motion.div key={event.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                            className="glass-strong" style={{
                                                padding: '24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
                                                borderLeft: `4px solid ${event.status === 'aktif' ? '#10b981' : '#f59e0b'}`
                                            }}>
                                            <div style={{ flex: 1, minWidth: 240 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>{event.title}</h3>
                                                    <span className={`badge ${event.status === 'aktif' ? 'badge-success' : 'badge-warning'}`}>
                                                        {event.status === 'aktif' ? 'YAYINDA' : 'BEKLEMEDE'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📅 {formatDate(event.date)}</span>
                                                    {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📍 {event.location}</span>}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button onClick={() => setSelectedEvent(event)} className="btn-outline" style={{ padding: '10px 20px', color: '#c084fc' }}>
                                                    <Eye size={16} /> Detay
                                                </button>
                                                <button onClick={() => toggleEventStatus(event)} className="btn-outline" style={{ padding: '10px 20px', color: '#fbbf24' }}>
                                                    {event.status === 'aktif' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                                                    {event.status === 'aktif' ? 'Dondur' : 'Yayına Al'}
                                                </button>
                                                <button onClick={() => deleteEvent(event.id)} className="btn-outline" style={{ padding: '10px 20px', color: '#f87171' }}>
                                                    <Trash2 size={16} /> Sil
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* DETAIL */}
                    {activeTab === 'events' && selectedEvent && (
                        <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <AdminEventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
                        </motion.div>
                    )}

                    {/* CREATE TAB */}
                    {activeTab === 'create' && (
                        <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ maxWidth: 700 }}>
                            <AdminCreateEvent onCreated={() => { fetchEvents(); setActiveTab('events'); }} />
                        </motion.div>
                    )}

                    {/* PERSONNEL TAB */}
                    {activeTab === 'personel' && (
                        <motion.div key="personel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                                <Users size={28} color="#c084fc" />
                                <h2 style={{ fontSize: 26, fontWeight: 800 }}>Kayıtlı Saha Personeli ({personel.length})</h2>
                            </div>

                            <div className="glass-strong" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Sicil No / TC</th>
                                                <th>Ad Soyad</th>
                                                <th>İletişim</th>
                                                <th>Fiziki</th>
                                                <th>Sertifika</th>
                                                <th>Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {personel.map(p => (
                                                <tr key={p.id}>
                                                    <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#94a3b8' }}>{p.tc_no}</td>
                                                    <td style={{ fontWeight: 700, fontSize: 15 }}>{p.full_name}</td>
                                                    <td style={{ fontWeight: 500 }}>{p.phone || '—'}</td>
                                                    <td style={{ fontSize: 13, color: '#94a3b8' }}>{p.height ? p.height + 'cm' : '-'} / {p.weight ? p.weight + 'kg' : '-'}</td>
                                                    <td style={{ fontSize: 13 }}>{p.certificate || '—'}</td>
                                                    <td>
                                                        <span className={`badge ${p.qr_code_id ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 12px' }}>
                                                            {p.qr_code_id ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                                            {p.qr_code_id ? ' Aktif' : ' Pasif'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
