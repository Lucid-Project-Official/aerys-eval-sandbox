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

## Événements runtime

Quand `platform.status` change en base, le GoalManager émet
`ProjectStateUpdated`. Le script `verify-platform.js` émet en plus :

- `WorkNodeCompleted` — nœud de travail terminé pour `platform.status`
- `GoalVerification` — contrôle des critères de succès de l'objectif
- `GoalSuccess` — objectif atteint avec `work_node_status: COMPLETED`
