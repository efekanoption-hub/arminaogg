import { useState, useEffect } from 'react'

let setToastGlobal = null

export const showToast = (message, type = 'info') => {
    if (setToastGlobal) setToastGlobal({ message, type, id: Date.now() })
}

export const Toast = () => {
    const [toast, setToast] = useState(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setToastGlobal = setToast
    }, [])

    useEffect(() => {
        if (!toast) return
        setVisible(true)
        const t = setTimeout(() => {
            setVisible(false)
            setTimeout(() => setToast(null), 400)
        }, 3000)
        return () => clearTimeout(t)
    }, [toast])

    if (!toast) return null

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
    }

    return (
        <div className={`toast ${visible ? 'show' : ''}`}>
            <span>{icons[toast.type] || '💬'}</span>
            <span style={{ marginLeft: 8 }}>{toast.message}</span>
        </div>
    )
}
