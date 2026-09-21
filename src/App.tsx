import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import FreeAnswer from './pages/FreeAnswer'
import Mistakes from './pages/Mistakes'
import AllQuestions from './pages/AllQuestions'
import BottomNav from './components/BottomNav'
import { useTheme } from './hooks/useTheme'

const Statistics = lazy(() => import('./pages/Statistics'))

function Header() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur px-4 py-3">
      <Link to="/" className="font-extrabold text-[var(--color-text)] text-base">
        🚗 Permis B
      </Link>
      <div className="flex items-center gap-3">
        {location.pathname !== '/toutes' && (
          <Link to="/toutes" className="text-sm font-medium text-[var(--color-text-muted)]" aria-label="Toutes les questions">
            🔍
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label="Changer de thème"
          className="text-lg"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col bg-[var(--color-bg)]">
        <Header />
        <main className="flex-1 px-4 pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/qcm" element={<Quiz />} />
            <Route path="/libre" element={<FreeAnswer />} />
            <Route path="/erreurs" element={<Mistakes />} />
            <Route
              path="/stats"
              element={
                <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Chargement…</p>}>
                  <Statistics />
                </Suspense>
              }
            />
            <Route path="/toutes" element={<AllQuestions />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
