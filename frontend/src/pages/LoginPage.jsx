import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, Spinner } from '../components/UI'

const ROLES = [
  {
    value: 'admin',
    label: 'Administrateur',
    short: 'Admin',
    color: '#2563eb',
  },
  {
    value: 'professeur',
    label: 'Professeur',
    short: 'Professeur',
    color: '#7c3aed',
  },
  {
    value: 'etudiant',
    label: 'Étudiant',
    short: 'Étudiant',
    color: '#059669',
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRole = ROLES.find(r => r.value === role)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const r = await login(email, password, role)

      if (r === 'admin') {
        navigate('/admin')
      } else if (r === 'professeur') {
        navigate('/professeur')
      } else {
        navigate('/etudiant')
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Email ou mot de passe incorrect.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f9fc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >

      {/* ================= CONTAINER ================= */}

      <div
        style={{
          width: '100%',
          maxWidth: 430,
          animation: 'fadeUp .4s ease',
        }}
      >

        {/* ================= LOGO ================= */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 58,
              height: 58,
              margin: '0 auto 15px',
              borderRadius: 16,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.18)',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: 27,
                fontWeight: 800,
                letterSpacing: '-2px',
              }}
            >
              CI
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              color: '#111827',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.7px',
            }}
          >
            Correct<span style={{ color: '#2563eb' }}>IA</span>
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#667085',
              fontSize: 14,
            }}
          >
            Système intelligent de correction d'examens
          </p>
        </div>

        {/* ================= CARD ================= */}

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e9f0',
            borderRadius: 18,
            padding: 30,
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06)',
          }}
        >

          {/* ================= ROLE ================= */}

          <div style={{ marginBottom: 25 }}>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#344054',
                }}
              >
                Se connecter en tant que
              </label>

              <span
                style={{
                  fontSize: 11,
                  color: '#98a2b3',
                }}
              >
                Choisissez votre rôle
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >

              {ROLES.map(r => {
                const active = role === r.value

                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 10,
                      border: active
                        ? `1px solid ${r.color}`
                        : '1px solid #e5e9f0',

                      background: active
                        ? '#f8fafc'
                        : '#ffffff',

                      color: active
                        ? r.color
                        : '#667085',

                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,

                      transition: 'all .15s',

                      boxShadow: active
                        ? `0 0 0 3px ${r.color}12`
                        : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: active
                          ? r.color
                          : '#d0d5dd',
                        margin: '0 auto 7px',
                        transition: 'all .15s',
                      }}
                    />

                    {r.short}
                  </button>
                )
              })}

            </div>
          </div>

          {/* ================= FORM ================= */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 17,
            }}
          >

            {/* EMAIL */}

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#344054',
                }}
              >
                Adresse email
              </label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #d0d5dd',
                  background: '#ffffff',
                  color: '#172033',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all .15s',
                }}

                onFocus={e => {
                  e.target.style.borderColor =
                    selectedRole.color
                  e.target.style.boxShadow =
                    `0 0 0 3px ${selectedRole.color}12`
                }}

                onBlur={e => {
                  e.target.style.borderColor =
                    '#d0d5dd'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 7,
                  fontSize: 12,
                  fontWeight: 650,
                  color: '#344054',
                }}
              >
                Mot de passe
              </label>

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #d0d5dd',
                  background: '#ffffff',
                  color: '#172033',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all .15s',
                }}

                onFocus={e => {
                  e.target.style.borderColor =
                    selectedRole.color
                  e.target.style.boxShadow =
                    `0 0 0 3px ${selectedRole.color}12`
                }}

                onBlur={e => {
                  e.target.style.borderColor =
                    '#d0d5dd'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* ERROR */}

            <Alert
              type="error"
              message={error}
            />

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: '100%',
                padding: '13px 16px',
                borderRadius: 10,
                border: 'none',

                background: selectedRole.color,
                color: '#ffffff',

                fontSize: 14,
                fontWeight: 700,

                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',

                opacity: loading ? 0.75 : 1,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,

                boxShadow:
                  `0 6px 15px ${selectedRole.color}25`,

                transition: 'all .15s',
              }}
            >
              {loading && (
                <Spinner
                  size={16}
                  color="#ffffff"
                />
              )}

              {loading
                ? 'Connexion...'
                : 'Se connecter'}
            </button>

          </form>

        </div>

        {/* ================= FOOTER ================= */}

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 11,
            color: '#98a2b3',
          }}
        >
          CorrectIA · Correction intelligente des examens
        </div>

      </div>
    </div>
  )
}