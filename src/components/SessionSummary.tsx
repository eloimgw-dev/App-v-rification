import type { Session } from '../types'
import { CATEGORIE_LABELS, CATEGORIES } from '../types'
import CategoryBadge from './CategoryBadge'

interface Props {
  session: Session
  previousSession?: Session
  onRevoirErreurs: () => void
  onRefaireSession: () => void
  onNouvelleSession: () => void
}

function formatDuree(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m} min ${s}s` : `${s}s`
}

export default function SessionSummary({
  session,
  previousSession,
  onRevoirErreurs,
  onRefaireSession,
  onNouvelleSession,
}: Props) {
  const total = session.nombreQuestions
  const pourcentage = total > 0 ? Math.round((session.bonnesReponses / total) * 100) : 0
  const mistakes = session.questions.filter((q) => q.resultat !== 'correct')
  const maitrisees = session.questions.filter((q) => q.resultat === 'correct')

  const parCategorie = CATEGORIES.map((cat) => {
    const qs = session.questions.filter((q) => q.categorie === cat)
    if (qs.length === 0) return null
    const bonnes = qs.filter((q) => q.resultat === 'correct').length
    return { cat, total: qs.length, pct: Math.round((bonnes / qs.length) * 100) }
  }).filter((x): x is { cat: (typeof CATEGORIES)[number]; total: number; pct: number } => x !== null)

  const prevPct =
    previousSession && previousSession.nombreQuestions > 0
      ? Math.round((previousSession.bonnesReponses / previousSession.nombreQuestions) * 100)
      : null
  const diff = prevPct !== null ? pourcentage - prevPct : null

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2">
        <p className="text-3xl">🎉</p>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Session terminée</h1>
        <p className="text-4xl font-extrabold text-[var(--color-primary)]">
          {session.bonnesReponses} / {total}
        </p>
        <p className="text-lg font-semibold text-[var(--color-text-muted)]">{pourcentage} % de réussite</p>
      </div>

      {diff !== null && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
          <p className="text-sm font-semibold text-[var(--color-text)]">Progression</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Session précédente : {prevPct}% · Session actuelle : {pourcentage}%
          </p>
          <p
            className={`mt-1 text-lg font-bold ${diff >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
          >
            {diff >= 0 ? '+' : ''}
            {diff} points
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SummaryStat label="Bonnes réponses" value={session.bonnesReponses} accent="success" />
        <SummaryStat label="Mauvaises réponses" value={session.mauvaisesReponses} accent="danger" />
        <SummaryStat label="Réponses partielles" value={session.reponsesPartielles} accent="warning" />
        <SummaryStat label="Durée" value={formatDuree(session.duree)} />
        <SummaryStat label="Questions à revoir" value={mistakes.length} accent="danger" />
        <SummaryStat label="Questions maîtrisées" value={maitrisees.length} accent="success" />
      </div>

      {parCategorie.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Résultats par catégorie</h2>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {parCategorie.map(({ cat, total: t, pct }) => (
              <div key={cat} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-[var(--color-text)]">{CATEGORIE_LABELS[cat]}</span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {t} question{t > 1 ? 's' : ''} · <span className="font-semibold">{pct}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mistakes.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)] mb-2">🔴 Questions à revoir</h2>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <CategoryBadge categorie={m.categorie} />
                <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">{m.question}</p>
                {m.reponseUtilisateur && (
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Votre réponse : <span className="italic">{m.reponseUtilisateur}</span>
                  </p>
                )}
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  Réponse officielle : {m.reponseOfficielle || 'Voir procédure.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2">
        {mistakes.length > 0 && (
          <button
            type="button"
            onClick={onRevoirErreurs}
            className="w-full rounded-xl bg-[var(--color-danger)] py-3.5 text-base font-semibold text-white active:opacity-90"
          >
            🔴 Revoir mes erreurs
          </button>
        )}
        <button
          type="button"
          onClick={onRefaireSession}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 text-base font-semibold text-[var(--color-text)] active:bg-[var(--color-border)]"
        >
          🔄 Refaire la session
        </button>
        <button
          type="button"
          onClick={onNouvelleSession}
          className="w-full rounded-xl bg-[var(--color-primary)] py-3.5 text-base font-semibold text-[var(--color-primary-text)] active:opacity-90"
        >
          ▶️ Nouvelle session
        </button>
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: 'success' | 'warning' | 'danger'
}) {
  const color = accent
    ? {
        success: 'text-[var(--color-success)]',
        warning: 'text-[var(--color-warning)]',
        danger: 'text-[var(--color-danger)]',
      }[accent]
    : 'text-[var(--color-text)]'
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
