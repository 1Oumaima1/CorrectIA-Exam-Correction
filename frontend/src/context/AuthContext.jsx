import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedRole = localStorage.getItem('role')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      setRole(savedRole)
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role })
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
    }))
    setUser({ id: data.user_id, nom: data.nom, prenom: data.prenom })
    setRole(data.role)
    return data.role
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    setRole(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
