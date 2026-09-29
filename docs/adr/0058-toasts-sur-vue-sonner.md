# ADR-0058 : Les toasts passent sur `vue-sonner`, l'état hors ligne devient un bandeau

- **Statut** : Acceptée
- **Date** : 2026-09-29
- **Décideurs** : Ricky
- **Remplace** : les points 1 et 2 d'[ADR-0020](0020-systeme-de-toasts.md)
  (le store tient la liste, `Common/Toaster.vue` la rend)

## Contexte

[ADR-0054](0054-vrai-shadcn-vue.md) laissait le lot 9 ouvert : l'amont n'a
plus de `Toast`, il est passé à `vue-sonner`, et la question était de savoir
si sonner garde ce que la console attend de ses notifications :

1. une erreur (`danger`, `warning`) reste affichée jusqu'à ce qu'on la ferme
   ([ADR-0020](0020-systeme-de-toasts.md), point 4) ;
2. deux toasts ont des actions — la télémétrie (« Disable telemetry » /
   « Accept », sans croix) et l'absence d'administrateur (« Ok, got it », avec
   une infobulle, et un lien dans la phrase) ;
3. le toast hors ligne est à part : unique, en haut au centre, et deux
   commandes Cypress s'accrochent à son `id` (`#offline-toast`) ;
4. l'API `this.$toast.*` et `useToasterStore().push()`, appelée depuis 26
   fichiers.

La mesure, en posant `vue-sonner` 2.0.9 par la CLI :

- **les points 1 et 4 passent** : `duration: Infinity`, et le store peut
  appeler `toast()` à la place de tenir sa liste ;
- **une action de sonner est son propre `<button>`** : sans variante, sans
  `title`, au plus deux (`action` et `cancel`). Un composant passé en
  `action` est rendu *dans* ce bouton. La **description**, elle, accepte un
  composant et ses props ;
- **la position est celle du `Toaster`** : un toast en haut au centre au
  milieu d'une pile en bas à droite demande un second `Toaster` ;
- **aucune spec ne vise `data-cy="Toast--<variant>"`**, mais `login.spec`
  vise `data-slot="toast"` et `data-slot="toast-close"`. Sonner ne pose pas
  d'attribut arbitraire sur un toast ; il rend `data-sonner-toast`,
  `data-type` et `data-close-button`, que la spec vise désormais — la
  sémantique de la bibliothèque, comme le permet le point 6 d'ADR-0054. Les
  captures passent par le texte (`cy.contains`).

## Décision

**1. `vue-sonner` rend les notifications.** `ui/sonner/Sonner.vue` vient de
`shadcn-vue add sonner`, la DA y est reportée ; il est monté une fois, dans
`App.vue`. La liste, les minuteries, l'empilement, la pause au survol, le
glisser pour fermer et la région annoncée (`aria-live`, raccourci Alt+T) sont
ceux de sonner. `Common/Toaster.vue` et `ui/toast/` sont supprimés.

**2. Le store reste l'API, et n'a plus d'état.** `useToasterStore().push()`
garde sa signature ; il traduit la variante (`danger` → `error`), applique la
règle de persistance, et appelle `toast[type]()`. Les sites d'appel ne
changent pas.

**3. Le message, le lien et les actions vont dans la description**, par
`Common/ToastBody.vue` : les actions y sont le `Button` de la console, avec
leur variante et leur infobulle, et ferment le toast. Les boutons `action` et
`cancel` de sonner ne servent pas.

**4. L'état hors ligne n'est pas une notification.** Il ne dit pas qu'un
événement a eu lieu : il dure tant que la coupure dure. Il devient un bandeau
`Alert` (`role="alert"`) fixé en haut au centre, hors de la pile. Il garde
`id="offline-toast"`, et les deux commandes Cypress ne changent pas.

**5. Les écarts avec l'amont** sont ceux-ci :

| Écart | Raison |
|---|---|
| Icônes Font Awesome, `Spinner` pour le chargement | La DA ([`DESIGN.md`](../../DESIGN.md)) |
| `rich-colors` actif, ses variables reçoivent les teintes de la primitive précédente, mêlées à `card` | La DA ; un toast transparent est illisible sur ce qu'il recouvre (E-03) |
| `z-index` par `--z-toast` | [ADR-0054](0054-vrai-shadcn-vue.md), point 5 : la feuille de sonner pose 999999999, au-dessus du lien d'évitement |
| `theme` suit `useTheme()` | La bascule impose clair ou sombre, que `prefers-color-scheme` ne dit pas ([ADR-0056](0056-theme-sombre-avance.md)) |

## Conséquences

### Positives
- Le dernier composant à comportement écrit ici part : le critère 4
  d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md) est rempli.
- La pause au survol et au focus, que la console n'avait pas : un message
  qu'on est en train de lire ne disparaît plus.
- Les toasts sont regroupés dans une région nommée, atteignable au clavier
  (Alt+T), là où chacun portait son propre `role="alert"`.

### Négatives
- Une dépendance de production de plus, `vue-sonner`, et sa feuille de style.
- Le store importe un composant (`ToastBody`) : c'est le prix de garder
  l'API impérative intacte.
- Une icône par type apparaît à gauche du titre, que les toasts précédents
  n'avaient pas.

### Risques acceptés
- `class-merge.ts` ne part pas avec ce lot : `Form*`, `Checkbox`, `Switch` et
  `FileInput`, qu'ADR-0054 garde, s'en servent encore. Il partira avec leur
  passage à `props.class`, au plus tard au critère 7.

## Alternatives écartées

- **Les primitives `Toast` de `reka-ui`.** Le comportement serait maintenu en
  amont, mais aucun registre shadcn-vue ne les fournit plus : la primitive
  serait écrite à la main, et sa montée de version redeviendrait manuelle —
  ce que le point 1 d'ADR-0054 écarte.
- **Garder la primitive de la console.** La v5 sortirait avec ses propres
  minuteries et son propre empilement, sans test.
- **Le toast hors ligne dans sonner, par un second `Toaster`.** Deux zones de
  notifications, pour un message qui n'en est pas une.
- **Les actions par `action` et `cancel`.** Elles perdent la variante,
  l'infobulle de « Ok, got it », et le lien de la phrase.
