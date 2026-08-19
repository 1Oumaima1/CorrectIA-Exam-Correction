
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  Alert,
  Badge,
  Btn,
  Card,
  Input,
  Modal,
  Select,
  Spinner,
  Table
} from '../components/UI'
import api from '../services/api'

const NAV = [
  { path: '/admin', label: 'Tableau de bord' },
  { path: '/admin/professeurs', label: 'Professeurs' },
  { path: '/admin/etudiants', label: 'Étudiants' },
  { path: '/admin/filieres', label: 'Filières et classes' },
]

export default function AdminDashboard() {
  return (
    <Layout navItems={NAV} title="Administration">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="professeurs" element={<ProfesseursMgmt />} />
        <Route path="etudiants" element={<EtudiantsMgmt />} />
        <Route path="filieres" element={<FilieresMgmt />} />
      </Routes>
    </Layout>
  )
}

/* =========================================================
   ICONS
========================================================= */

function IconUsers({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconStudent({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10L12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  )
}

function IconBuilding({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 7h1" />
      <path d="M14 7h1" />
      <path d="M9 11h1" />
      <path d="M14 11h1" />
      <path d="M9 15h1" />
      <path d="M14 15h1" />
    </svg>
  )
}

function IconClass({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  )
}

function IconExam({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
  
}
function IconChart({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 6-7" />
      <path d="M20 7v4h-4" />
    </svg>
  )
}

function IconClock({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function IconGraduation({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  )
}

/* =========================================================
   TABLEAU DE BORD
========================================================= */

function AdminHome() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setError('')

      const response = await api.get('/admin/stats')

      setStats(response.data)
    } catch (err) {
      console.error('Erreur stats:', err)

      setError(
        err.response?.data?.detail ||
        'Impossible de charger les statistiques.'
      )
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (!stats && !error) {
    return (
      <div
        style={{
          minHeight: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </div>
    )
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div
        className="animate-fadeUp"
        style={{
          maxWidth: 700,
        }}
      >
        <Alert message={error} />
      </div>
    )
  }

  /* =========================
     DYNAMIC VALUES
  ========================= */

  const cards = [
    {
      label: 'Professeurs',
      value: stats?.professeurs ?? 0,
      color: '#2563eb',
      background: '#eff6ff',
      icon: <IconUsers />,
      description: 'Professeurs enregistrés',
    },
    {
      label: 'Étudiants',
      value: stats?.etudiants ?? 0,
      color: '#16a34a',
      background: '#f0fdf4',
      icon: <IconStudent />,
      description: 'Étudiants inscrits',
    },
    {
      label: 'Filières',
      value: stats?.filieres ?? 0,
      color: '#7c3aed',
      background: '#f5f3ff',
      icon: <IconBuilding />,
      description: 'Filières disponibles',
    },
    {
      label: 'Classes',
      value: stats?.classes ?? 0,
      color: '#ea580c',
      background: '#fff7ed',
      icon: <IconClass />,
      description: 'Classes créées',
    },
    {
      label: 'Examens',
      value: stats?.examens ?? 0,
      color: '#dc2626',
      background: '#fef2f2',
      icon: <IconExam />,
      description: 'Examens enregistrés',
    },
  ]

  return (
    <div
      className="animate-fadeUp"
      style={{
        width: '100%',
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          marginBottom: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
        }}
      >
        <div>
         

          <PageHeader
        title="Tableau de bord"
        ></PageHeader>

          <p
            style={{
              color: '#667085',
              fontSize: 14,
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            Vue d'ensemble du système
          </p>
        </div>
      </div>

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {cards.map(card => (
          <div
            key={card.label}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 15,
              padding: 20,
              minHeight: 135,
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              boxShadow:
                '0 2px 8px rgba(15, 23, 42, 0.035)',
              transition:
                'transform .18s ease, box-shadow .18s ease',
            }}
          >

            {/* TOP */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 18,
              }}
            >

              <div
                style={{
                  width: 43,
                  height: 43,
                  borderRadius: 12,
                  background: card.background,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  width: 5,
                  height: 32,
                  borderRadius: 10,
                  background: card.color,
                  opacity: 0.75,
                }}
              />
            </div>

            {/* VALUE */}

            <div
              style={{
                fontSize: 28,
                lineHeight: 1,
                fontWeight: 800,
                color: card.color,
                marginBottom: 8,
              }}
            >
              {card.value}
            </div>

            {/* LABEL */}

            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#344054',
                marginBottom: 4,
              }}
            >
              {card.label}
            </div>

            {/* DESCRIPTION */}

            <div
              style={{
                fontSize: 11.5,
                color: '#98a2b3',
              }}
            >
              {card.description}
            </div>

          </div>
        ))}
      </div>

     {/* =================================================
    CONTENU SOUS LES KPI
================================================= */}

<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
    gap: 20,
    marginBottom: 24,
  }}
>
  {/* =============================================
      APERÇU DES DONNÉES
  ============================================= */}

  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      padding: 24,
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconChart size={21} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 750,
              color: '#1e293b',
            }}
          >
            Aperçu des données
          </h2>

          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: '#98a2b3',
            }}
          >
            Vue globale des ressources
          </p>
        </div>
      </div>

      <select
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '9px 12px',
          color: '#475467',
          background: '#fff',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option>Cette année</option>
        <option>Ce mois</option>
      </select>
    </div>

    {/* BARRES DYNAMIQUES */}

    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        gap: 20,
        minHeight: 220,
        padding: '20px 10px 0',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {cards.map(card => {
        const maxValue = Math.max(
          ...cards.map(c => Number(c.value) || 0),
          1
        )

        const value = Number(card.value) || 0

        const height =
          value === 0
            ? 4
            : Math.max((value / maxValue) * 140, 20)

        return (
          <div
            key={card.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minWidth: 55,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#475467',
                marginBottom: 8,
              }}
            >
              {value}
            </div>

            <div
              style={{
                width: '100%',
                maxWidth: 55,
                height,
                borderRadius: '10px 10px 0 0',
                background: card.color,
                opacity: 0.85,
                transition: 'height .3s ease',
              }}
            />

            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: '#667085',
                textAlign: 'center',
              }}
            >
              {card.label}
            </div>
          </div>
        )
      })}
    </div>
  </div>

  {/* =============================================
      ACTIVITÉ RÉCENTE - DYNAMIQUE
  ============================================= */}

  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      padding: 24,
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconClock size={21} />
      </div>

      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 750,
            color: '#1e293b',
          }}
        >
          Activité récente
        </h2>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: 12,
            color: '#98a2b3',
          }}
        >
          Dernières actions effectuées
        </p>
      </div>
    </div>

    {/* ACTIVITIES */}

    {(!stats?.recent_activity ||
      stats.recent_activity.length === 0) ? (
      <div
        style={{
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#98a2b3',
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        Aucune activité récente
      </div>
    ) : (
      stats.recent_activity
        .slice(0, 5)
        .map((activity, index) => {
          const activityConfig = {
            etudiant: {
              icon: <IconStudent size={18} />,
              color: '#16a34a',
              background: '#f0fdf4',
            },

            professeur: {
              icon: <IconUsers size={18} />,
              color: '#2563eb',
              background: '#eff6ff',
            },

            filiere: {
              icon: <IconBuilding size={18} />,
              color: '#7c3aed',
              background: '#f5f3ff',
            },

            classe: {
              icon: <IconClass size={18} />,
              color: '#ea580c',
              background: '#fff7ed',
            },

            examen: {
              icon: <IconExam size={18} />,
              color: '#dc2626',
              background: '#fef2f2',
            },
          }

          const config =
            activityConfig[activity.type] ||
            activityConfig.etudiant

          const displayedActivities =
            stats.recent_activity.slice(0, 5)

          return (
            <div
              key={activity.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '14px 0',
                borderBottom:
                  index !== displayedActivities.length - 1
                    ? '1px solid #f0f2f5'
                    : 'none',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: config.background,
                  color: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 650,
                    color: '#344054',
                  }}
                >
                  {activity.message}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#98a2b3',
                  whiteSpace: 'nowrap',
                }}
              >
                {activity.date || 'Récemment'}
              </div>
            </div>
          )
        })
    )}
  </div>
