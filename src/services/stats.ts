import { QUESTIONS } from '../data/questions'
import type { Categorie } from '../types'
import { CATEGORIES } from '../types'
import { getAllProgress, getSessions } from './storage'
import { computeStatut } from './spacedRepetition'

export interface GlobalStats {
  totalQuestions: number
  questionsRealisees: number
  tauxReussiteGlobal: number | null
  questionsARevoir: number
  questionsMaitrisees: number
  nombreSessions: number
  tauxReussiteQcm: number | null
  tauxReussiteLibre: number | null
  parCategorie: Record<Categorie, { realisees: number; total: number; taux: number | null }>
  categoriePlusReussie: Categorie | null
  categoriePlusDifficile: Categorie | null
  evolutionScore: { date: string; pct: number; mode: string }[]
}

export function computeGlobalStats(): GlobalStats {
  const progress = Object.values(getAllProgress())
  const sessions = getSessions()

  const questionsRealisees = progress.filter((p) => p.tentatives > 0).length
  const questionsARevoir = progress.filter((p) => computeStatut(p) === 'a_revoir').length
  const questionsMaitrisees = progress.filter((p) => computeStatut(p) === 'maitrisee').length

  const totalBonnes = progress.reduce((s, p) => s + p.bonnesReponses, 0)
  const totalReponses = progress.reduce(
    (s, p) => s + p.bonnesReponses + p.mauvaisesReponses + p.reponsesPartielles,
    0,
  )
  const tauxReussiteGlobal = totalReponses > 0 ? Math.round((totalBonnes / totalReponses) * 100) : null

  const qcmSessions = sessions.filter((s) => s.mode === 'qcm')
  const libreSessions = sessions.filter((s) => s.mode === 'libre')
  const tauxReussiteQcm = tauxFromSessions(qcmSessions)
  const tauxReussiteLibre = tauxFromSessions(libreSessions)

  const parCategorie = {} as GlobalStats['parCategorie']
  for (const cat of CATEGORIES) {
    const idsInCat = QUESTIONS.filter((q) => q.categorie === cat).map((q) => q.id)
    const progInCat = progress.filter((p) => idsInCat.includes(p.questionId) && p.tentatives > 0)
    const bonnes = progInCat.reduce((s, p) => s + p.bonnesReponses, 0)
    const total = progInCat.reduce((s, p) => s + p.bonnesReponses + p.mauvaisesReponses + p.reponsesPartielles, 0)
    parCategorie[cat] = {
      realisees: progInCat.length,
      total: idsInCat.length,
      taux: total > 0 ? Math.round((bonnes / total) * 100) : null,
    }
  }

  const catsAvecDonnees = CATEGORIES.filter((c) => parCategorie[c].taux !== null)
  const categoriePlusReussie =
    catsAvecDonnees.length > 0
      ? catsAvecDonnees.reduce((best, c) => ((parCategorie[c].taux ?? 0) > (parCategorie[best].taux ?? 0) ? c : best))
      : null
  const categoriePlusDifficile =
    catsAvecDonnees.length > 0
      ? catsAvecDonnees.reduce((worst, c) => ((parCategorie[c].taux ?? 100) < (parCategorie[worst].taux ?? 100) ? c : worst))
      : null

  const evolutionScore = [...sessions]
    .reverse()
    .map((s) => ({
      date: s.date,
      pct: s.nombreQuestions > 0 ? Math.round((s.bonnesReponses / s.nombreQuestions) * 100) : 0,
      mode: s.mode,
    }))

  return {
    totalQuestions: QUESTIONS.length,
    questionsRealisees,
    tauxReussiteGlobal,
    questionsARevoir,
    questionsMaitrisees,
    nombreSessions: sessions.length,
    tauxReussiteQcm,
    tauxReussiteLibre,
    parCategorie,
    categoriePlusReussie,
    categoriePlusDifficile,
    evolutionScore,
  }
}

function tauxFromSessions(sessions: { bonnesReponses: number; nombreQuestions: number }[]): number | null {
  const total = sessions.reduce((s, x) => s + x.nombreQuestions, 0)
  if (total === 0) return null
  const bonnes = sessions.reduce((s, x) => s + x.bonnesReponses, 0)
  return Math.round((bonnes / total) * 100)
}

/** Dernière session d'un mode donné, pour la comparaison "progression" du bilan. */
export function getPreviousSessionOfMode(mode: string) {
  const sessions = getSessions()
  return sessions.find((s) => s.mode === mode)
}
