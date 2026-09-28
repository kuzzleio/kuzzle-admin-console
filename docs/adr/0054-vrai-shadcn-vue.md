# ADR-0054 : Le vrai shadcn-vue, famille par famille

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

[ADR-0009](0009-contrat-des-primitives-ui.md) a fait écrire les primitives de
`src/components/ui/` à la main, parce que shadcn-vue repose sur `reka-ui`, qui
demande Vue 3. Elles suivent l'API publique de l'amont pour que leur
remplacement « soit un changement d'import ». La console tourne désormais sur
Vue 3 pur ([ADR-0036](0036-retrait-de-vue-compat.md)), et
[ADR-0051](0051-criteres-de-sortie-de-la-v5.md) fait de ce remplacement son
critère 4.

Ce que les primitives contiennent aujourd'hui, et que l'amont fournit :

- **le comportement des composants interactifs**, écrit et maintenu ici : piège
  de focus et retour du focus de `Dialog`, navigation aux flèches de
  `DropdownMenu`, `Select` et `Tabs`, placement des panneaux flottants
  (`floating-panel.ts`), calcul des pages de `Pagination`, clavier de
  `TagsInput`, glisser de `Resizable`. Les primitives font en tout 5 000
  lignes, sans aucun test unitaire
  ([ADR-0009](0009-contrat-des-primitives-ui.md), risques acceptés) ;
- **la fusion des classes du site d'appel** (`class-merge.ts`), qui passe par
  `$attrs` là où l'amont déclare une prop `class`.

Ce que la mesure a montré, en posant `reka-ui` 2.10 et la CLI `shadcn-vue`
2.8 :

1. **La CLI écrit les fichiers, pas la DA.** `shadcn-vue add` remplace le
   composant par celui du registre `new-york-v4`, dont les classes portent la
   palette neutre de l'amont (`bg-primary/90`, `text-white`, `shadow-xs`). Elle
   ne touche pas à `tailwind.css`.
2. **Elle ajoute `@lucide/vue` aux dépendances** à chaque appel, même pour un
   composant qui n'a pas d'icône. La DA impose Font Awesome
   ([`DESIGN.md`](../../DESIGN.md), § Icons).
3. **`Primitive` passe une chaîne `as` telle quelle à `h()`** : `as="router-link"`
   rend un élément `<router-link>` inconnu, pas le composant. Notre `Button`,
   lui, passe par `<component :is>`, qui résout le nom. Une quinzaine de sites
   d'appel s'en servent.
4. **`Checkbox` et `Switch` de l'amont sont des `<button role="checkbox">`.**
   Les nôtres sont des `<input type="checkbox">` natifs, par un écart déjà
   assumé, et `docs.spec` vérifie `be.checked` sur eux.
5. **`Form` de l'amont repose sur `vee-validate` et `zod`** ; la console valide
   avec `vuelidate`.
6. **L'amont n'a plus de `Toast`** : il est passé à `vue-sonner`. La console a
   son store de notifications ([ADR-0020](0020-systeme-de-toasts.md)), avec
   deux commandes Cypress accrochées au toast hors ligne.
7. **Le `Splitter` de `reka-ui` accepte les pixels** (`size-unit="px"`) : la
   taille en pixels que `Data` persiste ([ADR-0021](0021-reprise-apiaction-splitter-et-onglets.md))
   peut rester ce qu'elle est.

## Décision

**1. Chaque primitive est régénérée par la CLI, puis la DA y est reportée.**
`components.json` est versionné, la CLI est appelée à une version fixée
(`npx shadcn-vue@2.8.2 add <famille> --overwrite`). Le fichier produit est un
point de départ : la structure, `data-slot`, les props, `reka-ui` et
`props.class` restent ceux de l'amont ; les classes des variantes redeviennent
celles des tokens, et les cibles restent à 24 px au moins (WCAG 2.5.8). Chaque
diff se relit contre l'ancienne primitive : un comportement qu'elle avait et
que l'amont n'a pas est soit retrouvé, soit nommé dans la PR.

**2. Le comportement vient de `reka-ui`.** `DropdownMenu`, `Select`, `Dialog`,
`Tabs`, `Pagination`, `TagsInput` et `Resizable` passent sur leurs racines
`reka-ui`, et `Button` sur `Primitive` (`as-child` compris). `floating-panel.ts`
et `class-merge.ts` partent avec la dernière famille qui s'en sert.

**3. Les sites d'appel changent là où l'API de l'amont diffère.** La promesse
d'ADR-0009, « un changement d'import », ne tient pas pour `as` : une chaîne
`'router-link'` devient le composant `RouterLink`. On l'écrit au site d'appel,
on n'ajoute pas de résolution de nom dans `Button` : ce serait un écart de plus,
pour un motif que l'amont traite par `as-child`.

**4. Les écarts qui restent sont ceux-ci, et seulement ceux-ci :**

