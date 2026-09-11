# Convention agents Cursor — preuve ProjectState (plateforme)

Les missions Aerys qui ferment un gap `platform.status` attendent une preuve
mesurable dans le **ProjectState** (ou dans les `metrics` du résultat d'exécution).

## Fichier optionnel

Créer `.aerys/project_state_patch.json` à la racine du workspace :

```json
{
  "platform": {
    "developed": true,
    "status": "ready"
  }
}
```

Le provider Cursor extrait aussi les blocs JSON / mentions `platform.status`
dans le résumé de run pour alimenter le Verifier.

## Vérification locale

```bash
npm run verify-platform
```
