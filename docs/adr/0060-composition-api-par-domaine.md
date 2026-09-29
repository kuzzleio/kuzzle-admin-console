# ADR-0060 : Composition API, un domaine par lot, à comportement constant

- **Statut** : Acceptée
- **Date** : 2026-09-29
- **Décideurs** : Ricky
- **Précise** : le critère 7 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
  (« tous les SFC en `<script setup lang="ts">` »)

## Contexte

Au moment de la décision, 77 SFC sur 193 sont en `<script setup lang="ts">` :
les primitives de `ui/` réécrites par ADR-0054, et cinq composants de
`Common/`. Les 116 autres sont en Options API, dont 75 en JavaScript.

Ce qui rend la conversion plus qu'un changement de syntaxe :

- **`this.$toast` et `this.$log`** (27 fichiers pour le premier) sont posés
  sur `globalProperties` par `plugins/toast.ts` et `plugins/logger.ts` ; un
  `<script setup>` n'a pas de `this` ;
- **le mixin `classMerge`** (6 primitives de `ui/`) lit `this.$attrs.class` ;
- **six parents appellent une méthode d'un enfant** par `$refs`. Un
  `<script setup>` est fermé par défaut : sans `defineExpose`, l'appel échoue à
  l'exécution, et seulement là ;
- **passer en `lang="ts"` fait entrer 75 templates dans `vue-tsc`**, qui ne
  les vérifiait pas. Des erreurs de type vont apparaître : c'est le coût du
  critère, et ce qu'il rapporte — [G-100](../MIGRATION.md#g-100) serait sorti à
  la compilation.

Il n'y a pas de tests unitaires : les 17 specs sont le seul filet.

## Décision

**1. Un domaine par lot, un lot par PR, les PR empilées.** L'ordre suit
les dépendances (primitives d'abord, `Documents` en dernier) et chaque lot se
valide par `test:types`, `test:lint` et les specs de son domaine, contre un
build et une stack neuve ([ADR-0028](0028-valider-les-specs-contre-un-build.md)) :

| Lot | Périmètre | Specs |
|---|---|---|
| 1 | `ui/` restants (`checkbox`, `switch`, `file-input`, `form`), retrait de `classMerge` | les 17 |
| 2 | Racine (`App`, `Login`, `Signup`, `ResetPassword`, `404`, `Home`…), `Common/Login`, `Error`, `Materialize` | `login`, `resetpassword`, `404` |
| 3 | `Common/` hors `Filters` et `Environments` | les 17 |
| 4 | `Common/Environments` | `environments` |
| 5 | `ApiAction` | `api-actions` |
| 6 | `Security` : `Layout`, `Common`, `Roles` | `roles` |
| 7 | `Security/Profiles` | `profiles` |
| 8 | `Security/Users` | `users` |
| 9 | `Data` : `Indexes`, `Leftnav`, racine | `indexes`, `treeview` |
| 10 | `Data` : `Collections`, `Realtime` | `collections`, `watch` |
| 11 | `Common/Filters` | `search` |
| 12 | `Data/Documents`, les vues | `chartView`, `formView`, `JSONEditor` |
| 13 | `Data/Documents`, le reste | `docs` |
| 14 | Retrait des plugins `$toast` / `$log` et de leurs shims, verrou ESLint | les 17 |

**2. À comportement constant.** Un lot convertit, il ne corrige ni ne
refactore. Un défaut trouvé en chemin se corrige dans le même lot, **en commit
séparé**, avec son gotcha — comme [G-101](../MIGRATION.md#g-101). Une erreur
de `vue-tsc` se corrige par le type juste, pas par un `as` ni un `any`.

**3. Les conventions, alignées sur les SFC déjà convertis et sur shadcn-vue :**

- **props** : `defineProps<{ … }>()`, et `withDefaults` quand il y a des
  valeurs par défaut (17 fichiers le font déjà) ; pas de déstructuration
  réactive, que ni l'amont ni le code existant n'utilisent ;
- **événements** : `defineEmits<{ … }>()`, typés ;
- **`v-model`** : la paire `modelValue` / `update:modelValue` reste
  explicite. `defineModel` garde un état local quand le parent ne lie rien,
  ce qui changerait le comportement ;
- **stores** : `useXStore()` et lecture `store.x` ; `storeToRefs` seulement
  pour déstructurer ;
- **routeur** : `useRouter()` / `useRoute()` ;
- **toasts** : un composable `useToast()`, qui rend l'API de
  `plugins/toast.ts` (`toast.danger(title, message)`…). Les sites d'appel
  changent de `this.$toast` à `toast`, pas de forme ;
- **journal** : `import { logger } from '@/plugins/logger'`, déjà exporté ;
- **références** : `useTemplateRef`, typé par le composant visé ; ce qu'un
  parent appelle sur un enfant est **déclaré** par `defineExpose`, dans le lot
  de l'enfant ;
- **nom** : `defineOptions({ name })` seulement quand il sert (composant
  récursif, balise réservée comme `UiSwitch` — [G-020](../MIGRATION.md#g-020)) ;
- **classes** : la prop `class` passée à `cn`, comme en amont, à la place de
  `classMerge`.

**4. Le lot 14 verrouille.** `vue/component-api-style: ['error',
['script-setup']]` et `vue/block-lang` (TypeScript exigé) passent en erreur :
un SFC en Options API ne se réintroduit plus sans que la CI le refuse.

## Conséquences

### Positives
- Les sites d'appel des primitives de `reka-ui` sont typés : une prop requise
  oubliée ([G-100](../MIGRATION.md#g-100)) casse le build.
- Chaque lot est relu seul, sur un domaine que ses specs couvrent.
- À la fin, `this` disparaît des composants, et avec lui les shims de
  `globalProperties`.

### Négatives
- Quatorze PR, relues une à une. `Documents` (≈ 3 900 lignes) en prend deux.
- Les erreurs de type font grossir des lots qui ne devaient toucher que la
  syntaxe.

### Risques acceptés
- Les specs ne couvrent pas tout : un chemin sans spec converti à tort ne se
  verra qu'à l'usage. `vue-tsc` réduit ce risque sans l'éteindre.
- Le code de `setup` s'exécute avant `created` : un composant qui dépendrait de
  l'ordre exact des hooks d'un mixin changerait de comportement. Aucun mixin
  ne reste hors de `ui/`, et `classMerge` n'a pas de hook.

## Alternatives écartées

- **Tout convertir d'un bloc.** 117 fichiers dans une PR ne se relisent pas,
  et un échec de spec n'y désigne plus rien.
- **`<script setup>` sans `lang="ts"` d'abord, les types ensuite.** C'est
  réécrire deux fois chaque fichier, et le critère demande les deux.
- **Appeler `useToasterStore()` aux sites d'appel**, comme l'annonçait le
  commentaire de `plugins/toast.ts`. Il faudrait réécrire chaque appel en
  `push({ title, message, variant })` : un composable garde la forme
  courte, et le plugin peut quand même partir.
- **`defineModel` partout.** Plus court, mais il change ce que fait un
  composant non lié ; la conversion doit rester à comportement constant.
