import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Categorie, Proposition, Question, Session, SessionQuestionResult } from '../types'
import { getQuestionsByCategorie, getQuestionById } from '../data/questions'
import { generateQcmOptions } from '../services/scoring'
import { updateProgressAfterAnswer } from '../services/spacedRepetition'
import { saveSession, toggleMarqueManuelle, getProgress } from '../services/storage'
import { getPreviousSessionOfMode } from '../services/stats'
import CategoryFilter from '../components/CategoryFilter'
import QuestionCard from '../components/QuestionCard'
import QuizOption from '../components/QuizOption'
import ProgressBar from '../components/ProgressBar'
import AnswerCorrection from '../components/AnswerCorrection'
import SessionSummary from '../components/SessionSummary'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const COUNT_OPTIONS = [10, 20, 30] as const

interface LocationState {
  questionIds?: string[]
  title?: string
}

export default function Quiz() {
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const [phase, setPhase] = useState<'setup' | 'running' | 'summary'>('setup')
  const [categorie, setCategorie] = useState<Categorie | 'toutes'>('toutes')
  const [nombre, setNombre] = useState<number | 'toutes'>(10)
  const [alea, setAlea] = useState(true)
  const [customTitle, setCustomTitle] = useState<string | null>(null)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentOptions, setCurrentOptions] = useState<Proposition[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Proposition | null>(null)
  const [validated, setValidated] = useState(false)
  const [results, setResults] = useState<SessionQuestionResult[]>([])
  const [startTime, setStartTime] = useState(Date.now())
  const [session, setSession] = useState<Session | null>(null)
  const [marque, setMarque] = useState(false)

  const disponibles = useMemo(() => getQuestionsByCategorie(categorie).filter((q) => q.gradable), [categorie])

  function launch(qs: Question[], title?: string) {
    if (qs.length === 0) return
    setQuestions(qs)
    setIndex(0)
    setResults([])
    setSelected(null)
    setValidated(false)
    setMarque(getProgress(qs[0].id).marqueManuellement)
    setCurrentOptions(generateQcmOptions(qs[0]))
    setStartTime(Date.now())
    setCustomTitle(title ?? null)
    setPhase('running')
  }

  useEffect(() => {
    if (state?.questionIds && state.questionIds.length > 0) {
      const qs = state.questionIds
        .map((id) => getQuestionById(id))
        .filter((q): q is Question => !!q && q.gradable)
      launch(qs, state.title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = questions[index]

  function handleStartFromSetup() {
    let selectedQuestions = alea ? shuffle(disponibles) : [...disponibles]
    if (nombre !== 'toutes') selectedQuestions = selectedQuestions.slice(0, nombre)
    launch(selectedQuestions)
  }

  function handleValidate() {
    if (!current || !selected) return
    const resultat = selected.correcte ? 'correct' : 'incorrect'
    updateProgressAfterAnswer(current.id, resultat)
    setResults((r) => [
      ...r,
      {
        questionId: current.id,
        categorie: current.categorie,
        question: current.question,
        reponseUtilisateur: selected.texte,
        reponseOfficielle: current.reponse_officielle,
        resultat,
      },
    ])
    setValidated(true)
  }

  function handleNext() {
    const nextIndex = index + 1
    if (nextIndex >= questions.length) {
      finishSession()
      return
    }
    setIndex(nextIndex)
    setSelected(null)
    setValidated(false)
    setMarque(getProgress(questions[nextIndex].id).marqueManuellement)
    setCurrentOptions(generateQcmOptions(questions[nextIndex]))
  }

  function finishSession() {
    const duree = Math.round((Date.now() - startTime) / 1000)
    const bonnes = results.filter((r) => r.resultat === 'correct').length
    const mauvaises = results.filter((r) => r.resultat === 'incorrect').length
    const partielles = results.filter((r) => r.resultat === 'partiel').length
    const s: Session = {
      id: `s-${Date.now()}`,
      date: new Date().toISOString(),
      mode: 'qcm',
      categories: [...new Set(results.map((r) => r.categorie))],
      nombreQuestions: results.length,
      bonnesReponses: bonnes,
      mauvaisesReponses: mauvaises,
      reponsesPartielles: partielles,
      duree,
      questions: results,
    }
    saveSession(s)
    setSession(s)
    setPhase('summary')
  }

  function handleToggleMarque() {
    if (!current) return
    const p = toggleMarqueManuelle(current.id)
    setMarque(p.marqueManuellement)
  }

  if (phase === 'setup') {
    return (
      <div className="space-y-6 pb-4">
        <header>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)]">📝 QCM</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Choisissez vos options avant de commencer.</p>
        </header>

        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">Catégorie</h2>
          <CategoryFilter value={categorie} onChange={setCategorie} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">Nombre de questions</h2>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNombre(n)}
                className={`rounded-full px-4 py-2 text-sm font-medium border ${
                  nombre === n
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setNombre('toutes')}
              className={`rounded-full px-4 py-2 text-sm font-medium border ${
                nombre === 'toutes'
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]'
              }`}
            >
              Toutes ({disponibles.length})
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text)]">
          <input type="checkbox" checked={alea} onChange={(e) => setAlea(e.target.checked)} className="h-5 w-5" />
          Questions aléatoires
        </label>

        <button
          type="button"
          disabled={disponibles.length === 0}
          onClick={handleStartFromSetup}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-base font-semibold text-[var(--color-primary-text)] disabled:opacity-50"
        >
          Commencer ({Math.min(nombre === 'toutes' ? disponibles.length : nombre, disponibles.length)} questions)
        </button>
      </div>
    )
  }

  if (phase === 'summary' && session) {
    const prev = getPreviousSessionOfMode('qcm')
    return (
      <SessionSummary
        session={session}
        previousSession={prev && prev.id !== session.id ? prev : undefined}
        onRevoirErreurs={() => {
          const ids = session.questions.filter((q) => q.resultat !== 'correct').map((q) => q.questionId)
          const qs = ids.map((id) => getQuestionById(id)).filter((q): q is Question => !!q)
          launch(qs, 'Revoir mes erreurs')
        }}
        onRefaireSession={() => {
          const qs = shuffle(
            session.questions.map((q) => getQuestionById(q.questionId)).filter((q): q is Question => !!q),
          )
          launch(qs, 'Nouvelle tentative')
        }}
        onNouvelleSession={() => {
          setSession(null)
          setPhase('setup')
        }}
      />
    )
  }

  if (!current) return null

  return (
    <div className="space-y-5 pb-4">
      {customTitle && <p className="text-sm font-semibold text-[var(--color-primary)]">{customTitle}</p>}
      <ProgressBar current={index + 1} total={questions.length} />

      <QuestionCard categorie={current.categorie} question={current.question}>
        <button
          type="button"
          onClick={handleToggleMarque}
          className={`mt-3 text-sm font-medium ${marque ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`}
        >
          {marque ? '⭐ Marquée à revoir' : '☆ Marquer à revoir'}
        </button>
      </QuestionCard>

      <div className="space-y-2.5">
        {currentOptions.map((opt, i) => (
          <QuizOption
            key={i}
            texte={opt.texte}
            selected={selected?.texte === opt.texte}
            correcte={opt.correcte}
            revealed={validated}
            disabled={validated}
            onSelect={() => !validated && setSelected(opt)}
          />
        ))}
      </div>

      {validated && (
        <AnswerCorrection
          resultat={selected?.correcte ? 'correct' : 'incorrect'}
          reponseOfficielle={current.reponse_officielle}
        />
      )}

      {!validated ? (
        <button
          type="button"
          disabled={!selected}
          onClick={handleValidate}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-base font-semibold text-[var(--color-primary-text)] disabled:opacity-40"
        >
          Valider
        </button>
      ) : (
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-base font-semibold text-[var(--color-primary-text)]"
        >
          {index + 1 >= questions.length ? 'Voir le bilan' : 'Question suivante →'}
        </button>
      )}
    </div>
  )
}
