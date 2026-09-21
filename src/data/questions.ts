import raw from './questions.json'
import type { Question } from '../types'

export const QUESTIONS: Question[] = raw as Question[]

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}

export function getQuestionsByCategorie(categorie?: string): Question[] {
  if (!categorie || categorie === 'toutes') return QUESTIONS
  return QUESTIONS.filter((q) => q.categorie === categorie)
}
