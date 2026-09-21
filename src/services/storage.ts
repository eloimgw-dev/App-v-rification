import type { AppSettings, Session, UserProgress } from '../types'

const KEYS = {
  progress: 'pb_progress_v1',
  sessions: 'pb_sessions_v1',
  settings: 'pb_settings_v1',
} as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage plein ou indisponible : on ignore silencieusement (V1 localStorage only)
  }
}

export function getAllProgress(): Record<string, UserProgress> {
  return readJson<Record<string, UserProgress>>(KEYS.progress, {})
}

export function getProgress(questionId: string): UserProgress {
  const all = getAllProgress()
  return (
    all[questionId] ?? {
      questionId,
      tentatives: 0,
      bonnesReponses: 0,
      mauvaisesReponses: 0,
      reponsesPartielles: 0,
      derniereTentative: null,
      statut: 'nouveau',
      marqueManuellement: false,
      niveauRevision: 0,
      prochaineRevision: null,
      streakCorrect: 0,
    }
  )
}

export function saveProgress(progress: UserProgress): void {
  const all = getAllProgress()
  all[progress.questionId] = progress
  writeJson(KEYS.progress, all)
}

export function toggleMarqueManuelle(questionId: string): UserProgress {
  const p = getProgress(questionId)
  p.marqueManuellement = !p.marqueManuellement
  saveProgress(p)
  return p
}

export function getSessions(): Session[] {
  return readJson<Session[]>(KEYS.sessions, [])
}

export function saveSession(session: Session): void {
  const sessions = getSessions()
  sessions.unshift(session)
  writeJson(KEYS.sessions, sessions)
}

export function getLastSessions(n: number): Session[] {
  return getSessions().slice(0, n)
}

const DEFAULT_SETTINGS: AppSettings = { theme: 'system' }

export function getSettings(): AppSettings {
  return readJson<AppSettings>(KEYS.settings, DEFAULT_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  writeJson(KEYS.settings, settings)
}
