# Guide d'accueil contributeur

Bienvenue dans **Aerys Eval Sandbox**. Ce guide en **3 points** vous oriente pour contribuer.

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
4. **Référence** : consultez le [README](README.md) pour secrets, Milan et objectifs eval.

---

## 2. Parcours de contribution

Suivez ce flux pour chaque changement :

1. **Développer** : respectez les conventions (scripts Node, tests dans `test/`).
2. **Valider localement** :
   ```bash
   npm run lint
   npm test
   npm run verify-contributor-guide   # guide contributeur
   npm run verify-en-bonne-voie         # gate qualité complète
   ```
3. **Ouvrir une PR** : poussez vers `main` avec objectif, changements et vérifications.
4. **CI verte** : attendez le passage du workflow [CI](.github/workflows/ci.yml) avant merge.

---

## 3. Règles et communauté

Quelques principes pour une collaboration saine :

1. **Qualité** : chaque script dans `scripts/` doit avoir un test de régression ; ne mergez pas avec des tests en échec.
2. **Portée minimale** : une PR = un objectif clair ; évitez les changements hors sujet.
3. **Communication** : signalez les blocages tôt ; revues constructives et bienveillantes.

---

**Guide publié le 2026-09-10** — 3 points · [État du projet](project-state.json)
