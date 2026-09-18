# ADR-0001 : Système de suivi du chantier de modernisation

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

Le chantier de modernisation (Node, Vue 3, refonte UI/UX) s'étale sur plusieurs
mois et plusieurs sessions de travail, potentiellement à plusieurs personnes et
avec l'aide d'agents. Trois besoins distincts se mélangent facilement :

1. **Pourquoi** tel choix a été fait (« pourquoi pas bootstrap-vue-next ? »),
   question qui se repose invariablement 6 mois plus tard ;
2. **Où on en est** sur 140 composants et une vingtaine de dépendances ;
3. **Qui fait quoi**, et quoi livrer en priorité.

Un seul support pour les trois produit soit un document fleuve que personne ne
lit, soit des issues GitHub qui perdent le contexte dès qu'elles sont fermées.

## Décision

Trois supports, une responsabilité chacun, **sans duplication** :

| Support | Porte | Nature |
|---|---|---|
| `docs/adr/` | le **pourquoi** | figé, versionné avec le code |
| `docs/MIGRATION.md` | le **où on en est** | vivant, mis à jour à chaque PR |
| GitHub Issues | le **qui fait quoi** | assignable, jetable |
| `CLAUDE.md` | le contexte d'amorçage | pour les agents |

Règles d'arbitrage :

- Une décision qu'on devra justifier plus tard → **ADR**. Y compris les
  décisions négatives (« on ne migre pas X, et voici pourquoi »).
- Un état d'avancement, un inventaire, un piège rencontré → **MIGRATION.md**.
- Un travail assignable et livrable → **issue**, rattachée à un Epic.
- Une issue ne duplique jamais le contenu d'une ADR : elle **la référence**.

La section *Gotchas* de `MIGRATION.md` est alimentée **au moment où le piège est
rencontré**, pas en fin de chantier. C'est la partie qui a le plus de valeur et
celle qu'on oublie le plus systématiquement d'écrire.

## Conséquences

### Positives
- Le « pourquoi » survit au départ des personnes et à la fermeture des issues.
- Un nouvel arrivant (humain ou agent) lit 3 fichiers et sait où il met les pieds.
- Les ADR étant dans le repo, elles sont revues en PR comme du code.

### Négatives
- Discipline nécessaire : `MIGRATION.md` non mis à jour devient un mensonge, ce
  qui est pire que pas de suivi du tout. On l'inclut donc dans la definition of
  done de chaque PR de migration.

### Risques acceptés
- Léger recouvrement entre Epics GitHub et `MIGRATION.md`. Accepté : l'Epic porte
  la priorisation et la discussion, le document porte l'exhaustivité.

## Alternatives écartées

- **Tout en issues GitHub.** Écarté : le raisonnement derrière une décision se
  dilue dans les fils de commentaires et devient introuvable une fois l'issue
  fermée. Et le suivi de 140 composants en issues est ingérable.
- **Tout en documents.** Écarté : rien d'assignable, pas de notifications, pas de
  lien avec les PR, invisible pour les contributeurs externes du projet open
  source.
- **Un outil externe (Notion, Jira).** Écarté : désynchronisation garantie avec
  le code, et inaccessible aux contributeurs externes.
