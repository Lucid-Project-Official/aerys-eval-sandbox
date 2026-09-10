# Guide d'accueil contributeur

Bienvenue sur **aerys-eval-sandbox**. Ce dépôt valide la chaîne d'autonomie Aerys : objectif → mission → code → PR → CI → merge.

## 1. Intégration

- **Prérequis** : Node.js 24, npm, Git et accès au dépôt `Lucid-Project-Official/aerys-eval-sandbox`.
- **Installation** : clonez le dépôt, exécutez `npm test` et `npm run lint` — les deux doivent passer avant toute PR.
- **Branche de travail** : créez une branche `cursor/` ou `feature/` depuis `main` ; ne poussez jamais directement sur `main`.

## 2. Standards de code

- **Tests obligatoires** : chaque script dans `scripts/` doit avoir une suite dans `test/` ; couverture vérifiée par `verify-en-bonne-voie.js`.
- **Lint** : `npm run lint` doit rester vert ; pas de secrets ni de clés dans le code source.
- **Secrets** : formats documentés dans le README (évite l'erreur E005) ; utilisez `.env.example` comme référence.

## 3. Workflow de contribution

1. Implémentez la mission sur une branche dédiée.
2. Vérifiez localement : `npm test`, `npm run lint`, et les scripts de gate pertinents (`verify-ci`, `audit`, etc.).
3. Ouvrez une **PR vers `main`** ; attendez la CI verte avant merge.
4. Documentez l'objectif terminé dans le README si applicable.

Des questions ? Consultez le README ou ouvrez une issue sur GitHub.
