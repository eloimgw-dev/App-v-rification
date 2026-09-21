import type { Proposition, Question, ResultatReponse } from '../types'
import { QUESTIONS } from '../data/questions'

// ---------- QCM : génération des propositions ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Génère les propositions d'un QCM. La mauvaise réponse est toujours une
 * réponse OFFICIELLE d'une autre question de la banque (jamais une réponse
 * inventée), ce qui garantit un contenu plausible et fidèle au document.
 */
export function generateQcmOptions(question: Question, count = 4): Proposition[] {
  const correct = question.reponse_officielle.trim()
  const pool = QUESTIONS.filter(
    (q) =>
      q.id !== question.id &&
      q.categorie === question.categorie &&
      q.gradable &&
      q.reponse_officielle.trim() !== correct,
  )

  const distractorTexts = new Set<string>()
  for (const q of shuffle(pool)) {
    if (distractorTexts.size >= count - 1) break
    distractorTexts.add(q.reponse_officielle.trim())
  }

  // Repli : si la catégorie n'a pas assez d'autres réponses (rare), on complète
  // avec des réponses d'autres catégories plutôt que d'inventer du contenu.
  if (distractorTexts.size < count - 1) {
    const fallbackPool = QUESTIONS.filter(
      (q) => q.id !== question.id && q.gradable && q.reponse_officielle.trim() !== correct,
    )
    for (const q of shuffle(fallbackPool)) {
      if (distractorTexts.size >= count - 1) break
      distractorTexts.add(q.reponse_officielle.trim())
    }
  }

  const propositions: Proposition[] = [
    { texte: correct, correcte: true },
    ...[...distractorTexts].map((texte) => ({ texte, correcte: false })),
  ]
  return shuffle(propositions)
}

// ---------- Réponse libre : évaluation ----------

const STOPWORDS = new Set(
  [
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'a', 'au', 'aux',
    'en', 'dans', 'sur', 'pour', 'par', 'avec', 'sans', 'ce', 'ces', 'cet', 'cette',
    'son', 'sa', 'ses', 'leur', 'leurs', 'il', 'elle', 'ils', 'elles', 'on', 'nous',
    'vous', 'que', 'qui', 'quoi', 'est', 'sont', 'être', 'avoir', 'ne', 'pas', 'plus',
    'si', 'ou', 'ainsi', 'donc', 'car', 'mais', 'ou', 'très', 'peut', 'peuvent',
    'doit', 'doivent', 'être', 'afin', 'ceci', 'cela', 'y', 'se', 'sa', 'l', 'd',
    'un', 'une', 'aux', 'aussi', 'comme', 'entre', 'vers', 'sous', 'apres', 'avant',
  ].map(normalize),
)

// équivalences explicitement admises par le document (notes en bleu du PDF)
const SYNONYM_GROUPS: string[][] = [
  ['gilet jaune', 'gilet de haute visibilite'],
  ['carte grise', 'certificat d immatriculation'],
  ['degivrage', 'desembuage'],
  ['sapeurs pompiers', 'pompiers'],
  ['vehicule', 'voiture'],
]

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function applySynonyms(text: string): string {
  let out = text
  for (const group of SYNONYM_GROUPS) {
    const canonical = group[0]
    for (const variant of group.slice(1)) {
      out = out.split(variant).join(canonical)
    }
  }
  return out
}

function splitIntoSegments(officialAnswer: string): string[] {
  const segments = officialAnswer
    .split(/[.;]\s+|\s*;\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  // fusionne les fragments trop courts (ex: "ALERTER :") avec le suivant
  const merged: string[] = []
  for (const s of segments) {
    if (merged.length > 0 && merged[merged.length - 1].length < 12) {
      merged[merged.length - 1] += ' ' + s
    } else {
      merged.push(s)
    }
  }
  return merged.length > 0 ? merged : [officialAnswer]
}

function keywordsOf(segment: string): string[] {
  const norm = applySynonyms(normalize(segment))
  return norm
    .split(' ')
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}

export interface EvaluationResult {
  resultat: ResultatReponse
  score: number
  elementsCorrects: string[]
  elementsManquants: string[]
}

/**
 * Évalue une réponse libre par rapport à la réponse officielle du PDF.
 * Comparaison par mots-clés / segments plutôt que correspondance exacte,
 * pour tolérer les reformulations et les petites fautes d'orthographe.
 */
export function evaluateFreeAnswer(userAnswer: string, officialAnswer: string): EvaluationResult {
  const userNorm = applySynonyms(normalize(userAnswer))

  if (!userNorm) {
    return {
      resultat: 'incorrect',
      score: 0,
      elementsCorrects: [],
      elementsManquants: splitIntoSegments(officialAnswer),
    }
  }

  const segments = splitIntoSegments(officialAnswer)
  const elementsCorrects: string[] = []
  const elementsManquants: string[] = []

  for (const segment of segments) {
    const keywords = keywordsOf(segment)
    if (keywords.length === 0) {
      // segment sans mot-clé exploitable (ex: réponses courtes "Oui."/"Non.")
      const segNorm = applySynonyms(normalize(segment))
      if (segNorm && userNorm.includes(segNorm)) {
        elementsCorrects.push(segment)
      } else {
        elementsManquants.push(segment)
      }
      continue
    }
    const found = keywords.filter((k) => userNorm.includes(k))
    const ratio = found.length / keywords.length
    if (ratio >= 0.5) {
      elementsCorrects.push(segment)
    } else {
      elementsManquants.push(segment)
    }
  }

  const score = elementsCorrects.length / segments.length

  let resultat: ResultatReponse
  if (score >= 0.8) resultat = 'correct'
  else if (score >= 0.35) resultat = 'partiel'
  else resultat = 'incorrect'

  return { resultat, score, elementsCorrects, elementsManquants }
}
