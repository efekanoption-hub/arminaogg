import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [configured] = useState(isConfigured())
    const hasFetchedRef = useRef(false)

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles').select('*').eq('id', userId).single()
            if (!error && data) {
                setProfile(data)
                setIsAdmin(data.role === 'admin')
                return data
            }
        } catch (e) {
            console.warn('Profile fetch failed:', e)
        }
        return null
    }

    useEffect(() => {
        if (!configured) { setLoading(false); return }

        let mounted = true

        const initializeAuth = async () => {
            // Supabase-js v2 triggers onAuthStateChange(INITIAL_SESSION) immediately
            // So we don't manually call getSession anymore, which prevents the lock stealing error.
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (!mounted) return
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setIsAdmin(false)
                }
                setLoading(false)
            })

            return subscription
        }

        let sub = null
        initializeAuth().then(s => sub = s)

        return () => {
            mounted = false
            if (sub) sub.unsubscribe()
        }
    }, [configured])

    const signOut = async () => {
        try { await supabase.auth.signOut() } catch (e) { }
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
    }

    const refreshProfile = async () => {
        if (user) {
            const p = await fetchProfile(user.id)
            return p
        }
        return null
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut, refreshProfile, configured }}>
            {children}
        </AuthContext.Provider>
    )
}
