import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { computeGlobalStats } from '../services/stats'
import { CATEGORIE_LABELS, CATEGORIES } from '../types'
import StatsCard from '../components/StatsCard'
import { getSessions } from '../services/storage'

export default function Statistics() {
  const stats = useMemo(() => computeGlobalStats(), [])
  const sessions = useMemo(() => getSessions(), [])

  const chartData = stats.evolutionScore.map((e, i) => ({
    name: `#${i + 1}`,
    score: e.pct,
  }))

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">📊 Mes statistiques</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatsCard label="Questions réalisées" value={`${stats.questionsRealisees} / ${stats.totalQuestions}`} />
        <StatsCard label="Sessions réalisées" value={stats.nombreSessions} />
        <StatsCard
          label="Taux de réussite global"
          value={stats.tauxReussiteGlobal !== null ? `${stats.tauxReussiteGlobal}%` : '—'}
          accent="success"
        />
        <StatsCard label="Taux de réussite QCM" value={stats.tauxReussiteQcm !== null ? `${stats.tauxReussiteQcm}%` : '—'} />
        <StatsCard
          label="Taux de réussite réponse libre"
          value={stats.tauxReussiteLibre !== null ? `${stats.tauxReussiteLibre}%` : '—'}
        />
        <StatsCard label="Questions maîtrisées" value={stats.questionsMaitrisees} accent="success" />
        <StatsCard label="Questions à revoir" value={stats.questionsARevoir} accent="danger" />
        <StatsCard
          label="Meilleure catégorie"
          value={stats.categoriePlusReussie ? CATEGORIE_LABELS[stats.categoriePlusReussie] : '—'}
        />
      </div>

      {stats.categoriePlusDifficile && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Catégorie à travailler en priorité :{' '}
          <span className="font-semibold text-[var(--color-danger)]">
            {CATEGORIE_LABELS[stats.categoriePlusDifficile]}
          </span>
        </p>
      )}

      {chartData.length >= 2 && (
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Évolution du score</h2>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text)',
                  }}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Par catégorie</h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {CATEGORIES.map((cat) => {
            const c = stats.parCategorie[cat]
            return (
              <div key={cat} className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[var(--color-text)]">{CATEGORIE_LABELS[cat]}</span>
                  <span className="text-sm font-bold text-[var(--color-text)]">{c.taux !== null ? `${c.taux}%` : '—'}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${c.taux ?? 0}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {c.realisees} / {c.total} questions travaillées
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Historique</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Aucune session enregistrée pour le moment.</p>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
            {sessions.slice(0, 20).map((s) => {
              const pct = s.nombreQuestions > 0 ? Math.round((s.bonnesReponses / s.nombreQuestions) * 100) : 0
              const date = new Date(s.date)
              return (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {s.nombreQuestions} questions — {s.mode === 'qcm' ? 'QCM' : 'Réponse libre'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">{pct}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
