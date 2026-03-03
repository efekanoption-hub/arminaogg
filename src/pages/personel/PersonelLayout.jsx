import { useState } from 'react'
import PersonelHome from './PersonelHome'
import PersonelProfile from './PersonelProfile'
import { Hexagon, User } from 'lucide-react'

const TABS = [
    { id: 'home', label: 'Görevler', icon: <Hexagon size={22} /> },
    { id: 'profile', label: 'Profilim', icon: <User size={22} /> },
]

export default function PersonelLayout() {
    const [activeTab, setActiveTab] = useState('home')

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <div className="animated-bg" />

            {/* Pages render here */}
            <div style={{ paddingBottom: '20px' }}>
                {activeTab === 'home' && <PersonelHome />}
                {activeTab === 'profile' && <PersonelProfile />}
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <div style={{ marginBottom: 4 }}>{tab.icon}</div>
                        <span style={{ letterSpacing: '0.5px' }}>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    )
}
