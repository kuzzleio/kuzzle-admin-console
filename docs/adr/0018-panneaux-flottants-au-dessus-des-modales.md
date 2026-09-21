# ADR-0018 : un panneau flottant passe au-dessus de `Dialog`, pas dessous

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky
- **Amende** : la clause de `z-index` d'[ADR-0012](0012-primitive-dropdown-menu-en-vue-2.md) et d'[ADR-0014](0014-primitive-select-en-vue-2.md)

## Contexte

ADR-0012 a placé le panneau de `DropdownMenu` à `z-index: 1020`, ADR-0014 a
repris la même valeur pour `Select`, et les deux l'ont justifiée de la même
façon : *« sous `Dialog` (1030) et sous la bande modale de Bootstrap — un menu
ouvert derrière une modale ne doit pas passer devant »*.

La prémisse est fausse, et le cas qui la contredit n'est pas rare : **le menu
ouvert *depuis* une modale**. `Common/Environments/CreateEnvironment.vue` est
monté à deux endroits — la page `/#/create-connection` et la modale de
connexion d'`App.vue`. Son champ « Kuzzle version » est devenu un `Select` ;
dans la modale, le panneau s'ouvrait **derrière** elle, donc invisible et non
cliquable.

Le symptôme est allé au bout de la chaîne : cinq tests d'`environments.spec.js`
en échec, avec un message qui ne parle ni de `z-index` ni de modale —

```
cy.click() failed because this element:
  <span data-slot="select-item-text">v2.x</span>
is being covered by another element:
  <div class="tw:sm:w-1/3">...</div>
```

L'élément « couvrant » est le bloc « Pick a color » du formulaire, c'est-à-dire
le contenu de la modale elle-même. Le test qui passe par la **page** —
même composant, même champ — réussissait.

Trois valeurs sont en présence, toutes déjà posées :

| Couche | `z-index` |
|---|---:|
| Panneaux flottants (`DropdownMenuContent`, `SelectContent`) | 1020 |
| `Dialog` | 1030 |
| `.modal-backdrop` de Bootstrap | 1040 |
| `.modal` de Bootstrap | 1050 |

## Décision

**1. Les panneaux flottants passent à `z-index: 1035`** — au-dessus de `Dialog`,
sous la bande modale de Bootstrap. Un menu ou une liste déroulante est toujours
**issu** de quelque chose : il doit passer devant ce qui l'a ouvert.

**2. La crainte d'ADR-0012 reste couverte, mais par un autre mécanisme.** Un
menu n'a pas à rester ouvert quand une modale s'ouvre par-dessus : ce qui traite
ce cas, c'est la fermeture du panneau, pas son `z-index`. `DropdownMenu` et
`Select` se ferment déjà au clic extérieur et à `Échap`.

**3. La marge sous Bootstrap est conservée** tant que `bootstrap-vue` est là.
Il reste deux `<b-modal>` dans la console (`Filters/FilterHistoryItem.vue` et
`Filters/FavoriteFilterItem.vue`) : un panneau ouvert dans l'une d'elles serait
masqué. Aucune des deux n'en contient aujourd'hui ; elles sont dans le lot des
filtres, et la question disparaîtra avec elles.

**4. En fin de phase 2, ces valeurs doivent redevenir deux.** `1020`, `1030`,
`1035`, `1040`, `1050` sont un empilement hérité de Bootstrap. Quand il sera
sorti, il ne restera que « la modale » et « ce qui flotte au-dessus », et la
bonne place de ces deux valeurs est dans les tokens.

## Conséquences

### Positives

- Un `Select` ou un `DropdownMenu` est utilisable dans une modale, ce qui est
  la condition pour reprendre les formulaires qui y vivent.
- Le correctif est de deux caractères dans deux fichiers : la valeur était déjà
  centralisée dans chaque primitive.

### Négatives

- Un panneau resté ouvert au moment où une modale s'ouvre passerait devant elle.
  En pratique, ouvrir une modale se fait en cliquant, et ce clic ferme le
  panneau.

### Risques acceptés

- Les deux `<b-modal>` restants masqueraient un panneau ouvert depuis leur
  contenu. Elles n'en contiennent pas, et elles partent avec le lot des filtres.

## Alternatives écartées

- **Monter le panneau dans la modale plutôt que dans `<body>`.** C'est ce que
  fait `reka-ui` en Vue 3 avec ses *portals* imbriqués. En Vue 2, sans
  téléportation native, cela veut dire choisir un parent au montage et rouvrir
  le sujet réglé par ADR-0012 : un panneau en `position: absolute` serait
  tronqué par le premier ancêtre en `overflow`.
- **Aligner le panneau sur 1050**, au-dessus de tout Bootstrap. Ça marcherait
  aujourd'hui et casserait le jour où une `b-modal` doit couvrir un menu resté
  ouvert. Tant que les deux familles cohabitent, la hiérarchie doit rester
  lisible.
- **Laisser 1020 et sortir `CreateEnvironment` de la modale.** Ce serait changer
  le produit pour arranger le design system.
