import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../data/questions'
import { getAllProgress } from '../services/storage'
import { computeStatut } from '../services/spacedRepetition'
import CategoryBadge from '../components/CategoryBadge'

export default function Mistakes() {
  const navigate = useNavigate()
  const [refreshKey] = useState(0)

  const items = useMemo(() => {
    const progress = getAllProgress()
    return QUESTIONS.filter((q) => {
      const p = progress[q.id]
      return p && computeStatut(p) === 'a_revoir'
    }).map((q) => ({ question: q, progress: progress[q.id] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const ids = items.map((i) => i.question.id)

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Mes erreurs</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {items.length} question{items.length !== 1 ? 's' : ''} à revoir
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Aucune question à revoir pour le moment. Faites une session pour commencer votre suivi.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/qcm', { state: { questionIds: ids, title: 'Mes erreurs' } })}
              className="rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-primary-text)]"
            >
              Réviser en QCM
            </button>
            <button
              type="button"
              onClick={() => navigate('/libre', { state: { questionIds: ids, title: 'Mes erreurs' } })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-sm font-semibold text-[var(--color-text)]"
            >
              Réviser en libre
            </button>
          </div>

          <div className="space-y-3">
            {items.map(({ question, progress }) => {
              const totalRep = progress.bonnesReponses + progress.mauvaisesReponses + progress.reponsesPartielles
              const taux = totalRep > 0 ? Math.round((progress.bonnesReponses / totalRep) * 100) : 0
              return (
                <div key={question.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between">
                    <CategoryBadge categorie={question.categorie} />
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {progress.tentatives} tentative{progress.tentatives > 1 ? 's' : ''} · {taux}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">{question.question}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Réponse officielle : {question.reponse_officielle || 'Voir procédure de vérification.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/qcm', { state: { questionIds: [question.id], title: 'Revoir cette question' } })}
                    className="mt-2 text-sm font-medium text-[var(--color-primary)]"
                  >
                    Revoir cette question →
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
