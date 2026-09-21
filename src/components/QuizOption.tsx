interface Props {
  texte: string
  selected: boolean
  correcte: boolean
  revealed: boolean
  disabled: boolean
  onSelect: () => void
}

export default function QuizOption({ texte, selected, correcte, revealed, disabled, onSelect }: Props) {
  let classes =
    'w-full text-left rounded-xl border-2 px-4 py-3.5 text-[15px] leading-snug transition-colors min-h-[3.25rem] '

  if (!revealed) {
    classes += selected
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-text)]'
      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] active:bg-[var(--color-border)]'
  } else if (correcte) {
    classes += 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-text)]'
  } else if (selected && !correcte) {
    classes += 'border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-text)]'
  } else {
    classes += 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] opacity-60'
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
            selected ? 'border-current' : 'border-[var(--color-border)]'
          }`}
        >
          {revealed && correcte ? '✓' : revealed && selected && !correcte ? '✕' : ''}
        </span>
        <span>{texte}</span>
      </div>
    </button>
  )
}
