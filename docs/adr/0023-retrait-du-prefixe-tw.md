# ADR-0023 : retirer le préfixe `tw:`, et ce que le renommage a réveillé

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

[ADR-0008](0008-cohabitation-tailwind-bootstrap.md) a posé trois réglages pour
faire cohabiter Tailwind et Bootstrap 4 : pas de preflight, legacy rangé dans
une couche, et **utilitaires préfixées `tw:`**. Le préfixe existait pour une
raison précise et vérifiée (G-009) : sans lui, `tailwind-merge` prenait
`bg-primary` de Bootstrap pour une classe Tailwind et en supprimait une des
deux, silencieusement, sur les composants qui portaient encore les deux
vocabulaires.

Bootstrap est sorti avec [ADR-0022](0022-retrait-de-bootstrap-et-preflight.md).
Il n'y a plus de second vocabulaire. Le préfixe ne protège plus de rien, et il
coûte : 2 608 occurrences sur 169 fichiers, un écart permanent avec la
documentation de Tailwind et avec le code publié par shadcn-vue, que chaque
copier-coller de primitive doit corriger à la main.

ADR-0022 a annoncé que ce retrait serait « une réécriture mécanique ». **Il ne
l'est pas**, et c'est le sujet de cette ADR.

## Décision

**1. Le préfixe est retiré**, dans une PR qui ne fait que ça :
`prefix(tw)` disparaît des deux `@import` de `tailwind.css`, et `tw:` de toutes
les classes. Le diff est de 903 lignes en +, 903 en −.

**2. `tailwind-merge` revient à son export standard.** `extendTailwindMerge({ prefix: 'tw' })`
n'a plus d'objet ; `twMerge` est importé directement.

**3. `flex-grow` devient `grow` sur ses trois sites d'appel.** C'est la
conséquence non mécanique du renommage, détaillée ci-dessous.

**4. Le renommage est vérifié en comparant le CSS produit, pas en relisant le
diff.** Les sélecteurs des feuilles construites sont extraits avant et après,
le préfixe est normalisé, et on lit ce qui apparaît et ce qui disparaît. Un
renommage réussi ne doit rien faire apparaître.

## Conséquences

### Le renommage n'est pas neutre : deux noms deviennent un seul

Tant que la classe s'appelait `tw:flex-grow`, elle ne pouvait entrer en conflit
avec rien. Une fois renommée `flex-grow`, elle **rencontre la classe de même
nom** que nos feuilles historiques définissent :

```scss
/* src/assets/styles/_override.scss, héritage Bootstrap 4 */
.flex-grow { flex: 1 1 1px; }
```

Les deux règles coexistent alors dans le bundle sur le même sélecteur :

| Couche | Règle | Effet |
|---|---|---|
| `legacy` | `.flex-grow { flex: 1 1 1px }` | `grow:1` · `shrink:1` · **`basis:1px`** |
| `utilities` | `.flex-grow, .grow { flex-grow: 1 }` | `grow:1` |

La couche `utilities` gagne — mais **seulement sur `flex-grow`**. `flex-shrink`
et surtout `flex-basis`, que la règle Tailwind ne mentionne pas, restent ceux du
raccourci `flex` de la règle legacy. Les trois éléments concernés
(`Views/List.vue`, `Views/Map.vue` ×2) passent donc d'une base `auto` à une base
`1px` sans qu'aucune ligne de leur template ne change de sens.

La correction retenue est d'utiliser `grow`, le nom canonique en Tailwind v4,
qui n'a pas d'homonyme dans le legacy. Écrire `flex-grow` marchait par alias ;
c'est cet alias qui a créé la collision.

**La règle générale**, à appliquer à chaque futur retrait de préfixe ou de
namespace : un renommage qui supprime un préfixe ne peut pas être vérifié en
relisant le diff, puisque le conflit qu'il crée n'est écrit dans aucun des
fichiers modifiés. Il se lit dans le CSS produit.

### Le scanner de Tailwind lit tout, pas seulement les attributs `class`

La comparaison des feuilles a fait apparaître 19 utilitaires qui n'existaient
pas avant : `.container`, `.contents`, `.filter`, `.outline`, `.table`,
`.table-cell`, `.transform`, `.visible`, `.resize`, `.m-3`, `.h-100`, `.w-100`…

Aucune n'est portée par un élément. Elles viennent de textes que le scanner de
Tailwind v4 considère comme des candidats parce qu'il n'analyse pas la syntaxe
du template : `data-slot="table-container"`, `variant="outline"`,
`title="Browse contents"`, `style.overflow = 'visible'`, `'resize'` comme nom
d'événement. Avec le préfixe, aucun de ces mots ne ressemblait à une classe ;
sans lui, ils y ressemblent tous.

Coût : **+911 octets** de CSS inerte (135,3 ko contre 134,4 ko). Accepté tel
quel — le restreindre demanderait de décrire au scanner ce qu'il doit ignorer,
c'est-à-dire de maintenir une liste qui se désynchronisera. Mais c'est une
gêne à connaître : une règle qui apparaît dans la feuille ne prouve plus que
quelqu'un l'utilise, et le prochain audit de CSS mort devra en tenir compte.

### Positives

- Le code s'écrit et se lit comme la documentation de Tailwind et comme les
  composants publiés par shadcn-vue. Le coût de copier-coller d'une primitive
  tombe à zéro (ADR-0009).
- Un réglage de moins parmi les trois d'ADR-0008. Il en reste un : la couche
  `legacy`, qui ne partira qu'avec les feuilles SCSS historiques.
- `src/lib/utils.ts` n'a plus de configuration à maintenir.

### Négatives

- 169 fichiers touchés : toute branche en cours conflictera. La PR est donc à
  fusionner seule, et les branches en cours à rebaser juste après.
- +911 octets de CSS inerte (ci-dessus).

### Risques acceptés

- **Une collision de même nature peut dormir ailleurs.** Celle de `flex-grow`
  s'est déclarée parce que le nom existait des deux côtés *et* que les deux
  règles produisaient un résultat différent. Une collision dont les deux règles
  coïncident ne se verra jamais — et ne fera rien non plus. La comparaison des
  sélecteurs produits n'a relevé que ce seul cas ; les 17 specs Cypress sont le
  second filet.

## Alternatives écartées

- **Garder le préfixe.** Il ne protège plus de rien depuis ADR-0022 : son seul
  effet restant est de faire diverger notre code de sa documentation. Le garder
  aurait aussi voulu dire le porter dans toutes les primitives copiées en
  phase 4, quand shadcn-vue deviendra utilisable pour de vrai.
- **Retirer le préfixe dans la PR de retrait de Bootstrap.** Mélanger un
  renommage de 2 608 occurrences avec la suppression d'un framework donne un
  diff que personne ne relit — et c'est précisément dans le renommage que se
  cachait la collision `flex-grow`, qu'un diff de 4 000 lignes aurait noyée.
- **Retirer le préfixe *et* la couche `legacy` d'un coup.** La couche ne peut
  pas partir tant que `vfg.css` est là, donc tant que `vue-form-generator` est
  là. Les deux retraits n'ont pas le même chemin critique.
- **Réécrire `.flex-grow` dans `_override.scss` plutôt que les trois sites
  d'appel.** Cela revenait à corriger le legacy pour arranger Tailwind, alors
  que la classe legacy est morte par ailleurs : aucun élément ne la porte plus.
  Elle partira avec sa feuille.
