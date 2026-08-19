import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, navItems, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sidebarOpen = !isMobile || mobileMenuOpen

  // Icons SVG
  const renderIcon = (label) => {
    const text = label.toLowerCase()

    if (text.includes('tableau')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )

       }

  // Professeurs
  if (text.includes('professeur')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

  // Étudiants
  if (text.includes('étudiant') || text.includes('etudiant')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  // Filières et classes
  if (text.includes('filière') || text.includes('filiere') || text.includes('classe')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-5h6v5" />
        <path d="M9 10h1" />
        <path d="M14 10h1" />
      </svg>
    )
  
    }
    if (text.includes('examen')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    }
    if (text.includes('créer') || text.includes('creer')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      )
    }

    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f4f6fa',
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: collapsed ? 80 : 250,
          background: '#ffffff',
          borderRight: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .25s ease',
          overflow: 'hidden',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 40,
          transform: isMobile
            ? sidebarOpen
              ? 'translateX(0)'
              : 'translateX(-102%)'
            : 'translateX(0)',
          transitionProperty: 'transform, width',
        }}
      >
        {/* ================= LOGO ================= */}
        <div
          style={{
            height: 90,
            padding: collapsed ? '20px 0' : '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#2563eb',
                    letterSpacing: '-0.5px',
                  }}
                >
                  CorrectIA
                </span>
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: '#94a3b8',
                  fontSize: 12,
                  fontWeight: 500,
                  paddingLeft: 42,
                }}
              >
                {title || 'Espace Professeur'}
              </div>
            </div>
          )}

          {collapsed && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
          )}

          {!collapsed && !isMobile && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Réduire le menu"
              style={{
                width: 26,
                height: 26,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              ‹
            </button>
          )}

          {collapsed && !isMobile && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Ouvrir le menu"
              style={{
                position: 'absolute',
                top: 32,
                right: -12,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(15,23,42,.08)',
                zIndex: 5,
              }}
            >
              ›
            </button>
          )}
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '24px 10px' : '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            // التعديل هنا: كايحسب active غير يلا كان الـ URL كايتطابق بزبط مع item.path
            const active = location.pathname === item.path

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) {
                    setMobileMenuOpen(false)
                  }
                }}
                title={collapsed ? item.label : ''}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  minHeight: 48,
                  padding: collapsed ? '10px 0' : '10px 16px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  border: 'none',
                  borderRadius: 14,
                  background: active
                    ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                    : 'transparent',
                  color: active ? '#ffffff' : '#64748b',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  textAlign: 'left',
                  boxShadow: active
                    ? '0 4px 12px rgba(37, 99, 235, 0.25)'
                    : 'none',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? '#ffffff' : '#64748b',
                    flexShrink: 0,
                  }}
                >
                  {renderIcon(item.label)}
                </span>

                {!collapsed && (
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {!collapsed && active && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#ffffff',
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* ================= USER SECTION ================= */}
        <div
          style={{
            padding: collapsed ? '16px 10px' : '16px 16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {!collapsed && user && (
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {user.prenom?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.prenom} {user.nom}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: '#2563eb',
                    background: '#eff6ff',
                    display: 'inline-block',
                    padding: '1px 6px',
                    borderRadius: 4,
                    marginTop: 3,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {user.role || 'Professeur'}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Déconnexion' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              width: '100%',
              padding: collapsed ? '12px 0' : '12px 14px',
              borderRadius: 12,
              border: 'none',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>

            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fermer le menu"
          style={{
            position: 'fixed',
            inset: 0,
            border: 'none',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 30,
          }}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          padding: isMobile ? '16px 16px 24px' : '36px 40px',
          background: '#f4f6fa',
        }}
      >
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 18,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>

            <div
              style={{
                fontSize: 14,
                color: '#1e293b',
                fontWeight: 700,
              }}
            >
              {title}
            </div>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}