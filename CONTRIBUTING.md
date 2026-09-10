# Guide d'accueil contributeur

> **Publié le :** 2026-09-10  
> **Statut :** guide publié (`guide_published: true`)

Bienvenue dans **Aerys Eval Sandbox** — ce dépôt sert à valider la chaîne d'autonomie Aerys (objectif → mission → code → PR → CI → merge). Ce guide résume en trois points ce qu'il faut savoir avant de contribuer.

## 1. Introduction

Aerys Eval Sandbox est un environnement contrôlé pour tester l'autonomie des agents Aerys. Les contributions doivent rester focalisées sur la validation de la chaîne eval : scripts de vérification, tests unitaires, documentation d'objectifs et gates CI. Avant toute PR, lisez le [README](README.md) pour comprendre les objectifs en cours (`EN_BONNE_VOIE`, `A_RISQUE`, guide contributeur, etc.) et la configuration secrets/connecteurs Milan.

## 2. Étapes d'onboarding

1. **Fork & clone** — forkez `Lucid-Project-Official/aerys-eval-sandbox`, clonez localement et installez les dépendances : `npm install` (aucune dépendance npm externe requise pour les tests actuels).
2. **Branche de travail** — créez une branche descriptive (`feat/...`, `fix/...`, `docs/...`) à partir de `main`.
3. **Développement & vérification locale** — exécutez `npm test`, `npm run lint` et, si pertinent, les scripts de gate (`npm run verify-en-bonne-voie`, `npm run verify-contributor-guide`).
4. **Pull Request** — ouvrez une PR vers `main` avec une description claire ; la CI doit passer (Node 24, tests unitaires, lint, validation workflow).
5. **Merge** — après revue et CI verte, merge sur `main` ; l'état projet (`project-state.json`) et la documentation sont la source de vérité pour les objectifs Aerys.

## 3. Normes communautaires

- **Qualité mesurable** — chaque objectif doit produire une preuve vérifiable (script, test, métrique CI), pas seulement une modification cosmétique.
- **Commits clairs** — messages descriptifs en français ou anglais, commits atomiques quand c'est possible.
- **Respect du périmètre** — évitez les changements hors scope ; ce sandbox n'est pas un déploiement production.
- **Secrets & sécurité** — ne commitez jamais de clés API ; suivez le README pour `CURSOR_REPO_MAP`, `CURSOR_API_KEY` et le coffre connecteurs Aerys (agent Milan).
- **Bienveillance** — revues constructives, questions bienvenues sur les objectifs eval et la documentation associée.

---

*Guide d'accueil contributeur — 3 points — publié le 2026-09-10.*
