# ADR-0003 : Tailwind CSS + shadcn-vue comme design system

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

La sortie de `bootstrap-vue` ([ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md))
impose de choisir ce qui le remplace. L'objectif n'est pas seulement technique :
il y a une demande explicite de **refonte UI/UX**, donc de reprendre la main sur
l'apparence et les parcours, pas juste de troquer une librairie contre une autre.

Contraintes du produit : c'est une console d'administration. Les écrans lourds
sont des listes denses (documents, users, roles, profiles), un éditeur JSON, un
constructeur de filtres, des vues carte et graphiques. Beaucoup de composants
« métier » sont déjà écrits à la main dans `src/components/`.

## Décision

**Tailwind CSS 4** pour le style, **shadcn-vue** pour les composants.

shadcn-vue n'est pas une dépendance classique : les composants sont **copiés dans
le repo** (`src/components/ui/`) et nous appartiennent. Ils s'appuient sur
`reka-ui` pour le comportement accessible (focus trap, navigation clavier,
ARIA) et sur Tailwind pour le style.

Conformément à l'ADR-0002, en phase 1 et 2 on écrit ces composants **à la main en
Vue 2**, en respectant scrupuleusement l'API publique de shadcn-vue. En phase 4,
on les remplace par les vrais composants shadcn-vue : l'API étant identique, les
sites d'appel ne bougent pas.

Les tokens de design (couleurs, typo, rayons, espacements, dark mode) sont
définis **une seule fois** en variables CSS et consommés par Tailwind. Aucune
valeur en dur dans les composants.

## Conséquences

### Positives
- Contrôle total sur l'apparence : c'est la condition d'une vraie refonte UI/UX.
- Pas de dépendance à une librairie de composants qui peut être abandonnée — le
  projet vient précisément de se faire piéger par `bootstrap-vue` et
  `vue-form-generator`. Le code des composants est chez nous.
- L'accessibilité vient de `reka-ui`, testée, plutôt que d'être réimplémentée.
- Le dark mode devient trivial (variables CSS), ce qui est régulièrement demandé
  sur une console d'admin.

### Négatives
- C'est l'option avec le plus de travail initial : il faut construire les
  primitives avant de pouvoir migrer le premier écran.
- Les composants copiés sont à notre charge : pas de mises à jour automatiques.
  C'est le compromis assumé de shadcn-vue (contrôle contre maintenance).
- Verbosité des classes utilitaires dans les templates. Mitigation : `cva` pour
  les variantes, et extraction en primitives dès qu'un motif se répète.

### Risques acceptés
- Sans garde-fou, un design system « maison » dérive en incohérence. Mitigation :
  les tokens sont la seule source de vérité, et toute valeur en dur dans un
  composant est un motif de rejet en revue.

## Alternatives écartées

- **`bootstrap-vue-next` + Bootstrap 5.** Le moins de travail, mais ne répond pas
  à la demande de refonte UI/UX (on reste visuellement sur Bootstrap), et la
  librairie était encore pre-1.0 au moment de la décision — soit exactement le
  type de pari qui a mené à la situation actuelle.
- **PrimeVue.** Sérieusement considéré : composants riches et matures qui collent
  aux besoins d'une console (datatable, tree, forms). Écarté parce qu'il rend la
  couche de présentation dépendante d'un tiers et contraint le design à son
  système de thèmes — on retomberait dans le schéma « notre UI appartient à une
  librairie ».
- **Vuetify.** Écarté : Material Design impose une identité visuelle forte et peu
  compatible avec la densité d'information d'une console d'admin.
- **Tailwind seul, sans shadcn-vue.** Écarté : il faudrait réimplémenter à la main
  l'accessibilité des composants interactifs (modales, dropdowns, combobox), ce
  qui est un piège classique et coûteux.
