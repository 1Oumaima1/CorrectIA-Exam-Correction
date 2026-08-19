import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  Card,
  StatCard,
  Table,
  Badge,
  Alert,
  Spinner,
} from '../components/UI'
import api from '../services/api'

const NAV = [
  {
    path: '/etudiant',
    label: 'Mes résultats',
  },
]

export default function EtudiantDashboard() {
  return (
    <Layout
      navItems={NAV}
      title="Espace Étudiant"
    >
      <Routes>
        <Route
          index
          element={<EtuHome />}
        />
      </Routes>
    </Layout>
  )
}

/* =========================================================
   TABLEAU DE BORD ÉTUDIANT
========================================================= */

function EtuHome() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  /* -----------------------------
     CHARGEMENT
  ----------------------------- */

  useEffect(() => {
    api
      .get('/etudiant/dashboard')
      .then(r => {
        setData(r.data)
      })
      .catch(err => {
        console.error(
          'Erreur dashboard étudiant:',
          err
        )

        setError(
          err.response?.data?.detail ||
          'Impossible de charger vos résultats.'
        )
      })
  }, [])

  /* -----------------------------
     LOADING
  ----------------------------- */

  if (!data && !error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <Spinner />
      </div>
    )
  }

  /* -----------------------------
     ERROR
  ----------------------------- */

  if (error) {
    return (
      <div className="animate-fadeUp">
        <Alert message={error} />
      </div>
    )
  }

  const { etudiant, resultats } = data

  /* -----------------------------
     CALCULS
  ----------------------------- */

  const notes = resultats.filter(
    r =>
      r.note !== null &&
      r.note !== undefined
  )

  const moyenne =
    notes.length > 0
      ? (
          notes.reduce(
            (sum, r) =>
              sum + Number(r.note),
            0
          ) / notes.length
        ).toFixed(2)
      : null

  const valides = resultats.filter(
    r => r.valide === true
  ).length

  const nonCorriges =
    resultats.filter(
      r =>
        r.note === null ||
        r.note === undefined
    ).length

  return (
    <div className="animate-fadeUp">

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          marginBottom: 30,
        }}
      >
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
          Bonjour, {etudiant.prenom}
        </h1>

        <p
          style={{
            color: '#333333',
            fontSize: 14,
            marginTop: 7,
            marginBottom: 0,
          }}
        >
          {etudiant.classe}
          {' — '}
          {etudiant.filiere}
          {' · '}
          CNE :{' '}

          <code
            style={{
              fontSize: 13,
              color: '#222222',
            }}
          >
            {etudiant.cne}
          </code>
        </p>
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
          marginBottom: 30,
        }}
      >

        <StatCard
          label="Examens passés"
          value={resultats.length}
          color="var(--accent)"
        />

        <StatCard
          label="Moyenne générale"
          value={
            moyenne !== null
              ? moyenne + '/20'
              : '—'
          }
          color="var(--accent-green)"
        />

        <StatCard
          label="Examens validés"
          value={valides}
          color="var(--accent-2)"
        />

        <StatCard
          label="Non corrigés"
          value={nonCorriges}
          color="var(--accent-orange)"
        />

      </div>

      {/* =================================================
          MES NOTES
      ================================================= */}

      <div
        style={{
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontFamily:
              'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            margin: 0,
            color: '#111111',
          }}
        >
          Mes notes
        </h2>

        <p
          style={{
            color: '#333333',
            fontSize: 13,
            margin:
              '7px 0 0',
          }}
        >
          Liste de vos examens et résultats
        </p>
      </div>

      {/* =================================================
          RÉSULTATS
      ================================================= */}

      {resultats.length === 0 ? (

        <Card
          style={{
            textAlign: 'center',
            padding: 48,
            color:
              'var(--text-muted)',
          }}
        >
          Aucun résultat disponible
          pour l'instant
        </Card>

      ) : (

        <Card>

          <Table
            headers={[
              'Examen',
              'Module',
              'Semestre',
              'Note',
              'Statut',
              'Certitude',
            ]}

            rows={resultats.map(
              (r, i) => [

                /* EXAMEN */

                <span
                  key={
                    'titre-' + i
                  }
                  style={{
                    fontWeight: 600,
                    color: '#111111',
                  }}
                >
                  {r.titre}
                </span>,

                /* MODULE */

                <span
                  key={
                    'module-' + i
                  }
                  style={{
                    color: '#222222',
                  }}
                >
                  {r.module}
                </span>,

                /* SEMESTRE */

                <Badge
                  key={
                    'semestre-' + i
                  }
                  color="var(--accent)"
                >
                  S{r.semestre}
                </Badge>,

                /* NOTE */

                r.note !== null &&
                r.note !== undefined ? (

                  <span
                    key={
                      'note-' + i
                    }
                    style={{
                      fontFamily:
                        'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 17,
                      color:
                        Number(r.note) >= 10
                          ? 'var(--accent-green)'
                          : 'var(--accent-red)',
                    }}
                  >
                    {Number(
                      r.note
                    ).toFixed(2)}

                    <span
                      style={{
                        fontSize: 11,
                        color:
                          'var(--text-dim)',
                        fontWeight: 500,
                        marginLeft: 2,
                      }}
                    >
                      /20
                    </span>
                  </span>

                ) : (

                  <span
                    key={
                      'note-' + i
                    }
                    style={{
                      color:
                        'var(--text-dim)',
                      fontSize: 13,
                    }}
                  >
                    Non corrigé
                  </span>

                ),

                /* STATUT */

                r.note === null ||
                r.note === undefined ? (

                  <Badge
                    key={
                      'status-' + i
                    }
                    color="var(--accent-orange)"
                  >
                    En attente
                  </Badge>

                ) : r.valide ? (

                  <Badge
                    key={
                      'status-' + i
                    }
                    color="var(--accent-green)"
                  >
                    Validée
                  </Badge>

                ) : (

                  <Badge
                    key={
                      'status-' + i
                    }
                    color="var(--accent-red)"
                  >
                    Non validée
                  </Badge>

                ),

                /* CERTITUDE */

                r.certitude !== null &&
                r.certitude !== undefined ? (

                  <Badge
                    key={
                      'certitude-' + i
                    }
                    color="var(--text-muted)"
                  >
                    {(
                      Number(
                        r.certitude
                      ) * 100
                    ).toFixed(0)}
                    %
                  </Badge>

                ) : (

                  <span
                    key={
                      'certitude-' + i
                    }
                    style={{
                      color:
                        'var(--text-dim)',
                      fontSize: 13,
                    }}
                  >
                    —
                  </span>

                ),

              ]
            )}

            emptyMsg="Aucun résultat"
          />

        </Card>
      )}

    </div>
  )
}