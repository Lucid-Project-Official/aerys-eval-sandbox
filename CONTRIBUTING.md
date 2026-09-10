# Guide d'accueil contributeur

Bienvenue dans **Aerys Eval Sandbox** — dépôt d'évaluation de l'autonomie Aerys. Ce guide en **trois points** vous oriente pour contribuer efficacement.

---

## 1. Prise en main et environnement

Avant toute contribution, configurez votre poste local :

1. **Prérequis** : Node.js 24+, npm, Git et accès au dépôt `Lucid-Project-Official/aerys-eval-sandbox`.
2. **Installation** :
   ```bash
   git clone https://github.com/Lucid-Project-Official/aerys-eval-sandbox.git
   cd aerys-eval-sandbox
   npm test
   npm run lint
   ```
3. **Branche de travail** : créez une branche descriptive (`feat/…`, `fix/…`) à partir de `main`.
4. **Référence** : consultez le [README](README.md) pour la configuration secrets, Milan et les objectifs eval.

---

## 2. Parcours de contribution

Suivez ce flux pour chaque changement :

1. **Développer** : modifiez le code ou la documentation en respectant les conventions existantes (scripts Node, tests de régression dans `test/`).
2. **Valider localement** :
   ```bash
   npm run lint
   npm test
   npm run verify-contributor-guide   # guide contributeur
   npm run verify-en-bonne-voie         # gate qualité complète
   ```
3. **Ouvrir une PR** : poussez votre branche et créez une pull request vers `main` avec une description claire (objectif, changements, vérifications).
4. **CI verte** : attendez le passage du workflow [CI](.github/workflows/ci.yml) avant merge.

---

## 3. Règles et communauté

Quelques principes pour une collaboration saine :

1. **Qualité** : chaque script dans `scripts/` doit avoir un test de régression ; ne mergez pas avec des tests en échec.
2. **Portée minimale** : une PR = un objectif clair ; évitez les changements hors sujet.
3. **Communication** : signalez les blocages dans la PR ou via l'équipe Aerys ; documentez les décisions non évidentes.
4. **Respect** : revues constructives, feedback factuel, bienveillance envers les autres contributeurs.

---

**Guide publié le 2026-09-10** — 3 points · [État du projet](project-state.json)
