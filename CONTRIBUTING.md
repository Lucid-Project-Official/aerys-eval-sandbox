# Guide d'accueil contributeur

Bienvenue sur **aerys-eval-sandbox**. Ce guide en trois points résume l'essentiel pour contribuer efficacement au dépôt.

## 1. Intégration

- Clonez le dépôt et installez les dépendances avec `npm install` (Node.js 24 recommandé).
- Lisez le `README.md` pour comprendre les objectifs d'évaluation Aerys, la CI et la configuration Milan.
- Copiez `.env.example` vers `.env` si vous exécutez localement les scripts de vérification (`verify-milan`, `validate-secrets`).

## 2. Standards de code

- Exécutez `npm run lint` puis `npm test` avant chaque push ; la CI sur `main` doit rester verte.
- Placez les utilitaires dans `scripts/` et leurs tests de régression dans `test/`.
- Documentez tout changement de secrets GitHub, permissions Milan ou structure du workflow CI dans le `README.md`.

## 3. Workflow de contribution

- Créez une branche descriptive depuis `main`, puis ouvrez une PR avec un titre clair et une description concise.
- Attendez le passage de la CI : validation secrets, verify-milan, verify-ci et tests unitaires.
- Demandez une revue si le changement touche les secrets, les permissions Milan ou la structure CI.
