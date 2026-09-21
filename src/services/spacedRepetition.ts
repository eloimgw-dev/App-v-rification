import type { ResultatReponse, StatutQuestion, UserProgress } from '../types'
import { getAllProgress, getProgress, saveProgress } from './storage'

// intervalles en jours selon le niveau de répétition espacée (0 = revient vite)
const INTERVALS_JOURS = [0, 1, 2, 4, 7, 14, 30]

export function computeStatut(progress: UserProgress): StatutQuestion {
  if (progress.marqueManuellement) return 'a_revoir'
  if (progress.tentatives === 0) return 'nouveau'
  if (progress.streakCorrect >= 3) return 'maitrisee'
  if (progress.mauvaisesReponses > 0 || progress.reponsesPartielles > 0) {
    // maîtrisée si les échecs sont anciens et la série actuelle est bonne
    if (progress.streakCorrect >= 1) return 'en_cours'
    return 'a_revoir'
  }
  return 'en_cours'
}

export function updateProgressAfterAnswer(
  questionId: string,
  resultat: ResultatReponse,
): UserProgress {
  const p = getProgress(questionId)
  p.tentatives += 1
  p.derniereTentative = new Date().toISOString()

  if (resultat === 'correct') {
    p.bonnesReponses += 1
    p.streakCorrect += 1
    p.niveauRevision = Math.min(p.niveauRevision + 1, INTERVALS_JOURS.length - 1)
  } else if (resultat === 'partiel') {
    p.reponsesPartielles += 1
    p.streakCorrect = 0
    p.niveauRevision = Math.max(p.niveauRevision - 1, 0)
  } else {
    p.mauvaisesReponses += 1
    p.streakCorrect = 0
    p.niveauRevision = 0
  }

  const joursAAjouter = INTERVALS_JOURS[p.niveauRevision]
  const prochaine = new Date()
  prochaine.setDate(prochaine.getDate() + joursAAjouter)
  p.prochaineRevision = prochaine.toISOString()

  p.statut = computeStatut(p)
  saveProgress(p)
  return p
}

export function getQuestionsARevoir(): string[] {
  const all = getAllProgress()
  return Object.values(all)
    .filter((p) => computeStatut(p) === 'a_revoir')
    .map((p) => p.questionId)
}

export function getQuestionsMaitrisees(): string[] {
  const all = getAllProgress()
  return Object.values(all)
    .filter((p) => computeStatut(p) === 'maitrisee')
    .map((p) => p.questionId)
}

/** Priorise les questions dues pour révision (répétition espacée), sinon aléatoire. */
export function sortByPriorite(questionIds: string[]): string[] {
  const all = getAllProgress()
  const now = Date.now()
  return [...questionIds].sort((a, b) => {
    const pa = all[a]
    const pb = all[b]
    const scoreA = priorityScore(pa, now)
    const scoreB = priorityScore(pb, now)
    return scoreB - scoreA
  })
}

function priorityScore(p: UserProgress | undefined, now: number): number {
  if (!p || p.tentatives === 0) return 1 // nouveau : priorité moyenne-haute
  if (p.marqueManuellement) return 3
  const statut = computeStatut(p)
  if (statut === 'a_revoir') return 4
  if (p.prochaineRevision && new Date(p.prochaineRevision).getTime() <= now) return 2
  if (statut === 'maitrisee') return -1
  return 0
}
