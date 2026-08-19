import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  FileText,
  Users,
  Building2,
  Bell,
  BookOpen,
  ChevronRight,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'

import {
  Alert,
  Badge,
  Btn,
  Card,
  Input,
  Select,
  Spinner,
  StatCard,
  Table
} from '../components/UI'
import api from '../services/api'

const NAV = [
  { path: '/professeur', label: 'Tableau de bord' },
  { path: '/professeur/examens', label: 'Mes examens' },
  { path: '/professeur/creer', label: 'Créer un examen' },
]

const BLUE = '#2563eb'
const PURPLE = '#7c3aed'
const GREEN = '#059669'
const ORANGE = '#d97706'
const RED = '#dc2626'

const formatNote = value => {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(2)
}

const certitudeLabel = value => {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(0)}%`
}

const gradeColor = value => {
  const n = Number(value)
  if (Number.isNaN(n)) return '#111827'
  if (n >= 14) return GREEN
  if (n >= 10) return ORANGE
  return RED
}

export default function ProfesseurDashboard() {
  return (
    <Layout navItems={NAV} title="Espace Professeur">
      <Routes>
        <Route index element={<ProfHome />} />
        <Route path="examens" element={<MesExamens />} />
        <Route path="creer" element={<CreerExamen />} />
        <Route path="examens/:id/resultats" element={<ResultatsExamen />} />
        <Route path="examens/:id/copies" element={<CopiesExamen />} />
        <Route path="examens/:id/corriger" element={<CorrigerExamen />} />
      </Routes>
    </Layout>
  )
}

function ProfHome() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api
      .get('/professeur/dashboard')
      .then(r => setData(r.data))
      .catch(err => console.error(err))
  }, [])

  if (!data) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </div>
    )
  }

  return (
    <div
      className="animate-fadeUp"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
        }}
      >
        <div>
          <h1
              style={{
                margin: 0,
                color: '#172033',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.7px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Bonjour, {data.professeur.prenom}

              <span
                style={{
                  marginLeft: 9,
                  display: 'inline-flex',
                  color: '#f59e0b',
                }}
              >
                <GraduationCap
                  size={25}
                  strokeWidth={1.8}
                />
              </span>
            </h1>

          <p
            style={{
              margin: '7px 0 0',
              color: '#7b879c',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Notification */}

        <div
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            border: '1px solid #e7ebf2',
            color: '#344054',
          }}
        >
          <Bell size={19} strokeWidth={1.8} />

          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 999,
              background: '#ef4444',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #f6f8fc',
            }}
          >
            3
          </span>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: 18,
        }}
      >

        {/* EXAMENS */}

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e7ebf2',
            borderRadius: 16,
            padding: '22px 24px',
            minHeight: 125,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            boxShadow: '0 3px 12px rgba(16, 24, 40, 0.035)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          {/* Icon */}

          <div
            style={{
              width: 58,
              height: 58,
              flexShrink: 0,
              borderRadius: 18,
              background: '#eef4ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText
              size={27}
              strokeWidth={1.8}
            />
          </div>

          {/* Content */}

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1,
                fontWeight: 800,
                color: '#2563eb',
                marginBottom: 8,
              }}
            >
              {data.nb_examens}
            </div>

            <div
              style={{
                fontSize: 15,
                fontWeight: 750,
                color: '#172033',
                marginBottom: 4,
              }}
            >
              Examens créés
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#8a95a8',
              }}
            >
              Total des examens que vous avez créés
            </div>
          </div>

          {/* Decorative line */}

          <div
            style={{
              position: 'absolute',
              right: 20,
              bottom: 20,
              width: 120,
              height: 45,
              opacity: 0.45,
            }}
          >
            <svg
              width="120"
              height="45"
              viewBox="0 0 120 45"
              fill="none"
            >
              <path
                d="M2 38 C18 27, 27 32, 39 22 C53 10, 59 26, 72 18 C87 9, 94 17, 118 3"
                stroke="#2563eb"
                strokeWidth="1.5"
                fill="none"
              />

              <circle
                cx="118"
                cy="3"
                r="3"
                fill="#2563eb"
              />
            </svg>
          </div>
        </div>

        {/* CLASSES */}

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e7ebf2',
            borderRadius: 16,
            padding: '22px 24px',
            minHeight: 125,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            boxShadow: '0 3px 12px rgba(16, 24, 40, 0.035)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          <div
            style={{
              width: 58,
              height: 58,
              flexShrink: 0,
              borderRadius: 18,
              background: '#eafaf4',
              color: '#16a879',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1,
                fontWeight: 800,
                color: '#16a879',
                marginBottom: 8,
              }}
            >
              {data.nb_classes}
            </div>

            <div
              style={{
                fontSize: 15,
                fontWeight: 750,
                color: '#172033',
                marginBottom: 4,
              }}
            >
              Classes assignées
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#8a95a8',
              }}
            >
              Classes qui vous sont attribuées
            </div>
          </div>

          {/* Decorative line */}

          <div
            style={{
              position: 'absolute',
              right: 20,
              bottom: 20,
              width: 120,
              height: 45,
              opacity: 0.45,
            }}
          >
            <svg
              width="120"
              height="45"
              viewBox="0 0 120 45"
              fill="none"
            >
              <path
                d="M2 39 C15 29, 25 34, 37 23 C50 12, 58 27, 71 18 C84 9, 97 14, 118 4"
                stroke="#16a879"
                strokeWidth="1.5"
                fill="none"
              />

              <circle
                cx="118"
                cy="4"
                r="3"
                fill="#16a879"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* =====================================================
          CLASSES SECTION
      ===================================================== */}

      {data.classes.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e7ebf2',
            borderRadius: 17,
            minHeight: 300,
            padding: '23px 26px',
            boxShadow: '0 3px 12px rgba(16, 24, 40, 0.035)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          {/* Section header */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 800,
                  color: '#172033',
                }}
              >
                Mes classes
              </h2>

              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 12,
                  color: '#8a95a8',
                }}
              >
                Classes qui vous sont assignées
              </p>
            </div>
          </div>

          {/* Classes */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(280px, 340px))',
              gap: 14,
            }}
          >

            {data.classes.map(c => (
              <div
                key={c.id}
                style={{
                  minHeight: 88,
                  borderRadius: 14,
                  border: '1px solid #e3e8f1',
                  borderLeft:
                    '3px solid #4f6df5',
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f9faff 100%)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition:
                    'transform .15s ease, box-shadow .15s ease',
                }}
              >

                {/* Class icon */}

                <div
                  style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: '#eeeefe',
                    color: '#5b5bd6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  {c.nom
                    ? c.nom
                        .substring(0, 2)
                        .toUpperCase()
                    : 'CL'}
                </div>

                {/* Info */}

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#172033',
                      marginBottom: 5,
                    }}
                  >
                    {c.nom}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#8a95a8',
                    }}
                  >
                    Niveau {c.niveau}
                  </div>
                </div>

                {/* Students icon */}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    color: '#7180d8',
                  }}
                >
                  <Users
                    size={17}
                    strokeWidth={1.8}
                  />

                  <span
                    style={{
                      fontSize: 12,
                      color: '#98a2b3',
                    }}
                  >
                    —
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Decorative illustration */}

          <div
            style={{
              position: 'absolute',
              right: 80,
              bottom: 55,
              opacity: 0.22,
              pointerEvents: 'none',
            }}
          >
            <BookOpen
              size={80}
              strokeWidth={1}
              color="#667eea"
            />
          </div>

          {/* Bottom message */}

          <div
            style={{
              position: 'absolute',
              right: 55,
              bottom: 25,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#64748b',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Continuez votre excellent travail !
            <TrendingUp
              size={15}
              color="#f59e0b"
            />
          </div>
        </div>
      )}

    </div>
  )
}

/* =========================================================
   MES EXAMENS
========================================================= */

function MesExamens() {
  const [examens, setExamens] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExamen, setEditingExamen] = useState(null)
  const [editForm, setEditForm] = useState({ titre: '', module: '', semestre: '' })
  const [editClasses, setEditClasses] = useState([])
  const [availableClasses, setAvailableClasses] = useState([])
  const [editLoading, setEditLoading] = useState(false)
  const [editErr, setEditErr] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadExamens()
    loadClasses()
  }, [])

  const loadExamens = () => {
    api
      .get('/professeur/examens')
      .then(r => {
        setExamens(r.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const loadClasses = () => {
    api
      .get('/professeur/dashboard')
      .then(r => setAvailableClasses(r.data.classes))
      .catch(err => console.error(err))
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredExamens = examens.filter(exam => {
    const matchSearch =
      !normalizedSearch ||
      exam.titre.toLowerCase().includes(normalizedSearch) ||
      exam.module.toLowerCase().includes(normalizedSearch)

    const hasCorrection = Boolean(exam.corrige_path)
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'corrige' && hasCorrection) ||
      (statusFilter === 'attente' && !hasCorrection)

    return matchSearch && matchStatus
  })

  const openEditModal = async (exam) => {
    setEditingExamen(exam)
    setEditForm({
      titre: exam.titre,
      module: exam.module,
      semestre: exam.semestre,
    })
    setEditClasses(exam.classes.map(c => c.id))
    setEditErr('')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingExamen(null)
    setEditForm({ titre: '', module: '', semestre: '' })
    setEditClasses([])
    setEditErr('')
  }

  const toggleEditClasse = (id) => {
    setEditClasses(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    
    if (editClasses.length === 0) {
      setEditErr('Veuillez sélectionner au moins une classe')
      return
    }

    setEditErr('')
    setEditLoading(true)

    try {
      const fd = new FormData()
      fd.append('titre', editForm.titre)
      fd.append('module', editForm.module)
      fd.append('semestre', editForm.semestre)
      editClasses.forEach(id => fd.append('classes', id))

      await api.put(
        `/examen/${editingExamen.id}`,
        fd
      )

      setShowEditModal(false)
      loadExamens()
    } catch (e) {
      setEditErr(e.response?.data?.detail || 'Erreur lors de la modification')
    } finally {
      setEditLoading(false)
    }
  }

  const deleteExamen = async (examId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.')) {
      return
    }

    try {
      await api.delete(`/examen/${examId}`)
      loadExamens()
    } catch (e) {
      console.error('Erreur lors de la suppression:', e)
      alert(e.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </div>
    )
  }

  return (
    <div className="animate-fadeUp">

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: '#111827',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.4px',
            }}
          >
            Mes examens
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#667085',
              fontSize: 13,
            }}
          >
            Gérez vos examens et leurs corrections
          </p>
        </div>

        <Btn
          onClick={() =>
            navigate('/professeur/creer')
          }
        >
          + Créer un examen
        </Btn>
      </div>

      {/* EXAMS */}

      <div
        style={{
          display: 'grid',
          gap: 14,
        }}
      >
        <Card
          style={{
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'minmax(210px, 1fr) minmax(190px, 220px)',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <Input
            label="Rechercher un examen"
            placeholder="Titre ou module"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            label="État de correction"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="corrige">Correction disponible</option>
            <option value="attente">Correction manquante</option>
          </Select>
        </Card>

        {examens.length === 0 ? (

          <Card
            style={{
              textAlign: 'center',
              padding: 50,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                margin: '0 auto 14px',
                borderRadius: 12,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BLUE,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              EX
            </div>

            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#172033',
                marginBottom: 5,
              }}
            >
              Aucun examen
            </div>

            <div
              style={{
                color: '#98a2b3',
                fontSize: 13,
              }}
            >
              Vous n'avez créé aucun examen pour le moment.
            </div>
          </Card>

        ) : filteredExamens.length === 0 ? (

          <Card
            style={{
              textAlign: 'center',
              padding: 40,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#172033',
                marginBottom: 5,
              }}
            >
              Aucun examen ne correspond aux filtres
            </div>
            <div
              style={{
                color: '#98a2b3',
                fontSize: 13,
              }}
            >
              Essayez une autre recherche ou réinitialisez l'état de correction.
            </div>
          </Card>

        ) : (

          filteredExamens.map(e => (

            <Card
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: 20,
              }}
            >

              {/* ICON */}

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#eff6ff',
                  color: BLUE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                PDF
              </div>

              {/* INFO */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: '#172033',
                    fontSize: 16,
                    fontWeight: 750,
                  }}
                >
                  {e.titre}
                </div>

                <div
                  style={{
                    color: '#667085',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {e.module} · Semestre {e.semestre}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 7,
                    marginTop: 9,
                    flexWrap: 'wrap',
                  }}
                >
                  {e.classes.map(c => (
                    <Badge
                      key={c.id}
                      color={BLUE}
                    >
                      {c.nom}
                    </Badge>
                  ))}

                  {e.corrige_path ? (
                    <Badge color={GREEN}>
                      Correction disponible
                    </Badge>
                  ) : (
                    <Badge color={ORANGE}>
                      Correction manquante
                    </Badge>
                  )}
                </div>
              </div>

              {/* ACTIONS */}

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      `/professeur/examens/${e.id}/corriger`
                    )
                  }
                >
                  Corriger
                </Btn>

                <Btn
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/professeur/examens/${e.id}/resultats`
                    )
                  }
                >
                  Résultats
                </Btn>

                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditModal(e)}
                >
                  Modifier
                </Btn>

                <Btn
                  size="sm"
                  variant="ghost"
                  style={{ color: RED }}
                  onClick={() => deleteExamen(e.id)}
                >
                  Supprimer
                </Btn>
              </div>

            </Card>

          ))
        )}
      </div>

      {/* MODAL EDIT */}
      {showEditModal && editingExamen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeEditModal}
        >
          <Card
            style={{
              maxWidth: 500,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    margin: 0,
                    color: '#111827',
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  Modifier l'examen
                </h2>
              </div>

              <form
                onSubmit={submitEdit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <Input
                  label="Titre de l'examen"
                  value={editForm.titre}
                  onChange={e =>
                    setEditForm(f => ({
                      ...f,
                      titre: e.target.value,
                    }))
                  }
                  required
                />

                <Input
                  label="Module"
                  value={editForm.module}
                  onChange={e =>
                    setEditForm(f => ({
                      ...f,
                      module: e.target.value,
                    }))
                  }
                  required
                />

                <Select
                  label="Semestre"
                  value={editForm.semestre}
                  onChange={e =>
                    setEditForm(f => ({
                      ...f,
                      semestre: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Sélectionner un semestre
                  </option>
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <option key={s} value={s}>
                      Semestre {s}
                    </option>
                  ))}
                </Select>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: '#344054',
                      fontWeight: 700,
                      marginBottom: 9,
                    }}
                  >
                    Classes concernées
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {availableClasses.map(c => {
                      const selected =
                        editClasses.includes(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            toggleEditClasse(c.id)
                          }
                          style={{
                            padding: '9px 14px',
                            borderRadius: 9,
                            border: selected
                              ? `1px solid ${BLUE}`
                              : '1px solid #d0d5dd',
                            background: selected
                              ? '#eff6ff'
                              : '#ffffff',
                            color: selected
                              ? BLUE
                              : '#667085',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 650,
                            transition: 'all .15s',
                          }}
                        >
                          {c.nom}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Alert message={editErr} />

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Btn
                    type="button"
                    variant="ghost"
                    onClick={closeEditModal}
                  >
                    Annuler
                  </Btn>
                  <Btn
                    type="submit"
                    loading={editLoading}
                  >
                    Enregistrer
                  </Btn>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   CREER EXAMEN
========================================================= */

function CreerExamen() {
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])

  const [form, setForm] = useState({
    titre: '',
    module: '',
    semestre: '',
  })

  const [selectedClasses, setSelectedClasses] = useState([])
  const [pdf, setPdf] = useState(null)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api
      .get('/professeur/dashboard')
      .then(r => setClasses(r.data.classes))
      .catch(err => console.error(err))
  }, [])

  const toggleClasse = id => {
    setSelectedClasses(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const submit = async e => {
    e.preventDefault()

    if (!pdf) {
      setErr('Veuillez sélectionner un fichier PDF')
      return
    }

    if (selectedClasses.length === 0) {
      setErr(
        'Veuillez sélectionner au moins une classe'
      )
      return
    }

    setErr('')
    setLoading(true)

    try {
      const fd = new FormData()

      fd.append('titre', form.titre)
      fd.append('module', form.module)
      fd.append('semestre', form.semestre)

      selectedClasses.forEach(id =>
        fd.append('classes', id)
      )

      fd.append('pdf', pdf)

      await api.post(
        '/examen/creer',
        fd,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      )

      setSuccess(
        'Examen créé avec succès !'
      )

      setTimeout(
        () =>
          navigate('/professeur/examens'),
        1500
      )

    } catch (e) {
      setErr(
        e.response?.data?.detail ||
        'Erreur lors de la création'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="animate-fadeUp"
      style={{
        maxWidth: 650,
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom: 25,
        }}
      >
        <h1
          style={{
            margin: 0,
            color: '#111827',
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Créer un examen
        </h1>

        <p
          style={{
            margin: '6px 0 0',
            color: '#667085',
            fontSize: 13,
          }}
        >
          Ajoutez les informations de l'examen
          et importez le sujet PDF.
        </p>
      </div>

      <Card>

        <form
          onSubmit={submit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >

          <Input
            label="Titre de l'examen"
            value={form.titre}
            onChange={e =>
              setForm(f => ({
                ...f,
                titre: e.target.value,
              }))
            }
            required
          />

          <Input
            label="Module"
            value={form.module}
            onChange={e =>
              setForm(f => ({
                ...f,
                module: e.target.value,
              }))
            }
            required
          />

          <Select
            label="Semestre"
            value={form.semestre}
            onChange={e =>
              setForm(f => ({
                ...f,
                semestre: e.target.value,
              }))
            }
            required
          >
            <option value="">
              Sélectionner un semestre
            </option>

            {[1, 2, 3, 4, 5, 6].map(s => (
              <option
                key={s}
                value={s}
              >
                Semestre {s}
              </option>
            ))}
          </Select>

          {/* CLASSES */}

          <div>

            <label
              style={{
                display: 'block',
                fontSize: 12,
                color: '#344054',
                fontWeight: 700,
                marginBottom: 9,
              }}
            >
              Classes concernées
            </label>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >

              {classes.map(c => {
                const selected =
                  selectedClasses.includes(c.id)

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      toggleClasse(c.id)
                    }
                    style={{
                      padding:
                        '9px 14px',

                      borderRadius: 9,

                      border: selected
                        ? `1px solid ${BLUE}`
                        : '1px solid #d0d5dd',

                      background: selected
                        ? '#eff6ff'
                        : '#ffffff',

                      color: selected
                        ? BLUE
                        : '#667085',

                      cursor: 'pointer',

                      fontSize: 13,
                      fontWeight: 650,

                      transition: 'all .15s',
                    }}
                  >
                    {c.nom}
                  </button>
                )
              })}

            </div>

          </div>

          {/* FILE */}

          <div>

            <label
              style={{
                display: 'block',
                fontSize: 12,
                color: '#344054',
                fontWeight: 700,
                marginBottom: 9,
              }}
            >
              Fichier de l'examen
            </label>

            <div
              style={{
                border:
                  '1px dashed #cbd5e1',
                borderRadius: 12,
                padding: 18,
                background: '#f8fafc',
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={e =>
                  setPdf(
                    e.target.files[0]
                  )
                }
                style={{
                  width: '100%',
                  fontSize: 13,
                  color: '#475467',
                }}
              />

              {pdf && (
                <div
                  style={{
                    marginTop: 9,
                    fontSize: 12,
                    color: GREEN,
                    fontWeight: 600,
                  }}
                >
                  ✓ {pdf.name}
                </div>
              )}
            </div>

          </div>

          <Alert message={err} />

          <Alert
            type="success"
            message={success}
          />

          <Btn
            type="submit"
            loading={loading}
            size="lg"
          >
            Créer l'examen
          </Btn>

        </form>

      </Card>
    </div>
  )
}

/* =========================================================
   RESULTATS
========================================================= */

function ResultatsExamen() {
  const [data, setData] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get(
        `/professeur/examens/${id}/resultats`
      )
      .then(r => setData(r.data))
      .catch(err => console.error(err))
  }, [id])

  if (!data) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
      </div>
    )
  }

  const avg =
    data.resultats.length > 0
      ? (
          data.resultats.reduce(
            (s, r) =>
              s + (r.note || 0),
            0
          ) /
          data.resultats.length
        ).toFixed(2)
      : 'N/A'

  return (
    <div className="animate-fadeUp">

      <div style={{ marginBottom: 25 }}>

        <h1
          style={{
            margin: 0,
            color: '#111827',
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          {data.examen.titre}
        </h1>

        <p
          style={{
            margin: '6px 0 0',
            color: '#667085',
            fontSize: 13,
          }}
        >
          {data.examen.module}
        </p>

      </div>

      {/* STATS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >

        <StatCard
          label="Copies corrigées"
          value={data.resultats.length}
          color={BLUE}
        />

        <StatCard
          label="Moyenne"
          value={`${avg}/20`}
          color={GREEN}
        />

      </div>

      <Card>

        <Table
          headers={[
            'Étudiant',
            'CNE',
            'Note /20',
            'Certitude',
            'Statut',
            'Actions',
          ]}
          rows={data.resultats.map(r => [
            <span
              style={{
                fontWeight: 650,
                color: '#172033',
              }}
            >
              {r.prenom} {r.nom}
            </span>,

            <code
              style={{
                fontSize: 12,
                color: '#667085',
              }}
            >
              {r.cne}
            </code>,

            <span
              style={{
                fontWeight: 750,
                color: gradeColor(r.note),
              }}
            >
              {formatNote(r.note)}
            </span>,

            <span
              style={{
                color: '#667085',
                fontSize: 13,
              }}
            >
              {certitudeLabel(r.certitude)}
            </span>,

            r.valide ? (
              <Badge color={GREEN}>
                Validée
              </Badge>
            ) : (
              <Badge color={ORANGE}>
                En attente
              </Badge>
            ),
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/professeur/examens/${id}/copies`)}
              >
                Voir copie
              </Btn>
            </div>,
          ])}
          emptyMsg="Aucune correction disponible"
        />

      </Card>

    </div>
  )
}

/* =========================================================
   COPIES ET NOTES
========================================================= */

function CopiesExamen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ note_finale: '', certitude: '', valide: false })

  const loadCopies = () => {
    api
      .get(`/professeur/examens/${id}/copies`)
      .then(r => setData(r.data))
      .catch(err => {
        console.error(err)
        setErr(err.response?.data?.detail || 'Erreur lors du chargement des copies')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCopies()
  }, [id])

  const openEditor = copy => {
    setEditing(copy)
    setForm({
      note_finale: copy.note?.note_finale ?? '',
      certitude: copy.note?.certitude ?? '',
      valide: Boolean(copy.note?.valide),
    })
    setErr('')
    setSuccess('')
  }

  const submitNote = async e => {
    e.preventDefault()
    if (!editing) return

    setSaving(true)
    setErr('')
    setSuccess('')

    const noteValue = Number(form.note_finale)
    const certitudeValue = Number(form.certitude)

    if (Number.isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
      setErr('La note doit être comprise entre 0 et 20.')
      setSaving(false)
      return
    }

    if (Number.isNaN(certitudeValue) || certitudeValue < 0 || certitudeValue > 1) {
      setErr('La certitude doit être comprise entre 0 et 1.')
      setSaving(false)
      return
    }

    try {
      await api.put(`/professeur/examens/${id}/etudiants/${editing.etudiant.id}/note`, {
        note_finale: noteValue,
        certitude: certitudeValue,
        valide: form.valide,
      })
      loadCopies()
      setEditing(null)
      setSuccess('Note mise à jour avec succès.')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>
  }

  if (!data) {
    return (
      <Card>
        <Alert message={err || 'Impossible de charger les copies'} />
      </Card>
    )
  }

  return (
    <div className="animate-fadeUp" style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827' }}>{data.examen.titre}</h1>
          <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 13 }}>{data.examen.module} · {data.examen.semestre}</p>
        </div>
        <Btn variant="ghost" onClick={() => navigate(`/professeur/examens/${id}/resultats`)}>Retour aux résultats</Btn>
      </div>

      <Alert type="success" message={success} />
      <Alert message={err} />

      {data.copies.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 26, color: '#667085' }}>Aucune copie disponible pour cet examen.</div>
        </Card>
      ) : (
        data.copies.map(copy => (
          <Card key={copy.id} style={{ padding: 20 }}>
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(220px, 300px) 1fr', alignItems: 'start' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb', overflow: 'hidden' }}>
                <div style={{ background: '#eef2ff', padding: '10px 12px', fontWeight: 700, color: '#1f2937' }}>
                  {copy.etudiant.prenom} {copy.etudiant.nom}
                </div>
                <div style={{ padding: 12, fontSize: 13, color: '#475467' }}>
                  <div><strong>CNE:</strong> {copy.etudiant.cne}</div>
                  <div><strong>Classe:</strong> {copy.etudiant.classe || '—'}</div>
                  <div><strong>Note:</strong> {formatNote(copy.note?.note_finale)} / 20</div>
                  <div><strong>Certitude:</strong> {certitudeLabel(copy.note?.certitude)}</div>
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                  <a href={copy.pdf_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: BLUE, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>
                    Ouvrir la copie
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#172033' }}>Évaluation</div>
                  <Btn size="sm" variant="ghost" onClick={() => openEditor(copy)}>Modifier note</Btn>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#667085', fontWeight: 700 }}>Note</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: gradeColor(copy.note?.note_finale) }}>{formatNote(copy.note?.note_finale)}</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#667085', fontWeight: 700 }}>Certitude</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{certitudeLabel(copy.note?.certitude)}</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#667085', fontWeight: 700 }}>Statut</div>
                    <div style={{ marginTop: 8 }}>{copy.note?.valide ? <Badge color={GREEN}>Validée</Badge> : <Badge color={ORANGE}>En attente</Badge>}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {editing && (
        <Card style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 18, color: '#111827' }}>Modifier la note</h3>
          <form onSubmit={submitNote} style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
            <Input
              label="Note /20"
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={form.note_finale}
              onChange={e => setForm(f => ({ ...f, note_finale: e.target.value }))}
            />
            <Input
              label="Certitude (0 à 1)"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.certitude}
              onChange={e => setForm(f => ({ ...f, certitude: e.target.value }))}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#344054' }}>
              <input type="checkbox" checked={form.valide} onChange={e => setForm(f => ({ ...f, valide: e.target.checked }))} />
              Validation finale
            </label>
            <Alert message={err} />
            <Alert type="success" message={success} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn type="button" variant="ghost" onClick={() => setEditing(null)}>Annuler</Btn>
              <Btn type="submit" loading={saving}>Enregistrer</Btn>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

/* =========================================================
   CORRIGER EXAMEN
========================================================= */

function CorrigerExamen() {
  const { id } = useParams()

  const navigate = useNavigate()

  const [corrige, setCorrige] =
    useState(null)

  const [copies, setCopies] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [err, setErr] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const submit = async e => {
    e.preventDefault()

    if (
      !corrige ||
      !copies ||
      copies.length === 0
    ) {
      setErr(
        'Veuillez sélectionner tous les fichiers'
      )
      return
    }

    setErr('')
    setLoading(true)

    try {

      const fd =
        new FormData()

      fd.append(
        'corrige',
        corrige
      )

      Array.from(copies).forEach(
        f =>
          fd.append(
            'copies',
            f
          )
      )

      await api.post(
        `/examen/${id}/upload-correction`,
        fd,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      )

      setSuccess(
        `Correction lancée avec succès (${copies.length} copie(s)).`
      )

      setTimeout(
        () =>
          navigate(
            `/professeur/examens/${id}/resultats`
          ),
        2000
      )

    } catch (e) {

      setErr(
        e.response?.data?.detail ||
        'Erreur lors de la correction'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="animate-fadeUp"
      style={{
        maxWidth: 620,
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom: 25,
        }}
      >

        <h1
          style={{
            margin: 0,
            color: '#111827',
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Corriger l'examen
        </h1>

        <p
          style={{
            margin: '7px 0 0',
            color: '#667085',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Importez le corrigé professeur et
          les copies étudiantes. Les copies
          doivent être nommées par CNE.
        </p>

      </div>

      <Card>

        <form
          onSubmit={submit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >

          {/* CORRIGE */}

          <FileUpload
            label="Corrigé type"
            description="Fichier PDF du corrigé professeur"
            file={corrige}
            onChange={e =>
              setCorrige(
                e.target.files[0]
              )
            }
            multiple={false}
          />

          {/* COPIES */}

          <FileUpload
            label="Copies étudiantes"
            description="Plusieurs fichiers PDF · nommés par CNE"
            fileCount={
              copies?.length || 0
            }
            fileNames={
              copies ? Array.from(copies).map(f => f.name) : []
            }
            onChange={e =>
              setCopies(
                e.target.files
              )
            }
            multiple
          />

          <Alert message={err} />

          <Alert
            type="success"
            message={success}
          />

          <Btn
            type="submit"
            disabled={
              !corrige || !copies || copies.length === 0
            }
            loading={loading}
            size="lg"
          >
            Lancer la correction IA
          </Btn>

        </form>

      </Card>
    </div>
  )
}

/* =========================================================
   FILE UPLOAD
========================================================= */

function FileUpload({
  label,
  description,
  file,
  fileCount,
  fileNames,
  onChange,
  multiple,
}) {
  return (
    <div>

      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 700,
          color: '#344054',
          marginBottom: 8,
        }}
      >
        {label}
      </label>

      <div
        style={{
          border:
            '1px dashed #cbd5e1',
          borderRadius: 12,
          background: '#f8fafc',
          padding: 18,
        }}
      >

        <div
          style={{
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#172033',
            }}
          >
            {description}
          </div>
        </div>

        <input
          type="file"
          accept=".pdf"
          multiple={multiple}
          onChange={onChange}
          style={{
            width: '100%',
            fontSize: 13,
            color: '#475467',
          }}
        />

        {file && (
          <div
            style={{
              marginTop: 9,
              color: GREEN,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✓ {file.name}
          </div>
        )}

        {fileCount > 0 && (
          <div
            style={{
              marginTop: 9,
              color: GREEN,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✓ {fileCount} fichier(s)
            sélectionné(s)
          </div>
        )}

        {fileNames?.length > 0 && (
          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gap: 6,
            }}
          >
            {fileNames.slice(0, 4).map(name => (
              <div
                key={name}
                style={{
                  fontSize: 12,
                  color: '#475467',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '5px 8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
            ))}
            {fileNames.length > 4 && (
              <div
                style={{
                  fontSize: 11,
                  color: '#98a2b3',
                  fontWeight: 600,
                }}
              >
                + {fileNames.length - 4} autre(s) fichier(s)
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}