export type Categorie =
  | 'verifications_techniques'
  | 'securite_routiere'
  | 'premiers_secours'

export const CATEGORIES: Categorie[] = [
  'verifications_techniques',
  'securite_routiere',
  'premiers_secours',
]

export const CATEGORIE_LABELS: Record<Categorie, string> = {
  verifications_techniques: 'Vérifications techniques',
  securite_routiere: 'Sécurité routière',
  premiers_secours: 'Premiers secours',
}

export const CATEGORIE_SHORT: Record<Categorie, string> = {
  verifications_techniques: 'Vérif. technique',
  securite_routiere: 'Sécurité routière',
  premiers_secours: '1ers secours',
}

export interface Question {
  id: string
  categorie: Categorie
  type_verif?: 'VI' | 'VE'
  question: string
  reponse_officielle: string
  /** false = vérification pratique sans réponse textuelle officielle (geste à connaître) */
  gradable: boolean
  page_source: string[]
  nb_occurrences: number
}

export interface Proposition {
  texte: string
  correcte: boolean
}

export type Mode = 'qcm' | 'libre'

export type StatutQuestion = 'nouveau' | 'a_revoir' | 'en_cours' | 'maitrisee'

export interface UserProgress {
  questionId: string
  tentatives: number
  bonnesReponses: number
  mauvaisesReponses: number
  reponsesPartielles: number
  derniereTentative: string | null
  statut: StatutQuestion
  marqueManuellement: boolean
  /** niveau de répétition espacée : 0 = à revoir vite, plus haut = revu moins souvent */
  niveauRevision: number
  prochaineRevision: string | null
  streakCorrect: number
}

export type ResultatReponse = 'correct' | 'partiel' | 'incorrect'

export interface SessionQuestionResult {
  questionId: string
  categorie: Categorie
  question: string
  reponseUtilisateur: string
  reponseOfficielle: string
  resultat: ResultatReponse
}

export interface Session {
  id: string
  date: string
  mode: Mode
  categories: Categorie[]
  nombreQuestions: number
  bonnesReponses: number
  mauvaisesReponses: number
  reponsesPartielles: number
  duree: number
  questions: SessionQuestionResult[]
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
}
