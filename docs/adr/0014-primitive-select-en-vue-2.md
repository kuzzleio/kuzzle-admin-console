# ADR-0014 : primitive `Select` en Vue 2, et le panneau flottant extrait

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

`<b-form-select>` apparaît **19 fois dans 6 fichiers**, répartis sur les trois
zones qui restent :

| Fichier | Occurrences | Domaine |
|---|---:|---|
| `Common/Filters/BasicFilter.vue` | 9 | partagé |
| `Security/Users/Steps/UserProfileList.vue` | 5 | Security |
| `Data/Documents/Views/Map.vue` | 2 | Data |
| `Data/Documents/Views/TimeSeries.vue` | 1 | Data |
| `Common/PerPageSelector.vue` | 1 | partagé |
| `Common/Environments/CreateEnvironment.vue` | 1 | partagé |

**Le contexte d'[ADR-0013](0013-primitive-pagination-en-vue-2.md) était inexact
sur un point** : `<b-pagination>` y est présenté comme le dernier composant
`bootstrap-vue` partagé entre Data et Security. `<b-form-select>` l'est aussi.
Ce qui reste vrai est que `Pagination` a débloqué les trois listes ; ce qui
était faux est qu'il n'y avait plus rien après. Une ADR acceptée ne se réécrit
pas : la correction est ici.

`PerPageSelector.vue` est le point de blocage immédiat. Il est utilisé par les
deux vues de ce lot **et** par la liste de documents déjà reprise : tant qu'il
porte un `<b-form-select>`, un écran repris continue de rendre du
`bootstrap-vue`.

Trois choses pèsent sur la décision.

**1. En amont, `Select` n'est pas un `<select>`.** shadcn-vue rend un bouton
`role="combobox"` et un panneau `role="listbox"` de `[role="option"]`, monté par
`reka-ui`. Il n'existe pas de primitive « `<select>` natif habillé » en amont,
et la prop `options` de `<b-form-select>` n'a aucun équivalent : le site d'appel
boucle lui-même sur ses options.

**2. Le panneau flottant existe déjà, écrit une fois.**
`DropdownMenuContent` (ADR-0012) déplace son panneau dans `<body>`, le place en
`position: fixed` d'après le rectangle du déclencheur, le replace au défilement
et bascule au-dessus quand le bas manque de place. Une liste déroulante pose
exactement le même problème, pour la même raison — la primitive `Table`
enveloppe ses tableaux dans un `overflow-x-auto` (ADR-0011).

**3. `cy.select()` ne parle qu'au `<select>` natif.** Dix appels de spec visent
les deux champs repris ici, répartis sur quatre specs de trois domaines —
`PerPageSelector` n'appartient à aucun d'eux (G-028). Quitter le `<select>`
natif, c'est les réécrire.

## Décision

**1. `Select` est écrite à la main, à l'API de shadcn-vue.** Neuf pièces :
`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`,
`SelectLabel`, `SelectItem`, `SelectItemText`, `SelectSeparator`. Le
remplacement en phase 4 doit rester un changement d'import
([ADR-0009](0009-contrat-des-primitives-ui.md)).

**2. Le placement du panneau est extrait dans un mixin partagé**,
`ui/floating-panel.ts`, et `DropdownMenuContent` y est reporté. Le mixin ne
connaît ni les rôles ARIA ni le clavier : il ne sait que déplacer un nœud dans
`<body>` et le placer d'après une ancre. Ce qui distingue un menu d'une liste
reste dans chaque famille. C'est une extraction sans changement de
comportement ; les specs du temps réel et des collections en sont le contrôle.

**3. Une liste déroulante n'est pas un menu, et le dit.** Le déclencheur annonce
`role="combobox"` et `aria-haspopup="listbox"` là où `DropdownMenuTrigger`
annonce un menu ; les options sont des `[role="option"]` avec `aria-selected`.
`<b-form-select>` rendait un `<select>` natif, qui portait déjà cette sémantique
— la perdre en passant à un panneau écrit à la main serait une régression.

**4. L'ouverture pose le focus sur l'option retenue, pas sur la première.**
C'est ce que fait un `<select>` natif, et c'est ce qui rend la liste utilisable
au clavier : sans ça, chaque ouverture fait recommencer la navigation depuis le
haut. C'est le seul point où `SelectContent` diverge de `DropdownMenuContent`,
qui n'a pas d'élément courant à rejoindre.

