# Guide d'accueil contributeur — aerys-eval-sandbox

**Publié le 2026-09-10**

Bienvenue dans le sandbox d'évaluation Aerys. Ce guide résume en trois points ce qu'il faut savoir pour contribuer efficacement.

## 1. Prise en main

1. Forker le dépôt et créer une branche `cursor/<mission>-<id>`.
2. Cloner localement, puis lancer `npm test` et `npm run lint`.
3. Ouvrir une pull request vers `main` ; la CI doit être verte avant merge.

## 2. Conventions du projet

- Tout script ajouté dans `scripts/` doit avoir un test dans `test/`.
- Respecter les formats de secrets documentés dans le README (éviter l'erreur E005).
- Commits descriptifs ; PRs petites, ciblées et en français ou anglais.

## 3. Communauté et communication

- Questions : ouvrir une issue GitHub avec le label `question`.
- Revues : répondre aux retours dans les 48 h ouvrées.
- Respect du code de conduite Lucid Project ; ne jamais force-push sur `main`.
