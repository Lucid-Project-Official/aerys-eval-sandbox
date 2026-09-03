# Aerys Eval Sandbox

[![CI](https://github.com/Lucid-Project-Official/aerys-eval-sandbox/actions/workflows/ci.yml/badge.svg)](https://github.com/Lucid-Project-Official/aerys-eval-sandbox/actions/workflows/ci.yml)

Repository dédié aux tests d'évaluation d'autonomie Aerys.

## Objectif

Valider la chaîne complète : objectif → mission → code → PR → CI → merge.

## Badge eval

![eval](https://img.shields.io/badge/eval-passing-brightgreen)

## Configuration secrets

### Secrets GitHub Actions (dépôt)

Le workflow CI **n'exige aucun secret** pour `npm test` / `npm run lint`. Les secrets ci-dessous sont **optionnels** et servent uniquement si vous configurez une intégration Aerys/Cursor directement dans GitHub Actions.

| Secret | Format attendu | Usage |
|--------|----------------|-------|
| `CURSOR_REPO_MAP` | **JSON objet** — ex. `{"eval-autonomie":"https://github.com/Lucid-Project-Official/aerys-eval-sandbox"}` | Alias projet → URL repo pour DevRun |
| `CURSOR_API_KEY` | **Jeton brut** (clé API Cursor Dashboard) | Authentification Cloud Agents |
| `AERYS_CONNECTOR_CONFIG` | Paires `KEY=VALUE` séparées par `;` — ex. `GITHUB_OWNER=Lucid-Project-Official;GITHUB_REPO=aerys-eval-sandbox` | Overrides connecteur (rare) |

Le job CI `Validate optional Aerys/Cursor secrets format` vérifie automatiquement le format de ces secrets lorsqu'ils sont définis.

### Erreur E005 — `dictionary update sequence element #0 has length 1; 2 is required`

Cette erreur Python survient lorsqu'une valeur destinée à être un **objet JSON** ou des **paires KEY=VALUE** est stockée dans un mauvais format :

| Mauvaise configuration | Symptôme | Correction |
|------------------------|----------|------------|
| `CURSOR_REPO_MAP` = URL brute ou liste | `dict(str)` / `dict.update(list)` crash | Stocker un JSON objet valide |
| `CURSOR_API_KEY` = `KEY=sk-...` | Parsing KEY=VALUE échoue sur jeton seul | Stocker le jeton brut uniquement |
| Config composée sans `=` | Segment de longueur 1 au lieu de 2 | Chaque segment doit être `CLE=valeur` |

Correctif côté Aerys (AgentLab) : `safe_dict()` / `coerce_tool_args()` dans `backend/app/dialogue/tool_args.py` (bug E005, recette 2026-09-02).

### Compte agent Milan (Aerys — pas un secret GitHub)

**Milan** est l'agent DevOps Aerys (`@milan`, rôle DevOps) du projet `eval-autonomie`. Ses credentials ne vivent **pas** dans les secrets GitHub du sandbox ; ils sont provisionnés via le **coffre connecteurs Aerys** (Dashboard → Connecteurs).

| Connecteur | Niveau requis | Capacités pour ce dépôt |
|------------|---------------|-------------------------|
| **GitHub** | L3 | `list_commits`, `list_root_contents`, création PR, lecture CI |
| **Cursor** | L2 | `cursor_develop` / DevRun sur `aerys-eval-sandbox` |

Checklist permissions Milan :

1. App GitHub Cursor installée au **niveau équipe** (Dashboard → Settings → Integrations) avec accès à `Lucid-Project-Official/aerys-eval-sandbox`.
2. Connecteur GitHub Aerys actif en **L3** sur le projet `eval-autonomie` (pas seulement une connexion personnelle).
3. Connecteur Cursor Aerys actif en **L2** avec `CURSOR_REPO_MAP` incluant l'alias `eval-autonomie` → ce dépôt.
4. Variables VPS Aerys (`.env`, voir AgentLab `.env.example`) : `CURSOR_API_KEY`, `CURSOR_REPO_MAP`, `CONNECTOR_ENCRYPTION_KEY`.

### Permissions workflow CI

Le workflow `.github/workflows/ci.yml` déclare :

```yaml
permissions:
  contents: read
  actions: read
```

Cela suffit pour checkout, tests et badge CI. Milan n'a pas besoin de `secrets: write` sur ce dépôt pour la chaîne eval standard.
