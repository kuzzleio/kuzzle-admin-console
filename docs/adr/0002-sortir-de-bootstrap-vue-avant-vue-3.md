# ADR-0002 : Sortir de bootstrap-vue avant de migrer vers Vue 3

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

L'Admin Console est en Vue 2.7.16, EOL depuis décembre 2023. La migration est
nécessaire. L'inventaire du 2026-09-18 donne :

- 140 composants `.vue`, ~25 000 LOC, dont **135 en Options API** (un seul
  fichier utilise `defineComponent`) ;
- **813 balises `<b-*>`** de `bootstrap-vue` 2, réparties sur 4 domaines :
  Data (298), Security (217), Common (184), ApiAction (49) ;
- 17 specs Cypress couvrant les parcours principaux.

Le point dur : **`bootstrap-vue` 2 n'a pas de version Vue 3 et ne fonctionne pas
sous `@vue/compat`** — la librairie s'appuie sur des internals de Vue 2 que le
build de compatibilité ne couvre pas. Concrètement, la journée où l'on bascule
`vue` en 3.x, les 813 balises `<b-*>` cessent de rendre **en même temps**.

Or la contrainte posée pour ce chantier est de rester livrable en continu : la
console doit pouvoir partir en production à tout moment, et chaque PR doit être
relisable.

Ces deux faits sont incompatibles avec l'ordre intuitif « on migre Vue, puis on
refait l'UI ».

## Décision

On inverse l'ordre : **on supprime `bootstrap-vue` en restant sur Vue 2**, puis
on migre vers Vue 3.

Ce que ça suppose et pourquoi c'est possible : **Tailwind CSS est agnostique du
framework**. C'est du CSS généré à partir des classes trouvées dans les sources ;
il fonctionne à l'identique sous Vue 2 et Vue 3. On peut donc faire toute la
refonte visuelle avant de toucher à Vue.

Phasage :

- **Phase 0 — Toolchain.** Node 24 LTS, Vite, TypeScript, ESLint, Cypress. On
  reste en Vue 2. Voir [ADR-0004](0004-node-24-lts.md).
- **Phase 1 — Fondations design.** Tailwind installé *à côté* de Bootstrap 4,
  tokens (couleurs, typo, espacements, dark mode), et primitives locales
  (`Button`, `Card`, `Modal`, `Input`…) écrites **en Options API Vue 2 mais avec
  l'API publique de shadcn-vue** (mêmes noms de props, de slots et d'events).
- **Phase 2 — Dé-bootstrapisation, écran par écran.** Par domaine fonctionnel,
  dans l'ordre Common → Security → ApiAction → Data. Chaque PR remplace les
  `<b-*>` d'un écran, est validée par les specs Cypress du domaine, et est
  livrable. **C'est ici que se fait la refonte UI/UX** — pas seulement un
  remplacement 1:1, on retravaille les parcours au passage.
- **Phase 3 — Vue 3.** Une fois le dernier `<b-*>` supprimé, bascule vers Vue 3
  avec `@vue/compat` en filet temporaire, plus vue-router, Pinia, et les
  dépendances Vue 2 restantes (voir `MIGRATION.md`).
- **Phase 4 — Nettoyage.** Retrait de `@vue/compat`, adoption des vrais
  composants shadcn-vue (qui remplacent les primitives de la phase 1, l'API étant
  déjà la bonne), migration progressive Options API → Composition API.

## Conséquences

### Positives
- La console reste livrable à **chaque** étape. Aucun big-bang.
- La refonte UI/UX, qui est le livrable le plus visible, arrive **tôt** plutôt
  qu'en bout de chaîne.
- Au moment de basculer Vue 3, la dépendance la plus bloquante a déjà disparu :
  la bascule devient mécanique et courte.
- Le travail de la phase 2 n'est pas à refaire : écrire les primitives avec
  l'API shadcn-vue rend le remplacement de la phase 4 largement automatisable.

### Négatives
- Pendant la phase 2, Bootstrap 4 et Tailwind cohabitent dans le bundle. Poids
  temporairement plus élevé et risque de collisions de classes utilitaires.
  Mitigation : préfixer les classes Tailwind si nécessaire, et supprimer
  Bootstrap dès le dernier écran migré.
- Phase 2 = la plus longue du chantier (813 balises). C'est un coût assumé, pas
  une surprise.

### Risques acceptés
- Les specs Cypress peuvent s'appuyer sur des classes Bootstrap et casser à
  chaque écran migré. **À auditer en tout premier** : si c'est le cas, on
  bascule les sélecteurs sur des `data-cy` avant d'entamer la phase 2. Sans
  filet de sécurité, aucune de ces phases n'est tenable.

## Alternatives écartées

- **Migrer Vue 3 d'abord, avec `bootstrap-vue-next`.** C'est le chemin de moindre
  résistance technique, mais il a été écarté pour deux raisons : il fige
  l'identité visuelle sur Bootstrap, alors que l'objectif explicite est une
  refonte UI/UX ; et il fait passer par un remplacement massif (`bootstrap-vue` →
  `bootstrap-vue-next`, API différente) qui serait **jeté** ensuite lors du
  passage à Tailwind. On paierait deux fois la même migration.
- **Branche longue `vue3`.** Écartée : divergence garantie avec `4-dev` où les
  correctifs continuent, et merge hell sur 25k LOC.
- **Rewrite from scratch.** Écartée : coût le plus élevé, et perte du filet
  Cypress existant qui est le principal atout du projet pour une migration.