| Écart | Raison |
|---|---|
| Icônes Font Awesome à la place de lucide, `Spinner` en anneau CSS à la place de `Loader2` ; `@lucide/vue` retiré après chaque appel de la CLI | La DA ([`DESIGN.md`](../../DESIGN.md)) |
| Variantes en plus de l'amont (`warning`, `info`, `success`), tailles de `Spinner` | La DA, nommées dans chaque primitive |
| `Checkbox` et `Switch` restent des `<input type="checkbox">` natifs | Rien à maintenir : le navigateur porte la sémantique, le clavier et le formulaire. `reka-ui` imite ce que l'élément natif fait déjà |
| `FormItem`, `FormMessage`, `FormDescription` restent les nôtres | Passer à `vee-validate` est un changement de bibliothèque de validation, pas de primitive. Hors du critère |
| `FileInput` reste le nôtre | Pas d'équivalent en amont |
| `DropdownMenu` non modal par défaut (`modal: false`) | [ADR-0012](0012-primitive-dropdown-menu-en-vue-2.md) : un menu n'enferme pas, et un clic à côté doit atteindre ce qu'il vise |
| `DropdownMenuCheckboxItem` ne ferme pas le menu, et dessine sa case dans les deux états | Cocher n'est pas choisir : le filtre par rôle se coche plusieurs fois de suite (E-12) |
| `DropdownMenuGroup` se nomme d'après son `DropdownMenuLabel` (`aria-labelledby`) | `reka-ui` rend un groupe sans nom, qui n'est pas annoncé comme une section |
| `Toast` : décidé dans son propre lot | Passer à `vue-sonner` garde-t-il les erreurs persistantes, les actions et le toast hors ligne ? Si non, une ADR le dira |

**5. Les `z-index` deviennent des tokens**, comme [ADR-0018](0018-panneaux-flottants-au-dessus-des-modales.md)
le prévoyait : un pour la modale, un pour ce qui flotte au-dessus, un pour les
toasts. Les portails de `reka-ui` les reçoivent par classe ; les valeurs
héritées de Bootstrap (1020 à 1050) disparaissent.

**6. Un lot par famille, dans cet ordre :**

1. le socle (`reka-ui`, `components.json`), `Button`, puis les primitives sans
   comportement : `Badge`, `Card`, `Alert`, `Label`, `Input`, `Textarea`,
   `Table`, `Spinner` ;
2. `DropdownMenu` ;
3. `Select`, puis le retrait de `floating-panel.ts` ;
4. `Dialog` ;
5. `Tabs` ;
6. `Pagination` ;
7. `TagsInput` ;
8. `Resizable` ;
9. `Toast`.

Les panneaux flottants passent avant la modale : une modale de `reka-ui` rend
le reste de la page inerte (`pointer-events: none` sur `<body>`, piège de
focus), et un panneau écrit à la main, ouvert dans `<body>` depuis la modale,
ne se clique plus. Des couches de `reka-ui` imbriquées, elles, se connaissent.

Chaque lot passe les 17 specs contre un build et une stack neuve. Une spec ne
change que si elle vise un DOM que l'amont rend autrement, et elle vise alors
la sémantique (`role`, `aria-*`, `data-slot`), jamais une classe.

## Conséquences

### Positives
- Le comportement le plus coûteux à maintenir (focus, clavier, placement)
  n'est plus écrit ici : il est celui de `reka-ui`, testé en amont.
- Une montée de version de shadcn-vue devient un nouvel appel de la CLI, suivi
  d'une relecture du diff.
- Les primitives passent en `<script setup lang="ts">` en même temps : c'est
  autant de fait pour le critère 7.

### Négatives
- Deux dépendances de production : `reka-ui` et `@vueuse/core`, que
  l'amont demande.
- La CLI ne sait pas qu'on reporte la DA. Chaque appel écrase ce report, et il
  faut le refaire : c'est pourquoi le diff se relit, il ne s'accepte pas.

### Risques acceptés
- Le DOM de `reka-ui` n'est pas le nôtre : attributs `data-state`, portails,
  éléments cachés pour les formulaires. Une spec qui s'appuyait sur un détail
  de notre DOM échouera, et c'est la spec qu'on corrigera, pas la primitive,
  dans les limites du point 6.

## Alternatives écartées

- **Garder les primitives écrites à la main.** Elles marchent, mais la v5
  sortirait avec son propre code de focus, de clavier et de placement, sans test, que
  personne d'autre ne maintient.
- **Copier les fichiers du registre sans la CLI.** Le résultat est le même,
  mais la montée de version suivante redevient manuelle.
- **Tout remplacer dans une seule PR.** Vingt familles, et les 17 specs comme
  seul contrôle : un échec n'y désignerait aucune famille en particulier.
- **Adopter lucide pour les primitives seulement.** Deux jeux d'icônes dans la
  même interface, contre la DA.
