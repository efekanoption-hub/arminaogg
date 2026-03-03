import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [configured] = useState(isConfigured())

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            if (!error && data) {
                setProfile(data)
                setIsAdmin(data.role === 'admin')
            }
            return data
        } catch (e) {
            console.warn('Profile fetch failed:', e)
        }
    }

    useEffect(() => {
        if (!configured) { setLoading(false); return }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
            else setLoading(false)
        }).catch(() => setLoading(false))

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setIsAdmin(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [configured])

    const signOut = async () => {
        try { await supabase.auth.signOut() } catch (e) { }
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
    }

    const refreshProfile = () => user && fetchProfile(user.id)

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut, refreshProfile, configured }}>
            {children}
        </AuthContext.Provider>
    )
}
