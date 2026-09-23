# ADR-0030 : le chantier déménage sur `5-dev`, et se déploie sur console-v5.kuzzle.io

- **Statut** : Acceptée
- **Date** : 2026-09-23
- **Décideurs** : Ricky

## Contexte

Le chantier de modernisation vit sur `4-dev` depuis son premier commit
([ADR-0001](0001-systeme-de-suivi.md), 2026-09-18). Au 2026-09-23, cela
représente **107 commits** et 36 PR fusionnées, de
[#1021](https://github.com/kuzzleio/kuzzle-admin-console/pull/1021) à
[#1075](https://github.com/kuzzleio/kuzzle-admin-console/pull/1075), c'est-à-dire
tout ce qui va de la mise en place du suivi à la bascule Vue 3 sous
`@vue/compat` ([ADR-0027](0027-bascule-vue-3-sous-compat.md)).

Or `4-dev` n'est pas une branche de chantier : c'est la branche de *staging* du
produit. Un push dessus déploie sur **next-console.kuzzle.io**, qui est la
console que l'équipe et les utilisateurs regardent pour voir la v4 à venir.
Depuis 2026-09-18, next-console ne montre donc plus la v4 : elle montre un
chantier à mi-parcours, avec `@vue/compat` allumé, des drapeaux de compatibilité
encore actifs et une refonte UI en cours.

Deux besoins se sont détachés, et ils ne peuvent pas tenir sur une seule branche :

1. **Revoir une console v4 livrable.** next-console doit redevenir ce qu'elle
   était, tout de suite, sans attendre la fin de la phase 4.
2. **Voir le résultat du chantier.** Une migration de cette taille se juge dans
   un navigateur, pas dans un `npm run build`. Les 17 specs sont un filet
   ([CLAUDE.md](../../CLAUDE.md#garde-fou)) ; elles ne disent rien de ce à quoi
   la console ressemble.

Détail qui rend l'opération simple : le point de départ du chantier sur `4-dev`
(`d6134eaa`, PR #1016) est **strictement identique à `master`** — `git diff`
entre les deux est vide. « Remettre `4-dev` comme avant » et « remettre `4-dev`
sur `master` » sont la même opération.

## Décision

**Le chantier de modernisation quitte `4-dev` pour `5-dev`, et se déploie sur
console-v5.kuzzle.io.**

- `5-dev` est créée sur `e6d1f1b8`, l'ancienne pointe de `4-dev`. L'historique du
  chantier est déplacé tel quel : pas de rebase, pas d'écrasement, les 107
  commits et leurs 36 merges gardent leurs SHA.
- `4-dev` est ramenée sur `d6134eaa` par un `push --force-with-lease`, et
  redéploie next-console.kuzzle.io dans son état v4.
- Le workflow de push devient `push_5_dev.workflow.yml` : il se déclenche sur
  `5-dev` et déploie sur console-v5.kuzzle.io. `4-dev` retrouve, avec le reste de
  son arbre, le workflow d'origine qui déploie next-console.
- Les PR du chantier en vol sont rebasées sur `5-dev`. La pile
  [#1077](https://github.com/kuzzleio/kuzzle-admin-console/pull/1077) →
  #1078 → #1079 → #1080 n'a qu'une base à changer, celle de #1077 ; les trois
  autres sont empilées les unes sur les autres et suivent.
- Le numéro `5` dit ce qu'il dit : ce chantier produit la **v5** de la console.
  Ce n'est pas une v4 avec du Vue 3 dedans — bootstrap-vue est sorti, l'UI est
  refondue, l'API des composants a changé.

### Le job de déploiement est conditionné, pas commenté

Le bucket S3 et la distribution CloudFront de console-v5.kuzzle.io n'existent
pas encore. Le job `deploy-v5` lit `vars.CONSOLE_V5_S3_BUCKET` et
`vars.CONSOLE_V5_CLOUDFRONT_ID`, deux **variables de dépôt**, et porte un `if:`
qui l'ignore tant que les deux sont vides.

Un placeholder en dur aurait rendu rouge chaque push sur `5-dev` jusqu'à la
création de l'infra — et pire, après un `aws s3 rm --recursive` sur un bucket
qui n'existe pas. Avec le `if:`, la CI reste verte, le job apparaît « skipped »,
et le déploiement s'allume le jour où les deux variables sont renseignées : sans
toucher au code, sans PR.

## Conséquences

- **next-console.kuzzle.io redevient la v4.** Le premier push sur `4-dev` après
  le reset la redéploie.
- **`4-dev` est réécrite.** Quiconque l'a en local doit faire
  `git fetch && git reset --hard origin/4-dev`. Un `git pull` produirait un
  merge qui réintroduirait les 107 commits — c'est le seul vrai piège de
  l'opération.
- **Rien n'est perdu** : les 107 commits sont sur `5-dev`, poussée avant le
  reset.
- **`CLAUDE.md` change de branche de travail** : `5-dev`. `master` reste la
  branche principale.
- **La fin du chantier n'est plus un merge dans `4-dev`.** `5-dev` porte une
  version majeure ; sa destination est `master` via une `5-stable`, sur le
  modèle des `2-stable` / `3-stable` existantes. Cette ADR ne tranche pas cette
  étape, elle note seulement qu'elle n'est plus un détail de merge.
- `push_5_dev.workflow.yml` ne doit pas être fusionné dans `4-dev` : il ferait
  déployer `4-dev` sur console-v5. Le renommage du fichier rend le conflit
  visible au lieu de silencieux.

### Risques acceptés

- **Deux consoles déployées en parallèle**, donc deux endroits où un bug peut
  être signalé. C'est le but : on veut pouvoir comparer.
- **Une branche de chantier longue durée diverge.** `5-dev` ne recevra
  probablement jamais de correctif v4 par merge — les deux arbres n'ont plus la
  même UI. Un correctif qui compte devra être porté à la main, et c'est
  exactement ce que la divergence coûte.

## Alternatives écartées

- **Revert des 36 merges sur `4-dev`.** Pas de réécriture, donc pas de reset
  chez les autres. Mais `4-dev` traînerait le chantier *et* son annulation, et
  un futur merge du chantier ré-annulerait le revert — le piège classique du
  revert de merge. Le coût d'un `reset --hard` documenté est plus faible que
  celui d'un historique qui ment.
- **Laisser le chantier sur `4-dev` et déployer la v4 depuis `master`.**
  Techniquement possible : `master` et le point pré-migration sont identiques.
  Mais on se retrouverait avec une branche nommée `4-dev` qui ne construit pas
  la v4, et un staging alimenté par la branche de release. Le nom des branches
  est de la documentation.
- **Attendre la fin de la phase 4 pour créer `5-dev`.** C'est ce qui a été fait
  jusqu'ici, et c'est ce qui a rendu next-console inutilisable pendant cinq
  jours.
