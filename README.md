# Permis B — Révision des vérifications

Application web mobile-first de révision des questions officielles du permis B
(vérifications techniques, sécurité routière, premiers secours), construite à
partir de la banque de questions du Ministère de l'Intérieur (DSR/BRPCE,
1er janvier 2018).

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Puis ouvrir l'URL affichée (par défaut http://localhost:5173).

## Build de production

```bash
npm run build
npm run preview   # pour tester le build localement
```

Aucune dépendance externe (API, backend) n'est nécessaire : toutes les
données sont embarquées dans l'application et la progression est stockée
dans le `localStorage` du navigateur.

## Architecture

```
src/
 ├── components/     Composants réutilisables (QuestionCard, QuizOption,
 │                    ProgressBar, SessionSummary, AnswerCorrection,
 │                    CategoryFilter/Badge, StatsCard, BottomNav)
 ├── pages/           Home, Quiz (QCM), FreeAnswer, Mistakes, Statistics,
 │                    AllQuestions
 ├── data/            questions.json (banque extraite du PDF) + questions.ts
 ├── services/        storage.ts (localStorage), scoring.ts (génération QCM
 │                    + évaluation réponse libre), spacedRepetition.ts
 │                    (statut/priorité des questions), stats.ts (agrégats)
 ├── hooks/           useTheme.ts (clair/sombre, persisté)
 ├── types/           Types TypeScript partagés (Question, UserProgress,
 │                    Session…)
 └── App.tsx          Routing (react-router-dom) + shell mobile
```

## Extraction des données du PDF

Le PDF source (`permis-b-b1_banque_ve_rifications_01_01_18_dsr-brpce.pdf`,
40 pages) contient 100 fiches numérotées. Chaque fiche associe :
- une vérification technique (VI = intérieure / VE = extérieure) ;
- une question de sécurité routière (QSER) ;
- une question de premiers secours.

Soit 300 items au total. Le document réutilise volontairement les mêmes
questions/réponses sur plusieurs fiches (banque d'examen avec tirage
aléatoire) : après déduplication stricte du texte (sans reformulation), la
banque finale contient **169 questions uniques** :

| Catégorie | Items bruts (PDF) | Questions uniques |
|---|---|---|
| Vérifications techniques | 100 | 64 (32 avec réponse textuelle, 32 gestes pratiques sans réponse texte type "Montrez X") |
| Sécurité routière | 100 | 66 |
| Premiers secours | 100 | 39 |

Les 32 vérifications techniques sans réponse textuelle officielle (ex.
« Montrez l'indicateur de niveau de carburant ») ne sont pas incluses dans
les modes QCM/Réponse libre notés — il n'existe pas de réponse texte dans
le document pour générer une correction fiable. Elles restent visibles dans
« Toutes les questions » comme repères pratiques. Les 137 questions
restantes (32 + 66 + 39) alimentent les modes QCM et Réponse libre.

Aucune question ni réponse n'a été inventée : le texte des questions et des
réponses officielles provient intégralement du PDF.

## Fonctionnement des modes

- **QCM** : les mauvaises réponses proposées sont toujours des réponses
  *officielles* d'autres questions de la même catégorie (jamais inventées),
  mélangées aléatoirement avec la bonne réponse.
- **Réponse libre** : la réponse de l'utilisateur est comparée à la réponse
  officielle par segments/mots-clés (avec quelques équivalences explicitement
  admises par le document, ex. « gilet jaune » = « gilet de haute
  visibilité ») pour tolérer les reformulations et les petites fautes
  d'orthographe, tout en détectant les éléments essentiels manquants.
- **Répétition espacée** : chaque question a un niveau de révision qui
  augmente après une bonne réponse (intervalle plus long) et retombe à zéro
  après une erreur, déterminant son statut (nouveau / en cours / à revoir /
  maîtrisée) et sa priorité de réapparition.

## Stockage

V1 : tout est stocké en `localStorage` (progression par question, historique
des sessions, préférence de thème). L'architecture (services `storage.ts`)
isole les accès au stockage pour permettre de le remplacer plus tard par une
API + compte utilisateur sans toucher au reste de l'application.
