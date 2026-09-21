import { useMemo, useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { getAllProgress } from '../services/storage'
import { computeStatut } from '../services/spacedRepetition'
import type { Categorie } from '../types'
import CategoryFilter from '../components/CategoryFilter'
import CategoryBadge from '../components/CategoryBadge'

const STATUT_ICON: Record<string, string> = {
  maitrisee: '🟢',
  a_revoir: '🟠',
  en_cours: '🔵',
  nouveau: '⚪',
}

const STATUT_LABEL: Record<string, string> = {
  maitrisee: 'Maîtrisée',
  a_revoir: 'À revoir',
  en_cours: 'En cours',
  nouveau: 'Jamais réalisée',
}

export default function AllQuestions() {
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState<Categorie | 'toutes'>('toutes')

  const progress = useMemo(() => getAllProgress(), [])

  const items = useMemo(() => {
    const term = search.trim().toLowerCase()
    return QUESTIONS.filter((q) => categorie === 'toutes' || q.categorie === categorie).filter(
      (q) =>
        term === '' ||
        q.question.toLowerCase().includes(term) ||
        q.reponse_officielle.toLowerCase().includes(term),
    )
  }, [search, categorie])

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Toutes les questions</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{QUESTIONS.length} questions dans la banque</p>
      </header>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher (ex : pneus, huile, DAE, saignement…)"
        className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
      />

      <CategoryFilter value={categorie} onChange={setCategorie} />

      <p className="text-xs text-[var(--color-text-muted)]">{items.length} résultat(s)</p>

      <div className="space-y-2.5">
        {items.map((q) => {
          const p = progress[q.id]
          const statut = p ? computeStatut(p) : 'nouveau'
          const totalRep = p ? p.bonnesReponses + p.mauvaisesReponses + p.reponsesPartielles : 0
          const taux = totalRep > 0 ? Math.round((p.bonnesReponses / totalRep) * 100) : null

          return (
            <div key={q.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between gap-2">
                <CategoryBadge categorie={q.categorie} />
                <span className="text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">
                  {STATUT_ICON[statut]} {STATUT_LABEL[statut]}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">{q.question}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {q.gradable ? q.reponse_officielle : 'Vérification pratique (geste à connaître).'}
              </p>
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                {p ? `${p.tentatives} tentative${p.tentatives > 1 ? 's' : ''}` : '0 tentative'}
                {taux !== null && ` · ${taux}% de réussite`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
