import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import { Html5Qrcode } from 'html5-qrcode'
import { motion } from 'framer-motion'
import { ShieldAlert, Camera, LogOut, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function QRVerifyPage() {
    const { profile, signOut, refreshProfile } = useAuth()
    const [scannerStarted, setScannerStarted] = useState(false)
    const scannerRef = useRef(null)

    useEffect(() => {
        return () => {
            if (scannerRef.current) scannerRef.current.stop().catch(() => { })
        }
    }, [])

    const startQrScanner = async () => {
        setScannerStarted(true)
        setTimeout(async () => {
            const html5QrCode = new Html5Qrcode('qr-verify-reader')
            scannerRef.current = html5QrCode
            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 15, qrbox: { width: 280, height: 280 } },
                    async (decodedText) => {
                        const scannedTc = decodedText.trim()
                        await html5QrCode.stop()
                        setScannerStarted(false)

                        if (scannedTc === profile.tc_no) {
                            const { error } = await supabase.from('profiles').update({ qr_code_id: scannedTc }).eq('id', profile.id)
                            if (error) { showToast('QR kaydedilemedi: ' + error.message, 'error'); return }

                            showToast('✅ QR doğrulandı! Sisteme yönlendiriliyorsunuz...', 'success')
                            // Use global refresh mechanism to push user into the actual app
                            await refreshProfile()
                        } else {
                            showToast('❌ QR kodu TC kimliğiniz ile eşleşmiyor!', 'error')
                        }
                    },
                    () => { } // Handle scanning errors silently
                )
            } catch (err) {
                showToast('Kamera başlatılamadı: ' + err.message, 'error')
                setScannerStarted(false)
            }
        }, 400)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="animated-bg" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong" style={{ maxWidth: 460, width: '100%', padding: 40, textAlign: 'center' }}>
                <ShieldAlert size={64} color="#fbbf24" strokeWidth={1.5} style={{ margin: '0 auto 24px' }} />

                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Zorunlu Güvenlik Duvarı</h2>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32 }}>
                    Hesabınız başarıyla oluşturuldu fakat güvenliğiniz için personel yaka kartınızdaki <strong style={{ color: '#fbbf24' }}>QR Kodu</strong> okutmanız gerekmektedir.
                </p>

                {!scannerStarted ? (
                    <button className="btn-primary" onClick={startQrScanner} style={{ width: '100%', padding: '16px', marginBottom: 20 }}>
                        <Camera size={20} /> Kamerayı Çalıştır & Tara
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div id="qr-verify-reader" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '2px solid rgba(59,130,246,0.4)', background: 'var(--color-bg-deep)' }} />
                        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <CheckCircle2 size={16} color="#60a5fa" /> Yaka kartını karenin içine yerleştirin
                        </p>
                    </motion.div>
                )}

                <button onClick={signOut} style={{
                    background: 'none', border: 'none', color: '#fca5a5', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8, width: '100%', padding: '12px', fontSize: 14, cursor: 'pointer', fontWeight: 600
                }}>
                    <LogOut size={16} /> Farklı Bir Hesapla Devam Et
                </button>
            </motion.div>
        </div>
    )
}
