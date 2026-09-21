import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { computeGlobalStats } from '../services/stats'
import StatsCard from '../components/StatsCard'

export default function Home() {
  const stats = useMemo(() => computeGlobalStats(), [])

  return (
    <div className="space-y-8 pb-4">
      <header className="pt-2">
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Permis B — Vérifications</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Révisez les questions officielles du permis B à partir de la banque du Ministère de l'Intérieur.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Réviser</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/qcm"
            className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex items-center gap-4 active:bg-[var(--color-border)] transition-colors"
          >
            <span className="text-3xl">📝</span>
            <div>
              <p className="text-base font-bold text-[var(--color-text)]">QCM</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Testez vos connaissances avec des questions à choix multiples.
              </p>
            </div>
          </Link>
          <Link
            to="/libre"
            className="rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex items-center gap-4 active:bg-[var(--color-border)] transition-colors"
          >
            <span className="text-3xl">⌨️</span>
            <div>
              <p className="text-base font-bold text-[var(--color-text)]">Réponse libre</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Répondez aux questions sans propositions de réponses.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-3">Ma progression</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatsCard label="Questions réalisées" value={`${stats.questionsRealisees} / ${stats.totalQuestions}`} />
          <StatsCard
            label="Taux de réussite"
            value={stats.tauxReussiteGlobal !== null ? `${stats.tauxReussiteGlobal}%` : '—'}
            accent="success"
          />
          <StatsCard label="Questions à revoir" value={stats.questionsARevoir} accent="danger" />
          <StatsCard label="Questions maîtrisées" value={stats.questionsMaitrisees} accent="success" />
          <StatsCard label="Sessions réalisées" value={stats.nombreSessions} />
          <Link to="/stats" className="rounded-xl border border-dashed border-[var(--color-border)] p-4 flex items-center justify-center text-sm font-medium text-[var(--color-primary)]">
            Voir toutes les stats →
          </Link>
        </div>
      </section>
    </div>
  )
}
