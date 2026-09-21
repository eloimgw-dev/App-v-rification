import type { ResultatReponse } from '../types'

interface Props {
  resultat: ResultatReponse
  reponseOfficielle: string
  elementsCorrects?: string[]
  elementsManquants?: string[]
  note?: string
}

const CONFIG: Record<ResultatReponse, { icon: string; label: string; bg: string; border: string }> = {
  correct: {
    icon: '🟢',
    label: 'Bonne réponse',
    bg: 'bg-[var(--color-success-bg)]',
    border: 'border-[var(--color-success)]',
  },
  partiel: {
    icon: '🟠',
    label: 'Partiellement correct',
    bg: 'bg-[var(--color-warning-bg)]',
    border: 'border-[var(--color-warning)]',
  },
  incorrect: {
    icon: '🔴',
    label: 'Mauvaise réponse',
    bg: 'bg-[var(--color-danger-bg)]',
    border: 'border-[var(--color-danger)]',
  },
}

export default function AnswerCorrection({
  resultat,
  reponseOfficielle,
  elementsCorrects,
  elementsManquants,
  note,
}: Props) {
  const cfg = CONFIG[resultat]
  return (
    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4 space-y-3`}>
      <p className="text-lg font-bold text-[var(--color-text)]">
        {cfg.icon} {cfg.label}
      </p>

      {elementsCorrects && elementsCorrects.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Ce qui était correct</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-[var(--color-text)]">
            {elementsCorrects.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {elementsManquants && elementsManquants.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Ce qui manque</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-[var(--color-text)]">
            {elementsManquants.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {resultat === 'correct' ? 'Réponse officielle' : 'La bonne réponse était :'}
        </p>
        <p className="mt-1 text-[15px] text-[var(--color-text)]">{reponseOfficielle || 'Voir procédure ci-dessus.'}</p>
      </div>

      {note && (
        <p className="text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2">
          ℹ️ {note}
        </p>
      )}
    </div>
  )
}
