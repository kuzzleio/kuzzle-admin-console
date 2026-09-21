# ADR-0012 : `DropdownMenu` écrite à la main, déplacée dans `<body>`, et l'élément courant devient un bouton radio

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

La fin de la phase 2 bute sur les menus déroulants. `b-dropdown` et sa famille
comptent **34 balises dans 10 composants**, répartis sur les trois domaines
restants — `Data`, `Security`, `Common`. Ce n'est pas un sujet d'un écran : tant
que la primitive n'existe pas, dix fichiers sont bloqués, dont
`Documents/Page.vue`, le plus gros de `Data`.

Trois faits relevés dans le code pèsent sur la décision.

**1. Le panneau serait tronqué à sa place dans l'arbre.** `Table` enveloppe ses
tableaux dans un `overflow-x-auto` ([ADR-0011](0011-table-sans-data-table.md)),
et un conteneur qui coupe horizontalement coupe aussi verticalement : la
spécification CSS n'autorise pas `overflow-x: auto` avec `overflow-y: visible`,
le navigateur remplace le second par `auto`. `Indexes/DropdownActions.vue` est
dans une cellule de `Table` — un menu en `position: absolute` s'y arrêterait au
bas du tableau. Ce n'est pas une hypothèse : c'est la conséquence d'une décision
déjà prise et déjà en production.

**2. `active` ne disait rien à personne.** `b-dropdown-item` expose une prop
`active` qui pose une classe CSS, et rien d'autre : pas de rôle, pas d'état
ARIA. Dans `Collections/DropdownView.vue`, cinq éléments exclusifs — liste,
colonne, graphique, carte, temps réel — et le seul indice de celui qui est actif
est une nuance de fond. À la lecture d'écran, les cinq sont identiques.

**3. `reka-ui` reste hors d'atteinte** ([ADR-0009](0009-contrat-des-primitives-ui.md)),
donc `DropdownMenuRoot` aussi. Le comportement clavier du motif *menu button*
de l'ARIA APG est à notre charge.

## Décision

**1. `DropdownMenu` est écrite à la main, à l'API de shadcn-vue.**
`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`,
`DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`,
`DropdownMenuSeparator`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`.

**2. Le panneau est déplacé dans `<body>` à l'ouverture**, comme `Dialog`
([ADR-0010](0010-primitive-dialog-en-vue-2.md)), et placé en `position: fixed`
d'après le rectangle du déclencheur — replacé au défilement et au
redimensionnement, basculé au-dessus du déclencheur quand le bas manque de
place. C'est plus cher qu'un `position: absolute`, et c'est ce que le point 1 du
contexte impose. Le `z-index` est à 1020 : sous `Dialog` (1030) et sous la bande
modale de Bootstrap, pour qu'un menu ouvert ne passe jamais devant une modale.

**3. Un élément qui désigne un choix exclusif est un `DropdownMenuRadioItem`,
pas un `DropdownMenuItem` avec une classe.** `role="menuitemradio"` et
`aria-checked` remplacent la prop `active`. Ce n'est pas une amélioration
gratuite : l'amont n'a pas de prop `active` sur `DropdownMenuItem`, et il
fallait de toute façon choisir ce qui la remplace.

**4. Le comportement clavier est dans la primitive, pas dans les sites
d'appel** : flèches haut/bas depuis le déclencheur et dans le panneau,
`Début`/`Fin`, `Échap` qui ferme et rend le focus au déclencheur, `Tab` qui
ferme. Le menu **ne piège pas le focus** — un menu n'est pas modal, et le piège
enfermerait l'utilisateur dans un panneau qu'aucun fond assombri ne signale.

**5. Un élément désactivé n'est pas activable.** `b-dropdown-item` posait une
classe `disabled` et laissait le clic atteindre le `<a>` ; seul le fait que
l'action derrière ne faisait rien évitait le dégât. Ici le clic est arrêté,
`aria-disabled` est annoncé, et l'élément est retiré de la navigation aux
flèches.

**6. L'ouverture est contrôlée ou non, au choix du site d'appel.** Sans prop
`open`, la racine gère son état — c'est ce dont ont besoin les dix composants à
reprendre, et c'est ce que faisait `b-dropdown`. Avec, l'appelant décide, comme
chez l'amont. Contrairement à `Dialog`, il n'y avait pas de registre global à
démanteler : l'état de `b-dropdown` était déjà local.

## Conséquences

### Positives

- Dix composants sont débloqués d'un coup, dont `Documents/Page.vue`.
- L'élément de menu courant est annoncé. C'est une correction d'accessibilité
  que la migration paie une fois, au lieu de la reconduire.
- Le placement dans `<body>` supprime par construction une classe entière de
  bugs — le menu tronqué par un ancêtre — qui ne se manifeste que sur certains
  écrans et se diagnostique mal.

### Négatives

- Le placement est du code que nous maintenons : rectangle du déclencheur,
  défilement, redimensionnement, bascule vers le haut. `reka-ui` s'en charge
  avec Floating UI ; nous faisons le strict nécessaire, sans dépendance.
- Un panneau en `position: fixed` ne suit pas son déclencheur pendant une
  animation CSS. Aucun des dix sites d'appel n'en a.

### Risques acceptés

- Comme pour `Dialog`, le nœud déplacé dans `<body>` sort de l'arbre que Vue
  gère visuellement. La primitive le retire avant destruction ; c'est le point
  à vérifier en revue sur toute évolution de `DropdownMenuContent`.
- `provide()` n'est évalué qu'une fois en Vue 2 : le contexte fourni aux
  descendants est **l'instance de la racine**, et non un objet littéral, qui
  figerait `isOpen`. C'est un écart de mise en œuvre avec `Dialog`, dont le
  contexte ne portait qu'une méthode.

## Alternatives écartées

- **`position: absolute` dans un parent `relative`.** Plus simple, suit le
  déclencheur gratuitement, et tronqué dans toute cellule de `Table`. Un défaut
  qui ne se manifeste que sur certains écrans est pire qu'un défaut constant —
  le même raisonnement qu'ADR-0010.
- **Ajouter Floating UI.** C'est ce qu'utilise l'amont, et ce sera sans doute
  le bon choix en phase 4 avec `reka-ui`. Ajouter une dépendance au moment
  précis où l'on en retire une demanderait sa propre ADR, pour un besoin que
  soixante lignes couvrent.
- **Une prop `active` sur `DropdownMenuItem`, pour coller à `b-dropdown`.**
  Reconduirait dans le design system une API qui n'existe pas en amont, et avec
  elle le défaut d'accessibilité qu'on est en train de payer pour retirer.
- **Garder `b-dropdown` jusqu'à la phase 4.** Reviendrait à garder
  `bootstrap-vue` pour dix composants, donc à ne pas finir la phase 2 — ce
  qu'[ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md) refuse.
