import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: 'Accueil', icon: '🏠', end: true },
  { to: '/qcm', label: 'QCM', icon: '📝', end: false },
  { to: '/libre', label: 'Libre', icon: '⌨️', end: false },
  { to: '/erreurs', label: 'Erreurs', icon: '🔴', end: false },
  { to: '/stats', label: 'Stats', icon: '📊', end: false },
]

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
