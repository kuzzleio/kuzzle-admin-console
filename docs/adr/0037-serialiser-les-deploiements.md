# ADR-0037 : Sérialiser les runs de déploiement au niveau du workflow

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

Le 2026-09-24, la pile #1094 → #1095 → #1096 a été fusionnée sur `5-dev` en
une minute. `push_5_dev.workflow.yml` n'avait aucun bloc `concurrency` : les
trois runs ont tourné en parallèle, et chacun déploie à la fin de ses tests
E2E. Celui de #1095 a fini le dernier (20:06:54) et a écrasé le déploiement de
#1096 : console-v5.kuzzle.io a servi `@vue/compat` alors que la tête de branche
l'avait retiré ([G-064](../MIGRATION.md#g-064)). Tous les runs étaient verts ;
il a fallu relancer le run de tête à la main.

`push_master.workflow.yml`, qui déploie console.kuzzle.io, a la même forme et le
même défaut.

## Décision

Un bloc `concurrency` **au niveau du workflow**, avec
`cancel-in-progress: false`, sur les deux workflows de déploiement :

```yaml
concurrency:
  group: deploy-console-v5 # deploy-console-production sur master
  cancel-in-progress: false
```

Les runs d'une même branche s'exécutent un par un, dans l'ordre des pushes. Le
run en cours va au bout ; quand un push arrive alors qu'un run attend déjà,
GitHub annule celui qui attend. Le dernier run à déployer est donc toujours
celui du dernier commit.

## Conséquences

### Positives

- Le contenu servi correspond à la tête de branche, sans vérification manuelle.
- Un déploiement n'est jamais interrompu à mi-synchronisation S3.

### Négatives

- Une rafale de fusions ne teste plus sur `push` les commits intermédiaires :
  leur run apparaît **annulé** (gris), pas vert. Ils ont été testés sur leur
  PR, et la tête de pile teste leur somme.
- Deux fusions rapprochées coûtent deux runs successifs (~7 min chacun) au lieu
  de deux runs parallèles.

## Alternatives écartées

- **`concurrency` sur le seul job de déploiement** (proposé le 2026-09-24).
  Il empêche deux déploiements _simultanés_, pas un déploiement _dans le
  désordre_ : les runs restent parallèles jusqu'au déploiement, et celui dont
  les E2E finissent en dernier déploie en dernier. C'est exactement la course
  observée.
- **`cancel-in-progress: true`**. Plus rapide, mais peut couper `aws s3 sync`
  en plein milieu et laisser un bucket mêlant deux builds le temps que le run
  suivant finisse.
- **Garde « `github.sha` est-il encore la tête ? » avant de déployer**. Juste,
  mais c'est du shell à maintenir pour obtenir ce que la plateforme fournit ; à
  reconsidérer si la sérialisation devenait trop lente.
