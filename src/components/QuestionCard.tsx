import type { ReactNode } from 'react'
import type { Categorie } from '../types'
import CategoryBadge from './CategoryBadge'

interface Props {
  categorie: Categorie
  question: string
  children?: ReactNode
}

export default function QuestionCard({ categorie, question, children }: Props) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 shadow-sm">
      <CategoryBadge categorie={categorie} />
      <h2 className="mt-3 text-xl font-bold leading-snug text-[var(--color-text)]">{question}</h2>
      {children}
    </div>
  )
}