</div>

{/* =============================================
    BANNIÈRE DE BIENVENUE
============================================= */}

<div
  style={{
    background:
      'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}
  >
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        background: '#eff6ff',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <IconGraduation size={30} />
    </div>

    <div>
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 750,
          color: '#1e293b',
        }}
      >
        Bienvenue sur CorrectIA !
      </h2>

      <p
        style={{
          margin: '7px 0 0',
          fontSize: 13,
          color: '#667085',
        }}
      >
        Gérez facilement les professeurs, étudiants,
        filières, classes et examens.
      </p>
    </div>
  </div>

  <button
    type="button"
    style={{
      border: 'none',
      background: '#2563eb',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 650,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: '0 6px 15px rgba(37, 99, 235, 0.2)',
    }}
  >
    Voir les statistiques →
  </button>
</div>
    </div>
  )
  
}



/* =========================================================
   PROFESSEURS
========================================================= */

function ProfesseursMgmt() {

  const [data, setData] = useState([])
  const [classes, setClasses] = useState([])

  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedClasses, setSelectedClasses] = useState([])

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    specialite: '',
    date_naissance: '',
  })

  /* -----------------------------
     CHARGEMENT PROFESSEURS
  ----------------------------- */

  const loadProfesseurs = async () => {
    try {
      const r = await api.get('/admin/professeurs')
      setData(r.data)
    } catch (err) {
      console.error('Erreur professeurs:', err)
    }
  }

  /* -----------------------------
     CHARGEMENT CLASSES
  ----------------------------- */

  const loadClasses = async () => {

    setLoadingClasses(true)

    try {

      const r = await api.get('/admin/classes')
      setClasses(r.data)

    } catch (err) {

      console.error('Erreur classes:', err)

    } finally {

      setLoadingClasses(false)

    }
  }

  useEffect(() => {
    loadProfesseurs()
    loadClasses()
  }, [])

  /* -----------------------------
     FORM
  ----------------------------- */

  const set = (key, value) => {

    setForm(prev => ({
      ...prev,
      [key]: value,
    }))

  }

  const resetForm = () => {

    setForm({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      specialite: '',
      date_naissance: '',
    })

    setSelectedClasses([])
    setEditingId(null)
    setErr('')
    setSuccess('')
  }

  /* -----------------------------
     SELECTION CLASSES
  ----------------------------- */

  const toggleClasse = (classeId) => {

    setSelectedClasses(prev => {

      if (prev.includes(classeId)) {
        return prev.filter(id => id !== classeId)
      }

      return [...prev, classeId]

    })

  }

  /* -----------------------------
     CREATION PROFESSEUR
  ----------------------------- */

  const submit = async e => {

    e.preventDefault()

    setErr('')
    setSuccess('')

    if (selectedClasses.length === 0) {

      setErr(
        'Veuillez sélectionner au moins une classe.'
      )

      return
    }

    setLoading(true)

    try {

      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        password: form.password,
        specialite: form.specialite.trim(),
        date_naissance: form.date_naissance,
        classes_ids: selectedClasses,
      }

      if (editingId) {
        await api.put(`/admin/professeurs/${editingId}`, payload)
        setSuccess('Professeur modifié avec succès.')
      } else {
        await api.post('/admin/professeurs', payload)
        setSuccess('Professeur créé avec succès.')
      }

      await loadProfesseurs()

      setTimeout(() => {

        setModal(false)
        resetForm()

      }, 700)

    } catch (e) {

      console.error(
        'Erreur professeur:',
        e
      )

      setErr(
        e.response?.data?.detail ||
        'Une erreur est survenue lors de la sauvegarde du professeur.'
      )

    } finally {

      setLoading(false)

    }

  }

  /* -----------------------------
     SUPPRESSION
  ----------------------------- */

  const del = async id => {

    if (!confirm('Supprimer ce professeur ?')) {
      return
    }

    try {

      await api.delete(
        `/admin/professeurs/${id}`
      )

      await loadProfesseurs()

    } catch (e) {

      console.error(e)

      alert(
        e.response?.data?.detail ||
        'Impossible de supprimer ce professeur.'
      )

    }

  }

  const openEdit = (prof) => {
    setEditingId(prof.id)
    setForm({
      nom: prof.nom || '',
      prenom: prof.prenom || '',
      email: prof.email || '',
      password: '',
      specialite: prof.specialite || '',
      date_naissance: prof.date_naissance || '',
    })
    setSelectedClasses((prof.classes_ids || prof.classes?.map(c => c.id) || []))
    setModal(true)
  }

  /* -----------------------------
     OUVERTURE MODAL
  ----------------------------- */

  const openModal = () => {

    resetForm()
    loadClasses()
    setModal(true)

  }

  return (

    <div className="animate-fadeUp">

      <PageHeader
        title="Professeurs"
        subtitle={
          `${data.length} professeur(s) enregistré(s)`
        }
        action={
          <Btn onClick={openModal}>
            + Nouveau professeur
          </Btn>
        }
      />

      <Card>

        <Table
          headers={[
            'Nom',
            'Email',
            'Spécialité',
            'Classes',
            'Actions'
          ]}
          rows={data.map(p => [

            <span
              key={`name-${p.id}`}
              style={{
                fontWeight: 600,
                color: '#111111',
              }}
            >
              {p.prenom} {p.nom}
            </span>,

            <span
              key={`email-${p.id}`}
              style={{
                color: '#222222',
              }}
            >
              {p.email}
            </span>,

            <Badge key={`spec-${p.id}`}>
              {p.specialite}
            </Badge>,

            <Badge
              key={`classes-${p.id}`}
              color={
                p.nb_classes > 0
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)'
              }
            >
              {p.nb_classes}{' '}
              classe{p.nb_classes !== 1 ? 's' : ''}
            </Badge>,

            <div key={`actions-${p.id}`} style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => openEdit(p)}>
                Modifier
              </Btn>
              <Btn
                size="sm"
                variant="danger"
                onClick={() => del(p.id)}
              >
                Supprimer
              </Btn>
            </div>,

          ])}
          emptyMsg="Aucun professeur"
        />

      </Card>

      {/* =========================
          MODAL PROFESSEUR
      ========================= */}

      <Modal
        open={modal}
        onClose={() => {

          if (!loading) {

            setModal(false)
            resetForm()

          }

        }}
        title={editingId ? 'Modifier le professeur' : 'Nouveau professeur'}
      >

        <form
          onSubmit={submit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >

          {/* NOM / PRENOM */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: 12,
            }}
          >

            <Input
              label="Nom"
              value={form.nom}
              onChange={e =>
                set(
                  'nom',
                  e.target.value
                )
              }
              required
            />

            <Input
              label="Prénom"
              value={form.prenom}
              onChange={e =>
                set(
                  'prenom',
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* EMAIL */}

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e =>
              set(
                'email',
                e.target.value
              )
            }
            required
          />

          {/* PASSWORD */}

          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={e =>
              set(
                'password',
                e.target.value
              )
            }
            required
          />

          {/* SPECIALITE */}

          <Input
            label="Spécialité"
            placeholder="Exemple : Intelligence Artificielle"
            value={form.specialite}
            onChange={e =>
              set(
                'specialite',
                e.target.value
              )
            }
            required
          />

          {/* DATE */}

          <Input
            label="Date de naissance"
            type="date"
            value={form.date_naissance}
            onChange={e =>
              set(
                'date_naissance',
                e.target.value
              )
            }
            required
          />

          {/* =========================
              CLASSES
          ========================= */}

          <div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >

              <label
                style={{
                  fontSize: 12,
                  color:
                    'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Classes enseignées
              </label>

              {selectedClasses.length > 0 && (

                <span
                  style={{
                    fontSize: 11,
                    color:
                      'var(--accent)',
                    fontWeight: 600,
                  }}
                >
                  {selectedClasses.length}{' '}
                  sélectionnée
                  {selectedClasses.length > 1
                    ? 's'
                    : ''}
                </span>

              )}

            </div>

            {loadingClasses ? (

              <div
                style={{
                  border:
                    '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <Spinner />
              </div>

            ) : classes.length === 0 ? (

              <div
                style={{
                  border:
                    '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 16,
                  color:
                    'var(--text-muted)',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >

                Aucune classe disponible.

                <br />

                Créez d'abord une classe
                dans

                <strong>
                  {' '}Filières et classes
                </strong>.

              </div>

            ) : (

              <div
                style={{
                  border:
                    '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  maxHeight: 230,
                  overflowY: 'auto',
                }}
              >

                {classes.map(
                  (c, index) => {

                    const selected =
                      selectedClasses.includes(
                        c.id
                      )

                    return (

                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          toggleClasse(c.id)
                        }
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 12,
                          padding:
                            '12px 14px',
                          border: 'none',
                          borderBottom:
                            index <
                            classes.length - 1
                              ? '1px solid var(--border)'
                              : 'none',
                          background:
                            selected
                              ? 'var(--accent)12'
                              : 'transparent',
                          cursor:
                            'pointer',
                          textAlign:
                            'left',
                          transition:
                            'background .15s',
                        }}
                      >

                        {/* CHECKBOX */}

                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            border:
                              selected
                                ? '1px solid var(--accent)'
                                : '1px solid var(--border)',
                            background:
                              selected
                                ? 'var(--accent)'
                                : 'transparent',
                            color: '#fff',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {selected
                            ? '✓'
                            : ''}
                        </div>

                        {/* INFOS CLASSE */}

                        <div
                          style={{
                            flex: 1,
                          }}
                        >

                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color:
                                '#111111',
                            }}
                          >
                            {c.nom}
                          </div>

                          <div
                            style={{
                              display:
                                'flex',
                              gap: 7,
                              marginTop: 3,
                              alignItems:
                                'center',
                            }}
                          >

                            <span
                              style={{
                                fontSize: 11,
                                color:
                                  'var(--text-muted)',
                              }}
                            >
                              Niveau {c.niveau}
                            </span>

                            {c.filiere_nom && (

                              <>

                                <span
                                  style={{
                                    color:
                                      'var(--border)',
                                  }}
                                >
                                  •
                                </span>

                                <span
                                  style={{
                                    fontSize: 11,
                                    color:
                                      'var(--text-muted)',
                                  }}
                                >
                                  {c.filiere_nom}
                                </span>

                              </>

                            )}

                          </div>

                        </div>

                      </button>

                    )

                  }
                )}

              </div>

            )}

          </div>

          {/* ERREUR */}

          <Alert message={err} />

          {/* SUCCESS */}

          <Alert
            type="success"
            message={success}
          />

          {/* BUTTON */}

          <Btn
            type="submit"
            loading={loading}
            disabled={
              loading ||
              classes.length === 0
            }
          >
            {editingId ? 'Enregistrer les modifications' : 'Créer le professeur'}
          </Btn>

        </form>

      </Modal>

    </div>

  )
}

