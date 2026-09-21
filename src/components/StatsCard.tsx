interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: 'default' | 'success' | 'warning' | 'danger'
}

const ACCENTS: Record<NonNullable<Props['accent']>, string> = {
  default: 'text-[var(--color-text)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
}

export default function StatsCard({ label, value, sub, accent = 'default' }: Props) {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${ACCENTS[accent]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  )
}
