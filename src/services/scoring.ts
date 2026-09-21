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

function extractKeywords(text: string): Set<string> {
  const norm = applySynonyms(normalize(text))
  return new Set(norm.split(' ').filter((w) => w.length >= 4 && !STOPWORDS.has(w)))
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let n = 0
  for (const w of a) if (b.has(w)) n++
  return n
}

/**
 * Génère les propositions d'un QCM. Les mauvaises réponses sont toujours des
 * réponses OFFICIELLES d'autres questions de la banque (jamais inventées),
 * choisies en priorité parmi celles qui partagent du vocabulaire avec la
 * question posée (même thème, même objet du véhicule, même geste…) plutôt
 * qu'au hasard dans toute la catégorie : cela évite des distracteurs trop
 * évidemment hors-sujet et rend le QCM réellement discriminant.
 */
export function generateQcmOptions(question: Question, count = 4): Proposition[] {
  const correct = question.reponse_officielle.trim()
  const targetQuestionKeywords = extractKeywords(question.question)
  const targetAnswerKeywords = extractKeywords(question.reponse_officielle)

  function relevance(q: Question): number {
    return (
      overlapScore(targetQuestionKeywords, extractKeywords(q.question)) * 2 +
      overlapScore(targetAnswerKeywords, extractKeywords(q.reponse_officielle))
    )
  }

  const sameCategoryPool = QUESTIONS.filter(
    (q) =>
      q.id !== question.id &&
      q.categorie === question.categorie &&
      q.gradable &&
      q.reponse_officielle.trim() !== correct,
  )

  const scored = sameCategoryPool
    .map((q) => ({ q, score: relevance(q) }))
    .sort((a, b) => b.score - a.score)

  const distractorTexts = new Set<string>()

  // 1) Distracteurs thématiquement proches (vocabulaire partagé avec la
  //    question) : on garde une marge de candidats pour tirer au sort parmi
  //    les plus pertinents plutôt que de toujours proposer les 3 mêmes.
  const relevant = scored.filter((s) => s.score > 0)
  const shortlist = shuffle(relevant.slice(0, Math.max(count * 3, 6)))
  for (const { q } of shortlist) {
    if (distractorTexts.size >= count - 1) break
    distractorTexts.add(q.reponse_officielle.trim())
  }

  // 2) Repli : complète avec des réponses de la même catégorie tirées au
  //    hasard si le vocabulaire partagé ne suffit pas à remplir le QCM.
  if (distractorTexts.size < count - 1) {
    for (const q of shuffle(sameCategoryPool)) {
      if (distractorTexts.size >= count - 1) break
      distractorTexts.add(q.reponse_officielle.trim())
    }
  }

  // 3) Dernier repli : d'autres catégories, plutôt que d'inventer du contenu.
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
