# ADR-0008 : Faire cohabiter Tailwind et Bootstrap 4 pendant la phase 2

- **Statut** : Acceptée
- **Date** : 2026-09-19
- **Décideurs** : Ricky

## Contexte

[ADR-0003](0003-design-system-tailwind-shadcn-vue.md) retient Tailwind CSS 4 et
shadcn-vue. [ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md) impose de
reprendre les écrans **un par un**, la console restant livrable à chaque étape.

Conséquence directe : pendant toute la phase 2, **les deux systèmes de style
coexistent dans la même page**. Un écran repris est en Tailwind, celui d'à côté
est encore en Bootstrap 4, et les deux partagent la même feuille de styles.

Trois faits mesurés en branchant Tailwind (sonde jetable, valeurs lues via
`getComputedStyle` dans le navigateur de la suite Cypress) :

1. **Le preflight de Tailwind remettrait à plat l'existant.** Il réinitialise
   marges, titres, listes, boutons et formulaires — exactement ce sur quoi
   reposent les 140 composants encore en Bootstrap.

2. **Les couches CSS suffisent pour les propriétés ordinaires.** Sur
   `<button class="btn btn-primary tw:bg-accent">`, le fond mesuré est
   `rgb(239, 201, 76)` — le token `--accent`, pas le bleu Bootstrap. Une règle
   d'une couche perd face à une règle d'une couche déclarée après elle, quelle
   que soit sa spécificité.

3. **…sauf contre `!important`, et Bootstrap 4 en met partout dans ses
   utilitaires.** Sur le même élément, `rounded-lg` donnait `4.8px` au lieu des
   `6px` attendus : Bootstrap définit lui aussi `.rounded-lg`, en
   `border-radius: .3rem !important`. Une déclaration `!important` **inverse**
   l'ordre des couches — la couche la plus basse l'emporte. Les couches ne
   protègent donc pas des **collisions de noms**, et il y en a beaucoup :
   `rounded`, `border`, `shadow`, `text-center`, `m-0`, `p-0`, `w-100`,
   `d-block`, `bg-primary`…

## Décision

Trois réglages, tous temporaires, tous levés en fin de phase 2 avec Bootstrap.

**1. Pas de preflight.** On importe `theme.css` et `utilities.css`, pas
`preflight.css`. La réinitialisation reviendra quand Bootstrap sortira — c'est
une ligne à ajouter, et à ce moment-là elle ne cassera plus rien.

**2. Le legacy dans une couche `legacy`, déclarée en premier.** Tout
`style.scss` — Bootstrap, bootstrap-vue, FontAwesome et nos feuilles SCSS
historiques — est enveloppé dans `@layer legacy`. Une utilitaire Tailwind posée
sur un écran en cours de reprise gagne sans qu'on ait à surenchérir en
`!important` ou en sélecteurs plus spécifiques. C'est ce qui rend la reprise
écran par écran tenable : on ne se bat pas contre l'ancien style, on passe
au-dessus.

**3. Les utilitaires Tailwind sont préfixées `tw:`.** `tw:bg-accent`,
`tw:rounded-lg`. C'est la seule réponse au point 3 ci-dessus : tant que
Bootstrap est là, un nom de classe partagé est tranché par son `!important`, pas
par nos couches. Le préfixe supprime le problème au lieu de le gérer au cas par
cas.

Vérifié après coup sur la même sonde : avec le préfixe, le fond vaut
`rgb(239, 201, 76)` **et** le rayon vaut `6px`, soit `calc(var(--radius) + 2px)`.

## Conséquences

### Positives
- La console reste livrable à chaque PR de la phase 2, ce qui était la condition
  d'ADR-0002.
- Un écran repris est visuellement prévisible : ses utilitaires gagnent toujours.
- Le retrait est mécanique et daté : supprimer `@layer legacy`, ajouter le
  preflight, retirer le préfixe — un `sed` sur `tw:` — le jour où Bootstrap s'en
  va. Rien de tout cela n'est une dette qui se négocie.

### Négatives
- `tw:` alourdit les templates, dans un système déjà verbeux. C'est le coût
  assumé de la cohabitation ; il disparaît en fin de phase 2.
- Deux vocabulaires d'utilitaires coexistent, et un même écran peut porter les
  deux. La règle est simple et se vérifie en revue : un composant repris n'a
  plus **aucune** classe Bootstrap.

### Risques acceptés
- Le retrait du préfixe en fin de phase 2 est un `sed` sur toute la base. Il est
  mécanique, mais il n'est pas couvert par les tests — les 17 specs valident le
  comportement, pas l'apparence. À faire en une PR dédiée, écran par écran à
  l'œil, pas noyé dans autre chose.

## Alternatives écartées

- **Ne pas préfixer et traiter les collisions au cas par cas.** C'est ce qui a
  été essayé en premier. La collision ne se voit pas : `rounded-lg` ne produit
  pas d'erreur, il produit 4,8 px au lieu de 6. Un écart silencieux de cette
  nature, sur une base de 140 composants, se paierait en heures de débogage
  d'apparence.
- **Retirer les utilitaires de Bootstrap de l'import SCSS.** Supprimerait la
  cause, mais la console utilise massivement `d-flex`, `mt-2`, `text-right` :
  il faudrait reprendre les 140 composants d'un coup, soit exactement ce
  qu'ADR-0002 refuse.
- **Scoper Tailwind à un sélecteur racine** (`.tw-root > …`). Oblige à porter un
  conteneur sur chaque écran repris, sans rien régler pour les `!important`.
- **Attendre la phase 4 et le vrai shadcn-vue.** Reviendrait à ne pas faire la
  phase 2, donc à migrer vers Vue 3 avec `bootstrap-vue` — ce qu'ADR-0002 écarte.
