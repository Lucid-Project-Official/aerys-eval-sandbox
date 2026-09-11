# Convention agents Cursor — preuve ProjectState

Les missions Aerys qui ferment un gap `platform.status` attendent une preuve
mesurable dans le **ProjectState** (ou dans les `metrics` du résultat d'exécution).

## Fichier optionnel

Créer `.aerys/project_state_patch.json` à la racine du workspace :

```json
{
  "platform": {
    "status": "ready",
    "developed": true
  }
}
```

Le provider Cursor extrait aussi les blocs JSON / mentions `platform.status`
dans le résumé de run pour alimenter le Verifier.

## Événement runtime

Quand `platform.status` change en base, le GoalManager émet
`GoalSuccess` (en plus de `ProjectStateUpdated`).