/* =========================================================
   ETUDIANTS
========================================================= */

function EtudiantsMgmt() {

  const [data, setData] = useState([])
  const [classes, setClasses] = useState([])

  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [err, setErr] = useState('')

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    cne: '',
    date_naissance: '',
    classe_id: '',
  })

  const load = async () => {

    try {

      const [
        etudiantsResponse,
        classesResponse
      ] = await Promise.all([

        api.get('/admin/etudiants'),
        api.get('/admin/classes')

      ])

      setData(etudiantsResponse.data)
      setClasses(classesResponse.data)

    } catch (err) {

      console.error(
        'Erreur chargement étudiants:',
        err
      )

    }

  }

  useEffect(() => {
    load()
  }, [])

  const set = (key, value) => {

    setForm(prev => ({
      ...prev,
      [key]: value,
    }))

  }

  const resetForm = () => {

    setForm({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      cne: '',
      date_naissance: '',
      classe_id: '',
    })

    setEditingId(null)
    setErr('')

  }

  const submit = async e => {

    e.preventDefault()

    setErr('')
    setLoading(true)

    try {

      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        password: form.password,
        cne: form.cne.trim(),
        date_naissance: form.date_naissance,
        classe_id: parseInt(form.classe_id, 10),
      }

      if (editingId) {
        await api.put(`/admin/etudiants/${editingId}`, payload)
      } else {
        await api.post('/admin/etudiants', payload)
      }

      setModal(false)
      resetForm()

      await load()

    } catch (e) {

      console.error(e)

      setErr(
        e.response?.data?.detail ||
        'Une erreur est survenue.'
      )

    } finally {

      setLoading(false)

    }

  }

  const del = async id => {

    if (
      !confirm(
        'Supprimer cet étudiant ?'
      )
    ) {
      return
    }

    try {

      await api.delete(
        `/admin/etudiants/${id}`
      )

      await load()

    } catch (e) {

      console.error(e)

      alert(
        e.response?.data?.detail ||
        'Impossible de supprimer cet étudiant.'
      )

    }

  }

  const openEdit = (etu) => {
    setEditingId(etu.id)
    setForm({
      nom: etu.nom || '',
      prenom: etu.prenom || '',
      email: etu.email || '',
      password: '',
      cne: etu.cne || '',
      date_naissance: etu.date_naissance || '',
      classe_id: etu.classe_id ? String(etu.classe_id) : '',
    })
    setModal(true)
  }

  return (

    <div className="animate-fadeUp">

      <PageHeader
        title="Étudiants"
        subtitle={
          `${data.length} étudiant(s) enregistré(s)`
        }
        action={

          <Btn
            onClick={() => {

              resetForm()
              setModal(true)

            }}
          >
            + Nouvel étudiant
          </Btn>

        }
      />

      <Card>

        <Table
          headers={[
            'Nom',
            'CNE',
            'Email',
            'Classe',
            'Filière',
            'Actions'
          ]}
          rows={data.map(e => [

            <span
              key={`name-${e.id}`}
              style={{
                fontWeight: 600,
                color: '#111111',
              }}
            >
              {e.prenom} {e.nom}
            </span>,

            <code
              key={`cne-${e.id}`}
              style={{
                fontSize: 12,
                color: '#222222',
              }}
            >
              {e.cne}
            </code>,

            <span
              key={`email-${e.id}`}
              style={{
                color: '#222222',
              }}
            >
              {e.email}
            </span>,

            <Badge
              key={`classe-${e.id}`}
              color="var(--accent)"
            >
              {e.classe_nom}
            </Badge>,

            <Badge
              key={`filiere-${e.id}`}
              color="var(--accent-2)"
            >
              {e.filiere_nom}
            </Badge>,

            <div key={`actions-${e.id}`} style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => openEdit(e)}>
                Modifier
              </Btn>
              <Btn
                key={`delete-${e.id}`}
                size="sm"
                variant="danger"
                onClick={() =>
                  del(e.id)
                }
              >
                Supprimer
              </Btn>
            </div>,

          ])}
          emptyMsg="Aucun étudiant"
        />

      </Card>

      <Modal
        open={modal}
        onClose={() => {

          if (!loading) {
            setModal(false)
            resetForm()
          }

        }}
        title={editingId ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
      >

        <form
          onSubmit={submit}
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: 14,
          }}
        >

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: 12,
            }}
          >

            <Input
              label="Nom"
              value={form.nom}
              onChange={e =>
                set(
                  'nom',
                  e.target.value
                )
              }
              required
            />

            <Input
              label="Prénom"
              value={form.prenom}
              onChange={e =>
                set(
                  'prenom',
                  e.target.value
                )
              }
              required
            />

          </div>

          <Input
            label="CNE"
            value={form.cne}
            onChange={e =>
              set(
                'cne',
                e.target.value
              )
            }
            required
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e =>
              set(
                'email',
                e.target.value
              )
            }
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={e =>
              set(
                'password',
                e.target.value
              )
            }
            required
          />

          <Input
            label="Date de naissance"
            type="date"
            value={
              form.date_naissance
            }
            onChange={e =>
              set(
                'date_naissance',
                e.target.value
              )
            }
            required
          />

          <Select
            label="Classe"
            value={
              form.classe_id
            }
            onChange={e =>
              set(
                'classe_id',
                e.target.value
              )
            }
            required
          >

            <option value="">
              Sélectionner une classe
            </option>

            {classes.map(c => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.nom}
                {' '}
                ({c.filiere_nom})
              </option>

            ))}

          </Select>

          <Alert message={err} />

          <Btn
            type="submit"
            loading={loading}
          >
            {editingId ? 'Enregistrer les modifications' : 'Créer l\'étudiant'}
          </Btn>

        </form>

      </Modal>

    </div>

  )
}

