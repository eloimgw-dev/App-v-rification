import type { Categorie } from '../types'
import { CATEGORIE_SHORT } from '../types'

const COLORS: Record<Categorie, string> = {
  verifications_techniques: 'bg-blue-100 text-blue-800',
  securite_routiere: 'bg-orange-100 text-orange-800',
  premiers_secours: 'bg-emerald-100 text-emerald-800',
}

export default function CategoryBadge({ categorie }: { categorie: Categorie }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COLORS[categorie]}`}
    >
      {CATEGORIE_SHORT[categorie]}
    </span>
  )
}
