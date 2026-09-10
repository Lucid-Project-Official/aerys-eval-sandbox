# Guide d'accueil contributeur

Bienvenue sur **Aerys Eval Sandbox** — ce dépôt sert à valider la chaîne complète d'autonomie Aerys (objectif → mission → code → PR → CI → merge). Ce guide en **3 points** couvre l'essentiel pour contribuer efficacement.

---

## 1. Préparer l'environnement local

1. **Cloner le dépôt** et installer les dépendances Node.js (v24 recommandée, alignée sur la CI) :

   ```bash
   git clone https://github.com/Lucid-Project-Official/aerys-eval-sandbox.git
   cd aerys-eval-sandbox
   npm install   # aucune dépendance externe requise — scripts Node natifs
   ```

2. **Vérifier que tout fonctionne** avant toute modification :

   ```bash
   npm test          # tests unitaires + gate EN_BONNE_VOIE
   npm run lint      # linting
   ```

3. **Variables d'environnement** (optionnelles en local) : copier `.env.example` si vous testez l'intégration Milan / Aerys. La CI et les tests de base n'exigent aucun secret.

---

## 2. Standards de code et workflow PR

| Étape | Commande / règle |
|-------|------------------|
| Qualité | `npm run verify-en-bonne-voie` — lint + tests + couverture scripts + statut CI `main` |
| Audit complet | `npm run audit` — secrets, connecteurs Milan, workflow CI |
| Branche | Créer une branche descriptive (`cursor/…` ou `feat/…`) depuis `main` |
| PR | Ouvrir une pull request vers `main` ; la CI doit passer (badge vert) |
| Portée | Modifications ciblées — ce sandbox valide des objectifs eval, pas de refonte hors mission |

**Scripts couverts par les tests** : `validate-secrets.js`, `verify-milan-setup.js`, `verify-ci-workflow.js`, `audit-milan-ci.js`. Toute modification dans `scripts/` doit inclure ou mettre à jour les tests correspondants dans `test/`.

---

## 3. Canaux communautaires et support

| Canal | Usage |
|-------|-------|
| **Issues GitHub** | Signaler un bug, proposer une amélioration ou demander de l'aide sur ce dépôt |
| **Pull requests** | Revue de code et discussion technique sur les changements |
| **Projet Aerys `eval-autonomie`** | Contexte mission, agents et connecteurs (Dashboard Aerys) |
| **Agent Milan (`@milan`)** | DevOps Aerys — CI, connecteurs GitHub L3 / Cursor L2, DevRun |

Pour les questions sur les secrets, permissions Milan ou l'erreur E005, consulter la section [Configuration secrets](README.md#configuration-secrets) du README.

---

*Publié le 2026-09-10 — guide en 3 points.*
