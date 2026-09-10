# Guide d'accueil contributeur

> Publié le **2026-09-10** — portail public Aerys Eval Sandbox

Bienvenue dans la communauté des contributeurs. Ce guide en trois points vous accompagne de la première visite jusqu'aux bonnes pratiques du projet.

---

## 1. Introduction

Aerys Eval Sandbox est un dépôt dédié à l'évaluation de l'autonomie des agents Aerys. En contribuant, vous participez à valider la chaîne complète : objectif → mission → code → PR → CI → merge.

**Ce que vous devez savoir avant de commencer :**

- Le dépôt est open source sous l'organisation [Lucid-Project-Official](https://github.com/Lucid-Project-Official).
- Les contributions passent par des pull requests revues par l'équipe.
- La CI (`npm test`, `npm run lint`) doit rester verte sur `main`.

---

## 2. Étapes d'onboarding

Suivez ces étapes pour votre première contribution :

1. **Fork & clone** — forkez le dépôt, clonez-le localement et installez les dépendances :
   ```bash
   git clone https://github.com/Lucid-Project-Official/aerys-eval-sandbox.git
   cd aerys-eval-sandbox
   npm install
   ```

2. **Branche de travail** — créez une branche descriptive :
   ```bash
   git checkout -b feat/ma-contribution
   ```

3. **Développement & tests** — implémentez votre changement et validez localement :
   ```bash
   npm run lint
   npm test
   ```

4. **Pull request** — poussez votre branche et ouvrez une PR vers `main` avec une description claire du changement et de son objectif.

5. **Revue & merge** — répondez aux retours de revue ; une fois la CI verte et la PR approuvée, elle sera mergée.

---

## 3. Normes communautaires

Pour maintenir un environnement sain et productif :

- **Respect mutuel** — soyez courtois dans les issues, PR et discussions.
- **Qualité du code** — respectez les conventions existantes ; évitez les changements hors scope.
- **Tests obligatoires** — toute nouvelle fonctionnalité ou script de vérification doit inclure des tests de régression.
- **Documentation** — mettez à jour le README si votre changement affecte l'usage ou la configuration.
- **Sécurité** — ne commitez jamais de secrets ; utilisez les variables d'environnement documentées dans `.env.example`.

Des questions ? Ouvrez une issue sur le dépôt ou contactez un mainteneur.

---

*Guide publié le 2026-09-10 — structure en 3 points (introduction, onboarding, normes communautaires).*