/* =========================================================
   FILIERES ET CLASSES
========================================================= */

function FilieresMgmt() {

  const [filieres, setFilieres] =
    useState([])

  const [classes, setClasses] =
    useState([])

  const [modalF, setModalF] =
    useState(false)

  const [modalC, setModalC] =
    useState(false)

  const [editingFiliereId, setEditingFiliereId] = useState(null)
  const [editingClasseId, setEditingClasseId] = useState(null)

  const [loading, setLoading] =
    useState(false)

  const [err, setErr] =
    useState('')

  const [nomFiliere, setNomFiliere] =
    useState('')

  const [formClasse, setFormClasse] =
    useState({
      nom: '',
      niveau: 1,
      filiere_id: '',
    })

  const load = async () => {

    try {

      const [
        filieresResponse,
        classesResponse
      ] = await Promise.all([

        api.get('/admin/filieres'),
        api.get('/admin/classes')

      ])

      setFilieres(
        filieresResponse.data
      )

      setClasses(
        classesResponse.data
      )

    } catch (err) {

      console.error(
        'Erreur chargement filières/classes:',
        err
      )

    }

  }

  useEffect(() => {
    load()
  }, [])

  /* -----------------------------
     CREER FILIERE
  ----------------------------- */

  const createFiliere = async e => {

    e.preventDefault()

    setErr('')
    setLoading(true)

    try {

      const payload = { nom: nomFiliere.trim() }
      if (editingFiliereId) {
        await api.put(`/admin/filieres/${editingFiliereId}`, payload)
      } else {
        await api.post('/admin/filieres', payload)
      }

      setModalF(false)
      setNomFiliere('')
      setEditingFiliereId(null)

      await load()

    } catch (e) {

      console.error(e)

      setErr(
        e.response?.data?.detail ||
        'Une erreur est survenue.'
      )

    } finally {

      setLoading(false)

    }

  }

  /* -----------------------------
     CREER CLASSE
  ----------------------------- */

  const createClasse = async e => {

    e.preventDefault()

    setErr('')
    setLoading(true)

    try {

      const payload = {
        nom: formClasse.nom.trim(),
        filiere_id: parseInt(formClasse.filiere_id, 10),
        niveau: parseInt(formClasse.niveau, 10),
      }

      if (editingClasseId) {
        await api.put(`/admin/classes/${editingClasseId}`, payload)
      } else {
        await api.post('/admin/classes', payload)
      }

      setModalC(false)

      setFormClasse({
        nom: '',
        niveau: 1,
        filiere_id: '',
      })
      setEditingClasseId(null)

      await load()

    } catch (e) {

      console.error(e)

      setErr(
        e.response?.data?.detail ||
        'Une erreur est survenue.'
      )

    } finally {

      setLoading(false)

    }

  }

  /* -----------------------------
     SUPPRIMER FILIERE
  ----------------------------- */

  const delFiliere = async id => {

    if (
      !confirm(
        'Supprimer cette filière ?'
      )
    ) {
      return
    }

    try {

      await api.delete(
        `/admin/filieres/${id}`
      )

      await load()

    } catch (e) {

      console.error(e)

      alert(
        e.response?.data?.detail ||
        'Impossible de supprimer cette filière.'
      )

    }

  }

  const openEditFiliere = (f) => {
    setEditingFiliereId(f.id)
    setNomFiliere(f.nom || '')
    setModalF(true)
  }

  const openEditClasse = (c) => {
    setEditingClasseId(c.id)
    setFormClasse({
      nom: c.nom || '',
      niveau: c.niveau || 1,
      filiere_id: c.filiere_id ? String(c.filiere_id) : '',
    })
    setModalC(true)
  }

  const delClasse = async id => {
    if (!confirm('Supprimer cette classe ?')) return
    try {
      await api.delete(`/admin/classes/${id}`)
      await load()
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.detail || 'Impossible de supprimer cette classe.')
    }
  }

  return (

    <div className="animate-fadeUp">

      <PageHeader
        title="Filières et classes"
        subtitle="Gestion des filières et des classes"
        action={

          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >

            <Btn
              variant="ghost"
              onClick={() => {

                setErr('')
                setModalC(true)

              }}
            >
              + Classe
            </Btn>

            <Btn
              onClick={() => {

                setErr('')
                setModalF(true)

              }}
            >
              + Filière
            </Btn>

          </div>

        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 20,
        }}
      >

        {/* FILIERES */}

        <Card>

          <h2
            style={{
              fontFamily:
                'var(--font-display)',
              fontWeight: 600,
              fontSize: 17,
              marginBottom: 16,
              color: '#111111',
            }}
          >
            Filières
          </h2>

          <Table
            headers={[
              'Nom',
              'Classes',
              'Actions'
            ]}
            rows={filieres.map(f => [

              <span
                key={`name-${f.id}`}
                style={{
                  fontWeight: 600,
                  color: '#111111',
                }}
              >
                {f.nom}
              </span>,

              <Badge
                key={`count-${f.id}`}
                color="var(--accent)"
              >
                {f.nb_classes}
              </Badge>,

              <div key={`actions-f-${f.id}`} style={{ display: 'flex', gap: 8 }}>
                <Btn size="sm" onClick={() => openEditFiliere(f)}>
                  Modifier
                </Btn>
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    delFiliere(f.id)
                  }
                >
                  Supprimer
                </Btn>
              </div>,

            ])}
            emptyMsg="Aucune filière"
          />

        </Card>

        {/* CLASSES */}

        <Card>

          <h2
            style={{
              fontFamily:
                'var(--font-display)',
              fontWeight: 600,
              fontSize: 17,
              marginBottom: 16,
              color: '#111111',
            }}
          >
            Classes
          </h2>

          <Table
            headers={[
              'Classe',
              'Niveau',
              'Filière',
              'Étudiants',
              'Actions'
            ]}
            rows={classes.map(c => [

              <span
                key={`name-${c.id}`}
                style={{
                  fontWeight: 600,
                  color: '#111111',
                }}
              >
                {c.nom}
              </span>,

              <Badge
                key={`niveau-${c.id}`}
                color="var(--accent-orange)"
              >
                Niveau {c.niveau}
              </Badge>,

              <span
                key={`filiere-${c.id}`}
                style={{
                  color: '#222222',
                }}
              >
                {c.filiere_nom}
              </span>,

              <Badge
                key={`students-${c.id}`}
                color="var(--accent-green)"
              >
                {c.nb_etudiants}
              </Badge>,

              <div key={`actions-c-${c.id}`} style={{ display: 'flex', gap: 8 }}>
                <Btn size="sm" onClick={() => openEditClasse(c)}>
                  Modifier
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => delClasse(c.id)}>
                  Supprimer
                </Btn>
              </div>,

            ])}
            emptyMsg="Aucune classe"
          />

        </Card>

      </div>

      {/* =========================
          MODAL FILIERE
      ========================= */}

      <Modal
        open={modalF}
        onClose={() => {

          if (!loading) {
            setModalF(false)
            setErr('')
          }

        }}
        title={editingFiliereId ? 'Modifier la filière' : 'Nouvelle filière'}
      >

        <form
          onSubmit={createFiliere}
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: 14,
          }}
        >

          <Input
            label="Nom de la filière"
            placeholder="Exemple : IL, MGSI"
            value={nomFiliere}
            onChange={e =>
              setNomFiliere(
                e.target.value
              )
            }
            required
          />

          <Alert message={err} />

          <Btn
            type="submit"
            loading={loading}
          >
            {editingFiliereId ? 'Enregistrer les modifications' : 'Créer la filière'}
          </Btn>

        </form>

      </Modal>

      {/* =========================
          MODAL CLASSE
      ========================= */}

      <Modal
        open={modalC}
        onClose={() => {

          if (!loading) {
            setModalC(false)
            setErr('')
          }

        }}
        title={editingClasseId ? 'Modifier la classe' : 'Nouvelle classe'}
      >

        <form
          onSubmit={createClasse}
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: 14,
          }}
        >

          <Input
            label="Nom de la classe"
            placeholder="Exemple : IL-1"
            value={formClasse.nom}
            onChange={e =>
              setFormClasse(
                f => ({
                  ...f,
                  nom: e.target.value,
                })
              )
            }
            required
          />

          <Select
            label="Niveau"
            value={formClasse.niveau}
            onChange={e =>
              setFormClasse(
                f => ({
                  ...f,
                  niveau:
                    e.target.value,
                })
              )
            }
          >

            <option value="1">
              Niveau 1
            </option>

            <option value="2">
              Niveau 2
            </option>

            <option value="3">
              Niveau 3
            </option>

          </Select>

          <Select
            label="Filière"
            value={
              formClasse.filiere_id
            }
            onChange={e =>
              setFormClasse(
                f => ({
                  ...f,
                  filiere_id:
                    e.target.value,
                })
              )
            }
            required
          >

            <option value="">
              Sélectionner une filière
            </option>

            {filieres.map(f => (

              <option
                key={f.id}
                value={f.id}
              >
                {f.nom}
              </option>

            ))}

          </Select>

          <Alert message={err} />

          <Btn
            type="submit"
            loading={loading}
          >
            {editingClasseId ? 'Enregistrer les modifications' : 'Créer la classe'}
          </Btn>

        </form>

      </Modal>

    </div>

  )
}

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({
  title,
  subtitle,
  action
}) {

  return (

    <div
      style={{
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems:
          'flex-end',
        gap: 20,
        marginBottom: 26,
      }}
    >

      <div>

        <h1
          style={{
            fontFamily:
              'var(--font-display)',
            fontWeight: 700,
            fontSize: 24,
            margin: 0,
            color: '#111111',
          }}
        >
          {title}
        </h1>

        {subtitle && (

          <p
            style={{
              color: '#333333',
              fontSize: 13,
              margin:
                '7px 0 0',
            }}
          >
            {subtitle}
          </p>

        )}

      </div>

      {action}

    </div>

  )
}