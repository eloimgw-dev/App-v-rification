import type { Categorie } from '../types'
import { CATEGORIES, CATEGORIE_SHORT } from '../types'

interface Props {
  value: Categorie | 'toutes'
  onChange: (v: Categorie | 'toutes') => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  const options: (Categorie | 'toutes')[] = ['toutes', ...CATEGORIES]
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-3.5 py-2 text-sm font-medium border transition-colors ${
              active
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]'
            }`}
          >
            {opt === 'toutes' ? 'Toutes' : CATEGORIE_SHORT[opt]}
          </button>
        )
      })}
    </div>
  )
}
