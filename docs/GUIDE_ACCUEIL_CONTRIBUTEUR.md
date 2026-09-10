# Guide d'accueil contributeur

> **Published on 2026-09-10**

Bienvenue dans **aerys-eval-sandbox** — ce dépôt sert à valider la chaîne d'autonomie Aerys (objectif → mission → code → PR → CI → merge). Voici les trois points essentiels pour contribuer efficacement.

## 1. Bienvenue — comprendre le projet

- **Objectif du dépôt** : sandbox d'évaluation pour les agents Aerys ; chaque mission produit du code vérifiable, une PR et une CI verte.
- **Avant de coder** : lisez le [README](../README.md), vérifiez les objectifs en cours dans le tableau des objectifs, et identifiez la branche de mission assignée (`cursor/…`).
- **Environnement local** : Node.js, `npm install` (si applicable), puis `npm test` et `npm run lint` avant toute PR.

## 2. Parcours de contribution — de la mission à la merge

1. **Travailler sur la branche de mission** — ne poussez pas directement sur `main`.
2. **Implémenter avec des changements ciblés** — scripts de vérification, tests de régression, documentation si nécessaire.
3. **Valider localement** :
   ```bash
   npm test
   npm run lint
   npm run verify-contributor-guide   # pour les missions guide contributeur
   ```
4. **Ouvrir une PR** vers `main` avec une description claire (objectif, changements, critères d'acceptation).
5. **Attendre la CI verte** — le badge CI doit passer avant merge.

## 3. Normes communautaires — qualité et collaboration

- **Clarté** : commits descriptifs, messages en français ou anglais selon le contexte du dépôt, PRs concises.
- **Tests obligatoires** : tout script dans `scripts/` doit avoir un test correspondant dans `test/`.
- **Respect des conventions** : réutiliser les patterns existants (`verify-*.js`, `state/*.json`, docs dans `docs/`).
- **Communication** : signaler les blocages tôt ; ne pas merger une PR avec CI rouge ou sans revue si le processus l'exige.

---

*Guide publié le 2026-09-10 — 3 points : accueil, parcours de contribution, normes communautaires.*
