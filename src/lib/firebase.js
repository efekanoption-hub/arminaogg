import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

let messaging = null
try {
    messaging = getMessaging(app)
} catch (e) {
    console.warn('Firebase messaging not supported in this environment:', e.message)
}

export const requestNotificationPermission = async () => {
    if (!messaging) return null
    try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            })
            return token
        }
    } catch (error) {
        console.error('FCM token error:', error)
    }
    return null
}

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return
        onMessage(messaging, (payload) => resolve(payload))
    })

export { messaging }