**5. Une valeur garde son type.** `SelectItem` remonte la valeur qu'on lui a
donnée, nombre compris. `<b-form-select>` faisait de même, et
`PerPageSelector` émet un nombre que ses parents comparent à un nombre : forcer
la chaîne aurait cassé la taille de page sans qu'aucune spec le voie.

**6. Les libellés sont indexés par la racine, et survivent à la fermeture.** Le
panneau est démonté quand il se ferme : les `SelectItem` qui portent les
libellés n'existent plus, mais le déclencheur doit continuer d'afficher celui de
l'option retenue. Chaque option déclare son texte à la racine à son montage ;
tant que le panneau n'a jamais été ouvert, `SelectValue` affiche la valeur
brute. Les valeurs de la console sont lisibles — `25`, `payloadDate` — et
l'écart ne s'y voit pas. Un site d'appel à valeurs opaques passera son libellé
dans le slot.

**7. Une commande Cypress, `cy.selectOption()`, accepte les deux formes.** Même
motif que `cy.notificationBadge()` et `cy.paginationPage()` : ce que nous ne
contrôlons pas encore est isolé dans `support/commands.js`, pas dans les specs.
`BasicFilter` et `CreateEnvironment` restent sur `<b-form-select>` jusqu'à leur
propre reprise, et leurs specs continuent d'utiliser `cy.select()`.

**8. Trois pièces de l'amont ne sont pas portées**, faute d'emploi :
`SelectScrollUpButton` et `SelectScrollDownButton` (le panneau défile à la
molette, `max-h-96`), et l'`<input>` caché que l'amont rend quand la prop `name`
est donnée — aucun de nos sélecteurs n'est soumis dans un formulaire HTML.
`SelectItemText` est rendu mais purement présentatif : c'est `SelectItem` qui
déclare le libellé, à partir du texte rendu. Ce sont des absences, pas des
écarts d'API : les ajouter ne changera aucun site d'appel.

## Conséquences

### Positives

- `PerPageSelector` ne rend plus de `bootstrap-vue` : la liste de documents et
  les deux vues de ce lot cessent d'être mixtes.
- Le panneau flottant est écrit une fois pour deux familles, et le sera pour la
  troisième — une combobox reste à venir dans `BasicFilter`.
- Le champ a un nom accessible : `<b-form-select>` n'en avait aucun, le mot qui
  le précédait ne tenait lieu d'étiquette que pour qui voit l'écran.

### Négatives

- Neuf fichiers de primitive plus un mixin, pour ce qui était une balise à deux
  props. Même prix que `Pagination`, payé pour la même raison.
- `DropdownMenuContent` est modifié dans un lot qui ne le concerne pas. C'est le
  coût de l'extraction ; il est encadré par les specs du temps réel, des
  collections et des documents.
- `cy.selectOption()` accepte deux vocabulaires tant que `BasicFilter`,
  `UserProfileList` et `CreateEnvironment` ne sont pas repris. Dette datée.

### Risques acceptés

- Le panneau se place sans `floating-ui` : le calcul est à nous, et il ne gère
  ni les ancres dans un `iframe` ni les conteneurs à transformation CSS. Aucun
  des deux n'existe dans la console.
- `SelectValue` peut afficher une valeur brute avant la première ouverture.
  Aucun site d'appel actuel n'est concerné, et rien ne le signalera si un
  futur l'est.

## Alternatives écartées

- **Un `<select>` natif habillé aux tokens.** Le moins cher, et accessible
  gratuitement. Refusé parce que l'API diverge de l'amont : ADR-0009 n'autorise
  que deux écarts nommés, et celui-ci ferait de la phase 4 une reprise des
  sites d'appel au lieu d'un changement d'import. Le jour où `reka-ui` arrive,
  un `<select>` natif ne devient pas un `Select`.
- **Reprendre `Map.vue` et `TimeSeries.vue` en laissant leurs
  `<b-form-select>`.** Deux écrans mixtes de plus, et `PerPageSelector` — donc
  la liste de documents déjà reprise — inchangé. Le report ne coûtait pas moins,
  il coûtait plus tard.
- **Partager `itemClasses` entre `DropdownMenu` et `Select`.** Les deux lignes
  se ressemblent aujourd'hui ; l'amont les tient séparées, et les factoriser
  ferait qu'une retouche du menu changerait les listes sans qu'on le veuille.
