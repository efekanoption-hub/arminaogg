import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, AlignLeft, Check, X, Ghost, AlertTriangle } from 'lucide-react'

export default function PersonelHome() {
    const { profile } = useAuth()
    const [events, setEvents] = useState([])
    const [applications, setApplications] = useState({})
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        fetchEvents()
        const channel = supabase.channel('events-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [])

    const fetchEvents = async () => {
        const { data: eventsData } = await supabase.from('events').select('*').eq('status', 'aktif').order('date', { ascending: true })
        const { data: appsData } = await supabase.from('applications').select('*').eq('user_id', profile?.id)

        const appsMap = {}
        appsData?.forEach(a => { appsMap[a.event_id] = a.status })
        setApplications(appsMap)
        setEvents(eventsData || [])
        setLoading(false)
    }

    const handleResponse = async (eventId, status) => {
        setProcessingId(eventId)
        const existing = applications[eventId]

        if (existing) {
            const { error } = await supabase.from('applications').update({ status }).eq('event_id', eventId).eq('user_id', profile.id)
            if (error) { showToast('Hata: ' + error.message, 'error'); setProcessingId(null); return }
        } else {
            const { error } = await supabase.from('applications').insert({ event_id: eventId, user_id: profile.id, status })
            if (error) { showToast('Hata: ' + error.message, 'error'); setProcessingId(null); return }
        }

        setApplications(a => ({ ...a, [eventId]: status }))
        showToast(status === 'katılıyor' ? '✅ Katılım onaylandı!' : '❌ Görev reddedildi.', status === 'katılıyor' ? 'success' : 'warning')
        setProcessingId(null)
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Günaydın'
        if (h < 18) return 'İyi günler'
        return 'İyi akşamlar'
    }

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
            {/* Header */}
            <div className="glass-strong" style={{
                marginTop: 20, marginInline: 16, padding: '32px 24px', borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(15,23,42,0.8) 100%)',
                border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <p style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{greeting()}</p>
                    <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 4, letterSpacing: '-0.5px' }}>
                        {profile?.full_name?.split(' ')[0] || 'Personel'}
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                        Sana atanan güncel operasyon görevlerini aşağıdan inceleyebilirsin.
                    </p>
                </motion.div>
            </div>

            {/* Events List */}
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{ width: 40, height: 40, border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto' }} />
                    </div>
                ) : events.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: 48, textAlign: 'center' }}>
                        <Ghost size={56} color="#64748b" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Aktif Görev Yok</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Şu an için atanmış bir operasyon görünmüyor.</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <AnimatePresence>
                            {events.map((event, i) => {
                                const appStatus = applications[event.id]
                                return (
                                    <motion.div key={event.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                                        className="glass-strong" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>

                                        {/* Status Ribbon */}
                                        {appStatus && (
                                            <div style={{
                                                position: 'absolute', top: 0, right: 0,
                                                background: appStatus === 'katılıyor' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                                                color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '1px',
                                                padding: '6px 16px', borderRadius: '0 24px 0 16px', boxShadow: '-4px 4px 15px rgba(0,0,0,0.3)',
                                            }}>
                                                {appStatus === 'katılıyor' ? 'ONAYLI' : 'REDDEDİLDİ'}
                                            </div>
                                        )}

                                        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, paddingRight: appStatus ? 80 : 0 }}>{event.title}</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#f8fafc', fontWeight: 500 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#60a5fa" /></div>
                                                <span>{formatDate(event.date)}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#f8fafc', fontWeight: 500 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={16} color="#60a5fa" /></div>
                                                <span>Saat: {formatTime(event.date)}</span>
                                            </div>
                                            {event.location && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#f8fafc', fontWeight: 500 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#c084fc" /></div>
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                            {event.description && (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 4 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlignLeft size={16} color="#94a3b8" /></div>
                                                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, paddingTop: 6 }}>{event.description}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <button
                                                className="btn-success" disabled={processingId === event.id || appStatus === 'katılıyor'}
                                                onClick={() => handleResponse(event.id, 'katılıyor')}
                                                style={{ opacity: appStatus === 'katılıyor' ? 0.5 : 1, padding: '16px 0', fontSize: 15 }}
                                            >
                                                {processingId === event.id ? '...' : <><Check size={18} /> Katılıyorum</>}
                                            </button>
                                            <button
                                                className="btn-danger" disabled={processingId === event.id || appStatus === 'katılmıyor'}
                                                onClick={() => handleResponse(event.id, 'katılmıyor')}
                                                style={{ opacity: appStatus === 'katılmıyor' ? 0.5 : 1, padding: '16px 0', fontSize: 15 }}
                                            >
                                                {processingId === event.id ? '...' : <><X size={18} /> Katılmıyorum</>}
                                            </button>
                                        </div>

                                        {!appStatus && (
                                            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                <AlertTriangle size={14} color="#fbbf24" />
                                                <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>Cevap Bekleniyor</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
