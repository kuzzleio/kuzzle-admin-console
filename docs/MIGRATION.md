# Modernisation de l'Admin Console — tableau de bord

> **Ce document est vivant.** Il dit *où on en est*. Le *pourquoi* est dans
> [`adr/`](adr/), le *qui fait quoi* dans les issues GitHub.
>
> Mettre à jour ce fichier fait partie de la definition of done de **chaque** PR
> de migration. Un tableau de bord faux est pire que pas de tableau de bord.

**Dernière mise à jour** : 2026-09-21 · **Phase courante** : 2 — Dé-bootstrapisation

---

## 1. Où on en est

| Phase | Objet | Epic | Statut |
|---|---|---|---|
| **0** | Toolchain : Node 24 LTS, Vite, TS, ESLint, Cypress (en Vue 2) | [#1017](https://github.com/kuzzleio/kuzzle-admin-console/issues/1017) | 🟡 En cours |
| **1** | Fondations design : Tailwind + tokens + primitives UI | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | 🟡 En cours |
| **2** | Dé-bootstrapisation écran par écran + refonte UI/UX | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | 🟡 En cours — 67 / 134 |
| **3** | Bascule Vue 3 (+ `@vue/compat` temporaire), router, Pinia | [#1019](https://github.com/kuzzleio/kuzzle-admin-console/issues/1019) | ⬜ À faire |
| **4** | Nettoyage : retrait de `compat`, vrai shadcn-vue, Composition API | [#1019](https://github.com/kuzzleio/kuzzle-admin-console/issues/1019) | ⬜ À faire |

Le phasage et son ordre contre-intuitif (UI **avant** Vue 3) sont justifiés dans
[ADR-0002](adr/0002-sortir-de-bootstrap-vue-avant-vue-3.md).

Légende : ⬜ à faire · 🟡 en cours · ✅ fait · ⛔ bloqué · ➖ sans objet

### Prérequis bloquant — ✅ levé le 2026-09-18

- [x] **Auditer les sélecteurs Cypress** ([#1017](https://github.com/kuzzleio/kuzzle-admin-console/issues/1017))
- [x] **Sécuriser les sélecteurs fragiles** — 0 restant dans les tests actifs

**Le filet tient.** Sur 940 appels de sélecteur dans les 17 specs, la très
grande majorité s'appuyait déjà sur des attributs `data-cy` (281 posés dans 82
des 140 composants). Le projet a été discipliné sur ce point, et c'est ce qui
rend la phase 2 tenable.

**Chiffres après exclusion des tests désactivés** (voir ci-dessous) : 771 appels
actifs, dont **61 fragiles (7,9 %)**. Tous ont été repris. Il en reste **0**.

| Catégorie | Appels | Traitement |
|---|---:|---|
| Classe applicative (`.IndexesPage`, `.DocumentListView-item`, `.CollectionCreate`…) | 39 | `data-cy` posé sur la racine du composant, sélecteur réécrit |
| Classe Bootstrap (`.invalid-feedback` ×12, `.dropdown-toggle`) | 14 | commande `cy.invalidFeedback()` ; `:toggle-attrs` sur le `b-dropdown` |
| `id` généré par `vue-form-generator` | 5 | `attributes.input` dans `formSchema.ts` → `data-cy="FormField-<champ>"` |
| Interne `bootstrap-vue` | 3 | `data-cy` déjà présent via `title-link-attributes` ; commande `cy.removeFormTag()` |

**Principe retenu** : ce qui nous appartient reçoit un `data-cy`. Ce qui est
généré par `bootstrap-vue` et sur quoi nous ne pouvons pas poser d'attribut est
**isolé dans une commande Cypress** (`test/e2e/cypress/support/commands.js`).
En phase 2, il n'y aura que ce bloc à reprendre, pas les 17 specs.

> **Un sélecteur a échappé à l'audit** : `.badge`, trois fois dans `docs.spec.js`
> (2026-09-21, reprise de `Views/Column/`). Il était compté comme classe
> applicative alors que c'est une classe Bootstrap. Traité selon le même
> principe — commande `cy.notificationBadge()`, qui accepte `.badge` et
> `[data-slot="badge"]` le temps de la cohabitation. L'audit portait sur les
> classes qu'il savait reconnaître ; celle-ci ressemblait trop à une des nôtres.
> S'il en reste, elles se déclareront de la même façon : à la reprise, pas
> avant.

#### État du filet de sécurité au 2026-09-18

| | Avant | Après |
|---|---:|---:|
| Tests actifs | 140 | **157** |
| Tests inactifs (`.only` + `it.skip`) | 20 | **0** |
| Sélecteurs fragiles (tests actifs) | 61 | **0** |
| Politique de retry | aucune | `runMode: 2` |
| ESLint sur `test/` | non | oui, bloquant |

Suite complète vérifiée contre un backend Kuzzle réel : **17/17 specs,
156 tests passants, 0 échec** (1 `pending` légitime, skip dynamique via
`skipOnBackendVersion`).

#### La CI était verte en n'exécutant qu'une fraction des tests — ✅ corrigé

L'audit a mis au jour **deux `.only` commités dans le dépôt**. Un `.only`
désactive silencieusement tout le reste du fichier : Cypress ne signale rien, et
la CI affiche « All specs passed » en ayant exécuté une fraction des tests.

| Fichier | Marqueur | Depuis | Tests masqués |
|---|---|---|---|
| `docs.spec.js` | `describe.only('Realtime')` | **janvier 2022** ([#938](https://github.com/kuzzleio/kuzzle-admin-console/pull/938)) | 11 — tout `Document List` et `Document update/replace` |
| `formView.spec.js` | `it.only` | **septembre 2024** (`b575b77a`) | 3 |

Deux raisons expliquent que le problème ait vécu si longtemps : **ESLint ne
scannait que `src`**, jamais `test/`, et **le job `lint` de la CI était en
`continue-on-error: true`** — son résultat n'avait donc aucun effet.

Les deux `.only` sont retirés (14 tests réactivés) et la récidive est bloquée :
une config ESLint isolée dans `test/e2e/cypress/` interdit `.only`,
`fdescribe` et `fit` via `no-restricted-syntax` (sans dépendance ajoutée),
`test:lint` scanne les specs, et le job `Lint` est redevenu bloquant sur les
trois workflows. Retirer les marqueurs sans ces trois points aurait été inutile.

#### Tests désactivés (`it.skip`) — ✅ traités

Les 6 `it.skip` ont été triés puis supprimés. **Il n'en reste aucun.**

| Spec | Test | Diagnostic | Décision |
|---|---|---|---|
| `docs` | vue time series | **Obsolète** : visait l'ancienne UI à boutons de `ListViewButtons.vue`. La vue existe toujours, elle est atteignable via `DropdownView.vue` (« Chart view ») et **déjà couverte** par `chartView.spec.js`. | Supprimé ; `chartView.spec.js` étendu de 3 à 7 tests à la place |
| `search` ×2 | agrégations dans les résultats | **La fonctionnalité n'existe pas** : `grep -rn "aggregation" src` ne retourne rien. Ces tests décrivaient une intention, pas un comportement. | Supprimés |
| `environments` | spinner de reconnexion | Appelait `cy.task('doco', …)`, une task **jamais enregistrée** (`setupNodeEvents` est vide). Ne pouvait physiquement pas tourner. | Supprimé, avec la commande `waitForService` devenue orpheline |
| `environments` ×2 | mise à jour d'un env, bascule d'env | Exigeaient un **second backend** sur le port 7514, que la CI ne lance pas (`single-backend`). | Supprimés |

Le principe : un test qui ne peut pas tourner n'est pas une couverture en
attente, c'est une couverture imaginaire. Le supprimer rend la couverture réelle
visible ; git en garde la trace si le besoin revient. Les fonctionnalités
correspondantes (agrégations, multi-backend, reconnexion) restent des sujets
produit ouverts, mais ils ne sont plus déguisés en dette de test.

Effet de bord : `ListViewButtons.vue` n'était **importé nulle part** et absent du
build. Supprimé.

Suivi : [#1020](https://github.com/kuzzleio/kuzzle-admin-console/issues/1020).

### 1.1 Attentes Cypress — ADR-0006

Relevé au 2026-09-18 : **57 `cy.wait(<durée fixe>)`** sur 12 fichiers,
**63 s de sommeil inconditionnel** par exécution complète. Décision et
remplacements : [ADR-0006](adr/0006-attentes-sur-assertion-cypress.md).

| Lot | Nature | Appels | Sommeil | Remplacement | Statut |
|---|---|---:|---:|---|---|
| **A1** | L'assertion suivante est **positive** et déjà réessayée | 17 | 20,7 s | suppression sèche | ✅ |
| **A2** | L'assertion suivante est **négative** (« rien ne doit se produire ») | 9 | 8,7 s | `cy.shouldStayOn()`, ou ancre positive quand il en existe une | ✅ |
| **A3** | Indexation Elasticsearch avant un `cy.visit()` | 1 | 1,0 s | `?refresh=wait_for` sur l'écriture | ✅ |
| **B** | Suivi d'une action non réessayée (`type`, `click`, `sessionStorage`) | 16 | 12,2 s | assertion explicite avant l'action | ✅ |
| **C** | Initialisation de l'éditeur Ace | 5 | 6,5 s | commande `cy.aceReady()` | ✅ |
| **D** | État backend via `cy.request()` | 5 | 6,0 s | commande `cy.expectBackend()` | ✅ |
| **E** | Réseau simulé (`goOffline` / `goOnline`) | 3 | 8,0 s | `cy.expectOfflineToast()` / `cy.expectNoOfflineToast()`, + 1 suppression sèche ([ADR-0007](adr/0007-lot-e-assertion-plutot-que-sommeil.md)) | ✅ |
| **F** | Timer applicatif (`antiGlitchOverlayTimeout`) | 1 | variable | conservé, déjà dans `commands.js` | ➖ |

**Les 57 appels sont traités.** Il ne reste aucun `cy.wait()` dans les specs, et
**2 dans `support/commands.js`** — `waitOverlay` (lot F) et `shouldStayOn`
(lot A2) — tous deux par constante nommée et commentée.

Les lots C et D ont demandé une commande chacun, sondée avant d'être adoptée :

- **`cy.aceReady(<scope>)`** — trois signaux d'initialisation (le `textarea`
  existe, les lignes sont rendues, le curseur est posé), vérifiés sur les deux
  éditeurs du projet. Les specs asseyaient jusqu'ici l'attente sur la seule
  existence du `textarea` puis dormaient 2 s : entre le montage du `textarea` et
  le moment où Ace traite les frappes, une saisie est **perdue sans erreur**.
- **`cy.expectBackend(<requête>, <assertion>)`** — `cy.request()` n'est pas
  réessayée, son assertion est évaluée une seule fois sur la première réponse.
  La commande sonde en boucle via `cy.waitUntil` (déjà une dépendance du
  projet), puis rejoue l'assertion **hors de la boucle** pour qu'un échec donne
  un diff lisible et non un « timed out » opaque.

> Le gain en temps d'exécution réel est plus modeste que le sommeil retiré : la
> suite complète passe de 15:26 à 15:09 sur un même poste. Ces mesures sont des
> exécutions uniques et bruitées, à ne pas prendre pour des chiffres fermes.
> **Le gain qui compte n'est pas là** : il est dans le fait qu'un échec signifie
> désormais « régression » et non « la machine était lente ».

Le lot A2 a demandé une commande dédiée, `cy.shouldStayOn(hash)`. Asserter qu'une
navigation **n'a pas** eu lieu demande une fenêtre de temps : une assertion
instantanée est vraie avant même que l'application ait pu naviguer à tort.
Vérifié expérimentalement sur `roles.spec.js`, validation sabotée pour naviguer
après 300 ms :

| Assertion | Face à la régression |
|---|---|
| instantanée (suppression sèche naïve) | **9/9 verts** — non détectée |
| `cy.shouldStayOn()` | **1 échec** — détectée |

La durée fixe subsiste donc à l'intérieur de la commande, mais elle est nommée,
bornée et écrite une seule fois — la dérogation prévue par l'ADR pour les cas où
un vrai délai est attendu. Un seul des 9 sites (`users.spec.js`) disposait déjà
d'une ancre positive (`UserProfileList-invalidFeedback` + icône d'alerte) : elle
a été remontée avant l'assertion négative, sans recourir à la commande. Les trois
formulaires concernés n'affichant rien quand le JSON est invalide, ces ancres
n'existaient pas ailleurs — d'où l'issue
[#1027](https://github.com/kuzzleio/kuzzle-admin-console/issues/1027).

Le lot B a été vérifié par une sonde jetable avant d'être validé : une ancre
`.should('be.visible')` posée sur un élément **déjà visible avant l'action** ne
prouverait rien. La sonde a confirmé que les items de menu sont bien masqués
avant ouverture, et corrigé une erreur au passage — le `JSONEditor` de l'écran
Watch est **retiré du DOM** au repli, pas masqué, donc `not.exist` et non
`not.be.visible`.

Deux remplacements du lot B sortent du cadre « assertion avant l'action » :

- `search.spec.js` : suppression sèche, le document est créé avec
  `?refresh=wait_for` et le test relance explicitement la recherche juste après.
- `environments.spec.js` (2 sites) : `sessionStorage.setItem` écrit hors d'un
  `cy.then()` s'exécute à l'évaluation du corps du test, donc **avant** toutes
  les commandes qui le précèdent dans le source. L'attente ne le retardait pas ;
  elle ne retardait que le `cy.visit()` suivant. Remis dans la file.

Répartition par fichier — la colonne « reste » est ce qu'il faut ramener à 0
hors lot F :

| Fichier | Départ | Reste | | Fichier | Départ | Reste |
|---|---:|---:|---|---|---:|---:|
| `docs.spec.js` | 11 | 0 | | `profiles.spec.js` | 4 | 0 |
| `collections.spec.js` | 11 | 0 | | `api-actions.spec.js` | 4 | 0 |
| `environments.spec.js` | 8 | 0 | | `search.spec.js` | 3 | 0 |
| `users.spec.js` | 7 | 0 | | `login.spec.js` | 2 | 0 |
| `roles.spec.js` | 4 | 0 | | `treeview` / `watch` | 1 | 0 |

Le lot E devait être la dérogation : trois attentes sur un réseau simulé, à
conserver en les nommant. En les reprenant, la prémisse est tombée — voir
[ADR-0007](adr/0007-lot-e-assertion-plutot-que-sommeil.md), qui remplace la
clause E d'ADR-0006.

- Un des trois n'était pas du lot E : placé entre une assertion déjà réessayée et
  un `click()`, il n'attendait rien. Du lot A1 mal classé, supprimé.
- Les deux autres attendent `#offline-toast`, qui est un **état observable**.
  `defaultCommandTimeout` vaut 60 s, très au-dessus des ~5 s que met le SDK à
  déduire la perte de la websocket : l'assertion réessayée couvrait déjà le
  délai, le sommeil ne faisait que s'y ajouter. Les commandes
  `cy.expectOfflineToast()` / `cy.expectNoOfflineToast()` nomment non pas une
  durée mais un **plafond de patience** (20 s), pour qu'une régression se
  signale en 1 min au lieu de 3 avec les retries.

Garde-fou, les deux sabotages attendus :

| Sabotage | Résultat |
|---|---|
| `$bvToast.show('offline-toast')` neutralisé | ❌ échec (`never found it`) |
| `$bvToast.hide('offline-toast')` neutralisé | ❌ échec (`continuously found`) |

La distinction que ce lot a mise au jour, et qui manquait à ADR-0006 : ce qui
demande une fenêtre de temps, ce n'est pas « une assertion négative », c'est
**l'assertion d'un non-événement**. `shouldStayOn()` affirme que rien ne se
produira — vrai à l'instant zéro, donc à protéger. `expectNoOfflineToast()`
affirme une **transition** — le toast est là quand on appelle, il doit partir :
le réessai est ancré, il ne peut pas être faussement vert.

Même famille, hors périmètre d'ADR-0006 — une action de l'interface suivie d'une
commande non réessayée, sans ancre entre les deux — et **traité** : `watch.spec.js`
publiait un message juste après avoir cliqué `Watch-subscribeBtn` sur **5 de ses
6 sites**, sans attendre que la souscription soit établie. Le sixième portait
déjà l'ancre : le libellé du bouton passe de `Subscribe` à `Unsubscribe` quand
`realtime.subscribe()` est résolue. Garde-fou, souscription retardée de 1,5 s :

| `watch.spec.js` | Résultat |
|---|---|
| avant | ❌ **5 échecs** — exactement les 5 sites non ancrés ; le 6ᵉ tient |
| après | ✅ 9/9 |

Publier avant que la souscription soit établie, c'est publier dans le vide : le
message part, personne ne l'écoute encore, et la notification attendue
n'arrivera jamais. Aucun échec n'avait encore été observé sur ces sites — la
fenêtre est étroite en local — mais c'est le même mécanisme que G-001.

Anti-récidive : la règle `no-restricted-syntax` de
`test/e2e/cypress/.eslintrc.cjs` rejette `cy.wait(<littéral numérique>)`. ✅
Elle est posée **sans bloc `overrides`** : les 57 appels étant traités avant
qu'elle n'existe, la liste serait vide. Le compteur d'avancement prévu n'a
jamais eu lieu d'être. `cy.wait('@alias')` reste autorisé, et une durée passée
**par identifiant** aussi — c'est la forme réservée aux deux dérogations de
`commands.js`.


### 1.2 Fondations design — phase 1

| Élément | Statut |
|---|---|
| Tailwind CSS 4 branché (`@tailwindcss/vite`, compatible Vite 5.4) | ✅ |
| Tokens de design en variables CSS (`src/assets/tokens.css`) | ✅ |
| Stratégie de cohabitation avec Bootstrap ([ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md)) | ✅ |
| Contrat des primitives ([ADR-0009](adr/0009-contrat-des-primitives-ui.md)) | ✅ |
| Première primitive : `Button` (`src/components/ui/button/`) | ✅ |
| `cn()` et les utilitaires shadcn-vue (`cva`, `clsx`, `tailwind-merge`) | ✅ |
| Primitives suivantes : `Badge`, `Card`, `Input` | ✅ |
| `Spinner` (ajoutée en reprenant `Offline.vue`) | ✅ |
| `Label` et `Alert` (ajoutées en reprenant les modales d'import et de requête) | ✅ |
| `Checkbox` (ajoutée en reprenant les trois lignes de liste de Security) | ✅ |
| `FormItem`, `FormDescription`, `FormMessage` (sans `FormField` ni `FormControl`) | ✅ |
| `Dialog` — écrite à la main ([ADR-0010](adr/0010-primitive-dialog-en-vue-2.md)) | ✅ |
| `Switch` (ajoutée en reprenant la bascule « Form view » des documents) | ✅ |
| `Table` — du balisage, pas de `DataTable` ([ADR-0011](adr/0011-table-sans-data-table.md)) | ✅ |
| Primitives interactives restantes (dropdown, combobox) | ⬜ |

Les tokens reprennent la palette existante (`styles/_variables.scss`) : la
plomberie est posée, l'apparence n'est pas décidée. La refonte visuelle se fera
en changeant ces valeurs, à un seul endroit — c'est précisément ce qu'on achète.
Le jeu sombre est défini mais branché sur rien.

Trois réglages temporaires rendent la cohabitation tenable pendant la phase 2,
tous mesurés plutôt que supposés (cf. [ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md)) :
**pas de preflight**, **legacy rangé dans une couche CSS**, et **utilitaires
préfixées `tw:`**. Les trois se retirent mécaniquement avec Bootstrap, en fin de
phase 2.

---

### 1.3 Dé-bootstrapisation — phase 2

**67 composants repris sur 134**, **431 balises `<b-*>` retirées sur 813**.

> Ces deux compteurs disaient `49 / 140` et `289` jusqu'ici, alors que le
> tableau ci-dessus annonçait `59 / 138` : la ligne n'avait pas été reprise
> depuis le lot `DropdownMenu`, et la phrase ne disait pas si les balises
> étaient celles qui restent ou celles qui sont parties. Les deux sont
> recalculées ici — `grep -rho "<b-[a-z-]*" src --include="*.vue" | wc -l`,
> à retrancher de 813 — et le libellé dit lequel des deux sens il porte.

Les deux pages 404 ouvrent la phase parce qu'elles sont le plus petit périmètre
possible : isolées, sans état, et couvertes par `404.spec.js`. Elles valident
trois choses d'un coup — la prop `as` de `Button` sur un `router-link` réel, la
famille `Card` assemblée sur un écran, et la règle 4 d'ADR-0009 (le
`<style scoped>` décoratif s'en va avec les classes Bootstrap).

Ce qu'une reprise doit vérifier, dans cet ordre :

1. plus aucune balise `<b-*>` ni classe Bootstrap dans le composant ;
2. plus de `<style scoped>` décoratif (couleur, espacement, rayon, typographie) —
   il gagnerait en silence contre les utilitaires (G-010) ;
3. les specs du domaine passent **contre un `vite preview` du build**, pas contre
   le serveur de dev (G-013) ;
4. le rendu est regardé, pas supposé : les specs valident le comportement, pas
   l'apparence.

Point 4, concrètement : `ListNotAllowed` ne s'affiche qu'avec des droits
insuffisants et `Offline` que pendant la connexion. Les specs des domaines
passent sans jamais les rendre. Pour les voir, il a fallu les monter sur une
route temporaire, non commitée — c'est le prix à payer pour ne pas livrer un
composant qu'on n'a jamais vu.

**Ce qui reste bloqué dans Common** : `Autocomplete.vue` et `MSelect.vue`
dépendent de `vue-multiselect`. `PerPageSelector.vue` l'était aussi ; il ne
l'est plus ([ADR-0014](adr/0014-primitive-select-en-vue-2.md)).

**Les tableaux de Data sont débloqués** ([ADR-0011](adr/0011-table-sans-data-table.md)).
Le sujet n'en était pas un mais deux : `Views/Column/` n'utilisait que du
balisage — repris avec la primitive `Table` — tandis que `Indexes/Page.vue` et
`Collections/CollectionList.vue` s'appuyaient sur le `b-table` piloté par les
données. Ces deux-là redéfinissaient déjà **9 colonnes sur 9** par un
`#cell(...)` : `b-table` ne leur apportait plus que la boucle, le filtre et le
tri. Ils passent au `v-for` explicite, avec le filtre et le tri dans
`useTableFilterSort` — un composable, pas une primitive : ça n'a pas de rendu.
Le tri des trois colonnes concernées a été couvert par des specs **avant** la
réécriture, comme l'ADR l'engage ; c'est ce qui a mis au jour
[G-022](#g-022--une-colonne-sortable-peut-ne-rien-trier-et-rien-ne-le-dit).

**Les menus déroulants sont débloqués** ([ADR-0012](adr/0012-primitive-dropdown-menu-en-vue-2.md)).
`b-dropdown` et sa famille comptaient 34 balises dans 10 composants, répartis
sur les trois domaines restants : tant que la primitive manquait, dix fichiers
étaient bloqués, dont `Documents/Page.vue` et `Security/Users/Page.vue`. La
primitive est écrite à la main, et son panneau est **déplacé dans `<body>`**
comme celui de `Dialog` — un menu en `position: absolute` serait tronqué dans
toute cellule de `Table`, dont l'enveloppe est en `overflow-x-auto` depuis
ADR-0011. Au passage, la prop `active` de `b-dropdown-item`, qui ne posait
qu'une classe, devient un `role="menuitemradio"` avec `aria-checked` : l'écran
temps réel annonce enfin quelle vue est la vue courante.

**La pagination est débloquée** ([ADR-0013](adr/0013-primitive-pagination-en-vue-2.md)).
C'était le dernier composant `bootstrap-vue` partagé entre les deux domaines
restants : le même `<b-pagination>` à trois props, quatre fois, dans
`Documents/Page.vue` et les trois `List.vue` de Security. La primitive suit le
découpage en huit pièces de l'amont ; la composition que les quatre écrans
partagent vit dans `Common/ListPagination.vue`, comme `useTableFilterSort` vit
à côté de `Table` (ADR-0011). Les trois listes de Security n'attendent donc plus
rien — l'ordre Roles / Profiles avant Users n'a plus de raison technique.

**Les listes déroulantes sont débloquées**
([ADR-0014](adr/0014-primitive-select-en-vue-2.md)). `<b-form-select>` était le
deuxième composant `bootstrap-vue` partagé entre Data et Security — le contexte
d'ADR-0013 disait à tort que `<b-pagination>` était le dernier. Il en reste
15 occurrences dans trois fichiers non repris (`BasicFilter.vue`,
`UserProfileList.vue`, `CreateEnvironment.vue`), qui gardent `cy.select()` ; les
deux champs repris passent par `cy.selectOption()`, qui accepte les deux formes.
Le placement du panneau flottant est désormais un mixin partagé,
`ui/floating-panel.ts`, écrit pour `DropdownMenu` (ADR-0012) et reporté tel quel.

**Le formulaire de collection n'a demandé aucune primitive nouvelle** — c'est le
premier lot de Data dans ce cas, et c'est en soi un résultat. `Card`, `Button`,
`FormItem`, `Label`, `Input`, `FormDescription` et `FormMessage` couvraient
`<b-form-group>`, `<b-input>`, `<b-form-file>` et `<b-card>` sans retouche ;
les `<b-row>` / `<b-col>` deviennent des utilitaires, et `<b-container>` la même
enveloppe `mx-auto max-w-6xl px-4` que les six écrans déjà repris.

Trois points méritaient d'être tranchés plutôt que transposés :

- **Le champ fichier suit le précédent de `EditCustomMapping.vue`** : un
  `<Input type="file">` avec un `<Label>` **visible**. Un `<input type="file">`
  natif ignore `placeholder`, et « Select a JSON file to import mappings.. »
  était la seule indication que `b-form-file` affichait. La perdre sans la
  remplacer aurait retiré le seul mot qui disait à quoi sert le champ.
- **« Export Mapping » est un cas de G-016** : `<b-button :href :disabled>`
  arbitrait tout seul, notre `Button` non. Le bouton est rendu en `<a>` quand le
  mapping est un JSON valide, et en `<button disabled>` sinon — le cas interdit
  n'est plus un lien grisé qui reste cliquable.
- **Le bloc d'aide n'est pas une colonne flex** (G-018). Il mêle du texte, un
  lien et un `<pre>` ; le `flex: 1 1 1px; overflow: auto` du `<style scoped>`
  supprimé devient `min-h-0 overflow-auto` sur un bloc ordinaire.

**Le champ date ne prend pas de primitive** ([ADR-0015](adr/0015-pas-de-primitive-calendar.md)).
`<b-form-datepicker>` et `<b-form-timepicker>` n'apparaissent que dans
`DateTimeFormInput.vue`, et l'amont n'a pas de « champ date » : il compose un
*Date Picker* à partir de `Popover` et de `Calendar`, que `reka-ui` fournit en
Vue 3. Écrire `Calendar` à la main aurait coûté plusieurs centaines de lignes —
grille du mois, navigation clavier, bornes, locale — pour **un** champ, dont le
panneau n'est couvert par aucune spec, et dans un formulaire que
`vue-form-generator` emportera de toute façon. Les deux champs passent aux types
natifs `date` et `time` de la primitive `Input`, qui exposent exactement les
formats que le composant parsait déjà. Ce n'est pas l'alternative écartée par
ADR-0014 : aucun composant n'est créé, donc aucune API à défaire en phase 4.

`Data/Collections/Tabs.vue` a été **supprimé plutôt que repris** : il n'était
importé nulle part, et il lisait `$store.state.collection.isRealtimeOnly` — un
store Vuex que la console n'a plus depuis le passage à Pinia. Il ne rendait donc
pas ce qu'il prétendait rendre, et personne ne l'aurait vu. C'est le troisième
composant dans ce cas.

**Il ne reste qu'un fichier `<b-*>` dans Data** : `Layout.vue`, et sa balise
n'est pas le sujet — c'est `vue-multipane`, abandonné, qui y tient le
redimensionnement de la barre latérale (§ 3.1). Le reste du domaine est repris.

Le dernier lot a porté sur l'arborescence (`Leftnav/`), le menu d'actions d'un
index et la ligne de la vue graphique. Trois choses y ont changé de nature
plutôt que de classes :

- **le chevron d'une branche était un `<i>` cliquable** : ni atteignable au
  clavier, ni annoncé. C'est un bouton, et il porte `aria-expanded` ;
- **le dépliement animait un `max-height: 0` vers un `max-height: 2000px`**
  arbitraire, qui tronquait les très longues listes. La grille passe de `0fr` à
  `1fr` : la hauteur réelle du contenu, sans nombre magique. Replié, le contenu
  fait toujours zéro pixel — ce que les specs lisent comme « non visible », et
  c'est ce qui les fait tenir ;
- **le menu d'un index ne ressemblait pas à celui d'une collection** — fond gris
  de `variant="light"` d'un côté, bouton clair de l'autre, pour deux menus qui
  font la même chose au même endroit. Les deux passent par la même variante.

**Six composants ont été supprimés plutôt que repris**, d'où le dénominateur
à 134 :

| Composant | Pourquoi |
|---|---|
| `Documents/ListViewButtons.vue` | importé nulle part (relevé le 2026-09-18, resté coché ⬜) |
| `Documents/ListActions.vue` | importé nulle part — `Views/List.vue` réécrit ses trois boutons en propre |
| `Collections/Tabs.vue` | importé nulle part, et lisait un store Vuex que la console n'a plus |
| `Documents/RealtimeOnlyEmptyState.vue` | importé nulle part — encore en balisage Materialize (`col s1 offset-s1`) |
| `Documents/DocumentBoxItem.vue` | importé nulle part — idem, et seul client de `Materialize/Dropdown.vue` |
| `Materialize/Dropdown.vue` | orphelin une fois le précédent parti |

Le recensement initial comptait des fichiers, pas des composants atteignables.
Six sur 140 en huit lots, et les deux derniers étaient encore écrits pour
Materialize — un framework sorti du projet avant Bootstrap. Le réflexe est
acquis : on vérifie qu'un composant est atteint **avant** de le reprendre.

## 2. Toolchain (phase 0)

Versions relevées le 2026-09-18. Node 20 « Iron » est **EOL depuis mars 2026**.

| Élément | Actuel | Cible | Statut |
|---|---|---|---|
| Node | 20 (EOL) / 22 dans le Dockerfile | 24 LTS « Krypton » | ✅ [#1023](https://github.com/kuzzleio/kuzzle-admin-console/pull/1023) |
| `.nvmrc` / `engines` / CI / Dockerfile / compose | 3 valeurs différentes | alignés, `.nvmrc` fait foi | ✅ [#1023](https://github.com/kuzzleio/kuzzle-admin-console/pull/1023) |
| Job `Lint` de la CI | `continue-on-error: true`, ne scanne que `src` | bloquant, scanne aussi `test/` | ✅ [#1020](https://github.com/kuzzleio/kuzzle-admin-console/issues/1020) |
| Vite | 5.4.6 | dernière compatible `@vitejs/plugin-vue2` | ⬜ |
| TypeScript | 5.4.5 | à évaluer (TS 7 disponible) | ⬜ |
| ESLint | eslintrc | flat config, ESLint 10 | ⬜ |
| Cypress | 13.14.2 | 16.x | ⬜ |

⚠️ `@vitejs/plugin-vue2` fixe le plafond de Vite jusqu'à la phase 3. Vérifier sa
compatibilité **avant** d'engager la montée.

---

## 3. Dépendances

### 3.1 Bloquantes pour Vue 3 — sans chemin de migration direct

| Paquet | Problème | Traitement | Phase | Statut |
|---|---|---|---|---|
| `bootstrap-vue` 2.23.1 | aucune version Vue 3, **incompatible `@vue/compat`** | supprimé, remplacé par Tailwind + primitives locales | 2 | 🟡 Tailwind branché, cohabitation cadrée ([ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md)) |
| `bootstrap` 4.6.2 | supprimé avec le précédent | Tailwind | 2 | 🟡 idem |
| `vue-form-generator` 2.3.4 | **abandonné**, aucun successeur | à réimplémenter — cœur de l'édition de documents | 2 | ⬜ |
| `vue-multipane` 0.9.5 | **abandonné** | splitter à réimplémenter (layout Data) | 2 | ⬜ |
| `vuejs-logger` 1.5.5 | Vue 2 uniquement | remplacer par un wrapper maison | 3 | ⬜ |

### 3.2 Migration directe disponible

| Paquet | Cible | Phase | Statut |
|---|---|---|---|
| `vue` 2.7.16 | 3.5.x (via `@vue/compat`) | 3 | ⬜ |
| `vue-router` 3.6.5 | 4.x puis 5.x | 3 | ⬜ |
| `pinia` 2.2.4 + `PiniaVuePlugin` | 4.x, sans plugin Vue 2 | 3 | ⬜ |
| `@vitejs/plugin-vue2` | `@vitejs/plugin-vue` | 3 | ⬜ |
| `vue2-leaflet` 2.7.1 | `@vue-leaflet/vue-leaflet` | 3 | ⬜ |
| `vuedraggable` 2.24.3 | `vuedraggable@next` ou `vue-draggable-plus` | 3 | ⬜ |
| `vue-apexcharts` 1.6.2 | `vue3-apexcharts` | 3 | ⬜ |
| `vue-multiselect` 2.1.7 | 3.x — ou supprimé au profit d'un Combobox shadcn-vue | 2/3 | ⬜ |
| `vue-color` 2.8.1 | 3.x — ou supprimé (usage marginal) | 2/3 | ⬜ |
| `@vue/test-utils` 1.3.6 | 2.x | 3 | ⬜ |

### 3.3 Dette à évacuer au passage

| Paquet | Pourquoi | Statut |
|---|---|---|
| ~~`kuzzle-sdk` v6 **et** v7~~ | **Conservé** — c'est le support des backends Kuzzle v1, pas de la dette. Voir [ADR-0005](adr/0005-conserver-les-deux-sdk-kuzzle.md) | ➖ |
| `bluebird` | les Promises natives suffisent depuis Node 4 | ⬜ |
| `moment` | en maintenance depuis 2020 → `date-fns` ou `Temporal` | ⬜ |
| `velocity-animate` | remplaçable par des transitions CSS/Tailwind | ⬜ |
| `@fortawesome/fontawesome-free` | à réévaluer avec le nouveau design system | ⬜ |
| `json-formatter-js` | utilisé via une directive ; à réévaluer | ⬜ |

---

## 4. Inventaire des composants

140 composants, ~25 000 LOC, **813 balises `<b-*>`**, dont 135 fichiers en
Options API. Trié par volume de `<b-*>` : c'est le proxy le plus fiable de
l'effort de migration.

Ordre de traitement retenu en phase 2 : **Common → Security → ApiAction → Data**.
Common d'abord parce que ses composants sont partagés et que les migrer valide
les primitives sur un petit périmètre ; Data en dernier parce que c'est le plus
gros et le plus risqué.

### Data — 45 composants, 298 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Data/Collections/Watch.vue` | 38 | 496 | ✅ reprise ([#1051](https://github.com/kuzzleio/kuzzle-admin-console/pull/1051)) |
| `Data/Documents/Views/Map.vue` | 24 | 429 | ✅ reprise ([#1053](https://github.com/kuzzleio/kuzzle-admin-console/pull/1053)) |
| `Data/Documents/Views/Column/Column.vue` | 22 | 506 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Collections/CollectionList.vue` | 19 | 426 | ✅ reprise ([#1050](https://github.com/kuzzleio/kuzzle-admin-console/pull/1050)) |
| `Data/Indexes/Page.vue` | 18 | 352 | ✅ reprise ([#1050](https://github.com/kuzzleio/kuzzle-admin-console/pull/1050)) |
| `Data/Documents/Common/CreateOrUpdate.vue` | 18 | 247 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Documents/Page.vue` | 13 | 955 | ✅ reprise ([#1052](https://github.com/kuzzleio/kuzzle-admin-console/pull/1052)) |
| `Data/Documents/FormInputs/DateTimeFormInput.vue` | 13 | 85 | ✅ reprise ([#1055](https://github.com/kuzzleio/kuzzle-admin-console/pull/1055)) |
| `Data/Collections/CreateOrUpdate.vue` | 12 | 309 | ✅ reprise ([#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054)) |
| `Data/Documents/DocumentListItem.vue` | 11 | 218 | ✅ reprise ([#1052](https://github.com/kuzzleio/kuzzle-admin-console/pull/1052)) |
| `Data/Documents/Views/TimeSeries.vue` | 8 | 351 | ✅ reprise ([#1053](https://github.com/kuzzleio/kuzzle-admin-console/pull/1053)) |
| `Data/Indexes/CreateIndexModal.vue` | 8 | 163 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Documents/ListActions.vue` | 7 | 68 | ➖ supprimé — importé nulle part ([#1052](https://github.com/kuzzleio/kuzzle-admin-console/pull/1052)) |
| `Data/Collections/DropdownView.vue` | 7 | 110 | ✅ reprise ([#1051](https://github.com/kuzzleio/kuzzle-admin-console/pull/1051)) |
| `Data/Indexes/BulkDeleteIndexesModal.vue` | 6 | 98 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Indexes/DeleteIndexModal.vue` | 6 | 87 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Collections/DeleteCollectionModal.vue` | 6 | 112 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Collections/BulkDeleteCollectionsModal.vue` | 6 | 108 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Collections/ModalClear.vue` | 5 | 95 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Documents/FormInputs/JsonFormInput.vue` | 5 | 49 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Collections/DropdownAction.vue` | 5 | 135 | ✅ reprise ([#1051](https://github.com/kuzzleio/kuzzle-admin-console/pull/1051)) |
| `Data/Documents/DeleteModal.vue` | 4 | 52 | ✅ reprise ([#1047](https://github.com/kuzzleio/kuzzle-admin-console/pull/1047)) |
| `Data/Data404.vue` | 4 | 30 | ✅ reprise ([#1037](https://github.com/kuzzleio/kuzzle-admin-console/pull/1037)) |
| `Data/Documents/Views/List.vue` | 4 | 126 | ✅ reprise ([#1052](https://github.com/kuzzleio/kuzzle-admin-console/pull/1052)) |
| `Data/Leftnav/Treeview.vue` | 3 | 97 | ✅ reprise ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Documents/Views/Column/TableCell.vue` | 3 | 79 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Indexes/DropdownActions.vue` | 3 | 75 | ✅ reprise ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Documents/NoResultsEmptyState.vue` | 3 | 20 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Documents/Update.vue` | 3 | 173 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Realtime/Notification.vue` | 3 | 147 | ✅ reprise ([#1051](https://github.com/kuzzleio/kuzzle-admin-console/pull/1051)) |
| `Data/Leftnav/IndexBranch.vue` | 2 | 273 | ✅ reprise ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Collections/Create.vue` | 1 | 72 | ✅ reprise ([#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054)) |
| `Data/Documents/Views/Column/HeaderTableView.vue` | 1 | 56 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Documents/EmptyState.vue` | 1 | 39 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Documents/Views/Column/HighlightableRow.vue` | 1 | 30 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Documents/Common/NewDocumentsBadge.vue` | 1 | 27 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Layout.vue` | 1 | 253 | ⬜ |
| `Data/Documents/Create.vue` | 1 | 138 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Documents/NoGeopointFieldState.vue` | 1 | 12 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Collections/Update.vue` | 1 | 104 | ✅ reprise ([#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054)) |
| `Data/Documents/RealtimeOnlyEmptyState.vue` | 0 | 45 | ➖ supprimé — importé nulle part ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Documents/Views/TimeSeriesItem.vue` | 0 | 151 | ✅ reprise ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Documents/DocumentBoxItem.vue` | 0 | 114 | ➖ supprimé — importé nulle part ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Documents/ListViewButtons.vue` | 0 | 104 | ➖ supprimé — importé nulle part ([#1020](https://github.com/kuzzleio/kuzzle-admin-console/issues/1020)) |
| `Data/Collections/Tabs.vue` | 0 | 102 | ➖ supprimé — importé nulle part ([#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054)) |

### Security — 37 composants, 217 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Security/Users/List.vue` | 17 | 395 | ⬜ |
| `Security/Profiles/List.vue` | 17 | 335 | ⬜ |
| `Security/Roles/List.vue` | 16 | 306 | ⬜ |
| `Security/Layout.vue` | 13 | 98 | ⬜ |
| `Security/Roles/CreateOrUpdate.vue` | 13 | 275 | ✅ reprise |
| `Security/Users/EditCustomMapping.vue` | 13 | 176 | ✅ reprise |
| `Security/Profiles/CreateOrUpdate.vue` | 11 | 216 | ✅ reprise |
| `Security/Profiles/Filters.vue` | 10 | 155 | ⬜ |
| `Security/Roles/Filters.vue` | 10 | 115 | ⬜ |
| `Security/Users/CreateOrUpdate.vue` | 9 | 356 | ⬜ |
| `Security/Profiles/ProfileItem.vue` | 9 | 186 | ✅ reprise |
| `Security/Roles/RoleItem.vue` | 9 | 109 | ✅ reprise |
| `Security/Roles/Page.vue` | 8 | 167 | ✅ reprise |
| `Security/Users/Page.vue` | 8 | 120 | ⬜ |
| `Security/Users/Steps/UserProfileList.vue` | 8 | 118 | ⬜ |
| `Security/Users/Steps/CredentialsSelector.vue` | 8 | 112 | ⬜ |
| `Security/Users/Steps/Basic.vue` | 7 | 91 | ✅ reprise |
| `Security/Profiles/Page.vue` | 6 | 76 | ✅ reprise |
| `Security/Users/UserItem.vue` | 6 | 204 | ✅ reprise |
| `Security/Users/DeleteModal.vue` | 4 | 57 | ✅ reprise |
| `Security/Roles/DeleteModal.vue` | 4 | 57 | ✅ reprise |
| `Security/Profiles/DeleteModal.vue` | 4 | 57 | ✅ reprise |
| `Security/Users/Steps/CustomData.vue` | 3 | 80 | ✅ reprise |
| `Security/Profiles/Update.vue` | 2 | 120 | ✅ reprise |
| `Security/Profiles/Create.vue` | 1 | 71 | ✅ reprise |
| `Security/Common/Notice.vue` | 1 | 26 | ✅ reprise |
| `Security/Common/JsonWithMapping.vue` | 0 | 97 | ⬜ |
| `Security/Users/Steps/Mapping.vue` | 0 | 87 | ⬜ |
| `Security/Profiles/RoleChips.vue` | 0 | 83 | ⬜ |
| `Security/Common/Filters/RawFilter.vue` | 0 | 70 | ⬜ |
| `Security/Profiles/CrudlDocument.vue` | 0 | 257 | ⬜ |
| `Security/Roles/CrudlDocument.vue` | 0 | 244 | ⬜ |
| `Security/Common/List.vue` | 0 | 208 | ⬜ |
| `Security/Common/Filters/BasicFilter.vue` | 0 | 192 | ⬜ |
| `Security/Users/Steps/StepsContent.vue` | 0 | 168 | ⬜ |
| `Security/Roles/Filters/BasicFilter.vue` | 0 | 121 | ⬜ |
| `Security/Common/Filters/QuickFilter.vue` | 0 | 112 | ⬜ |

### Common — 33 composants, 184 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Common/Filters/BasicFilter.vue` | 40 | 469 | ⬜ |
| `Common/Environments/CreateEnvironment.vue` | 17 | 380 | ⬜ |
| `Common/Filters/QuickFilter.vue` | 14 | 215 | ⬜ |
| `Common/MainMenu.vue` | 14 | 200 | ⬜ |
| `Common/Filters/FilterHistoryItem.vue` | 12 | 134 | ⬜ |
| `Common/Filters/FavoriteFilterItem.vue` | 11 | 111 | ⬜ |
| `Common/Login/Form.vue` | 9 | 208 | ⬜ |
| `Common/Offline.vue` | 8 | 88 | ✅ reprise |
| `Common/Environments/ModalImport.vue` | 7 | 159 | ✅ reprise |
| `Common/Environments/SelectEnvironmentPage.vue` | 6 | 59 | ✅ reprise |
| `Common/Filters/Filters.vue` | 6 | 349 | ⬜ |
| `Common/Environments/EnvironmentsSwitch.vue` | 6 | 159 | ⬜ |
| `Common/Login/ResetPasswordForm.vue` | 6 | 145 | ⬜ |
| `Common/Environments/CreateEnvironmentPage.vue` | 6 | 104 | ✅ reprise |
| `Common/Filters/RawFilter.vue` | 5 | 147 | ⬜ |
| `Common/Environments/ModalDelete.vue` | 5 | 118 | ✅ reprise |
| `Common/ListNotAllowed.vue` | 4 | 22 | ✅ reprise |
| `Common/Environments/ModalCreateOrUpdate.vue` | 3 | 49 | ✅ reprise |
| `Common/MainSpinner.vue` | 2 | 16 | ✅ reprise |
| `Common/PerPageSelector.vue` | 1 | 35 | ✅ reprise ([#1053](https://github.com/kuzzleio/kuzzle-admin-console/pull/1053)) |
| `Common/PageNotAllowed.vue` | 1 | 30 | ✅ reprise |
| `Common/Autocomplete.vue` | 1 | 166 | ⬜ |
| `Common/Filters/HistoryFilter.vue` | 0 | 80 | ⬜ |
| `Common/Filters/FavoriteFilters.vue` | 0 | 65 | ⬜ |
| `Common/MSelect.vue` | 0 | 60 | ⬜ |
| `Common/HighlightedSpan.vue` | 0 | 36 | ⬜ |
| `Common/CrudlDocument.vue` | 0 | 254 | ⬜ |
| `Common/CommonList.vue` | 0 | 228 | ⬜ |
| `Common/Breadcrumb.vue` | 0 | 161 | ⬜ |
| `Common/MappingForm/Form.vue` | 0 | 129 | ⬜ |
| `Common/MappingForm/FormLine.vue` | 0 | 121 | ⬜ |
| `Common/Stepper.vue` | 0 | 112 | ⬜ |
| `Common/JsonEditor.vue` | 0 | 106 | ⬜ |

### Racine — 8 composants, 56 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Signup.vue` | 19 | 245 | ⬜ |
| `ApiAction.vue` | 12 | 432 | ⬜ |
| `404.vue` | 6 | 35 | ✅ reprise ([#1037](https://github.com/kuzzleio/kuzzle-admin-console/pull/1037)) |
| `Login.vue` | 6 | 110 | ⬜ |
| `ResetPassword.vue` | 5 | 75 | ⬜ |
| `TelemetryBanner.vue` | 4 | 60 | ⬜ |
| `Home.vue` | 3 | 173 | ⬜ |
| `ConnectionAwareContainer.vue` | 1 | 226 | ⬜ |

### ApiAction — 4 composants, 49 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `ApiAction/QueryCard.vue` | 24 | 349 | ⬜ |
| `ApiAction/QueryList.vue` | 14 | 128 | ⬜ |
| `ApiAction/ResponseCard.vue` | 8 | 85 | ⬜ |
| `ApiAction/SaveQueryModal.vue` | 3 | 70 | ✅ reprise |

### Error — 5 composants, 9 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Error/KuzzleErrorPage.vue` | 6 | 82 | ⬜ |
| `Error/Layout.vue` | 3 | 20 | ⬜ |
| `Error/KuzzleDisconnectedPage.vue` | 0 | 94 | ⬜ |
| `Error/KuzzleDisconnected.vue` | 0 | 70 | ⬜ |
| `Error/Connecting.vue` | 0 | 69 | ⬜ |

### Materialize — 7 composants, 0 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Materialize/Tabs.vue` | 0 | 87 | ⬜ |
| `Materialize/Dropdown.vue` | 0 | 69 | ➖ supprimé — orphelin avec `DocumentBoxItem.vue` ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Materialize/Tab.vue` | 0 | 53 | ⬜ |
| `Materialize/Headline.vue` | 0 | 36 | ⬜ |
| `Materialize/Toaster.vue` | 0 | 22 | ⬜ |
| `Materialize/Modal.vue` | 0 | 156 | ⬜ |
| `Materialize/Pagination.vue` | 0 | 147 | ⬜ |

### Autres — 1 composants, 0 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `App.vue` | 0 | 62 | ⬜ |

---

## 5. Gotchas

> **Section la plus utile du document.** On l'alimente **au moment où on
> rencontre le piège**, pas en fin de chantier. Un piège non écrit sera
> re-rencontré par la personne suivante.
>
> Format : une entrée = le symptôme observé, la cause, la solution retenue.

### 5.1 Rencontrés
#### G-001 — Les specs sont instables quand elles s'enchaînent, pas isolées

- **Contexte** : phase 0, suite e2e complète.
- **Symptôme** : `formView` échoue par intermittence sur
  `expected 42 to equal 43`. Taux mesuré le 2026-09-18 : **1 échec sur 16** en
  exécution isolée, machine au repos. Même famille de symptôme sur `collections`
  (`Should be able to update a collection`, assertion sur le contenu de
  l'éditeur Ace) observé une fois puis non reproduit.
- **Cause** : trois sources distinctes, à ne pas confondre.
  1. **`cy.request()` n'est pas réessayée, et rien n'attend que l'application
     ait écrit.** Le test « update a document » clique
     `DocumentUpdate-btn` puis enchaîne **directement** sur un `cy.request` :
     Cypress rend la main dès le clic, sans attendre la soumission. La lecture
     gagne la course et renvoie le document d'avant — d'où `42` au lieu de `43`.
     Reproduit à volonté en retardant la persistance de 1,5 s. C'est le cas du
     lot D d'[ADR-0006](adr/0006-attentes-sur-assertion-cypress.md), auquel
     `formView.spec.js` avait échappé faute de contenir le moindre `cy.wait()`.
  2. **57 `cy.wait(<durée fixe>)`** répartis sur 12 specs, soit **63 s de
     sommeil cumulé**. Une attente fixe est toujours soit trop longue (elle
     ralentit la suite) soit trop courte (elle casse sous charge).
  3. L'état du backend local, qui n'est pas réinitialisé entre les specs
     (cf. [G-006](#g-006--un-backend-local-qui-vit-longtemps-fait-échouer-la-suite-et-les-messages-ne-pointent-pas-vers-la-cause)).
- **Hypothèse invalidée — ne pas la reprendre.** Cette fiche a longtemps
  attribué l'instabilité de `formView` aux saisies clavier `delay: 200` /
  `force: true` dans Ace et `vue-form-generator` : « sous charge, une frappe peut
  être perdue ». **C'est faux pour cette spec.** Vérifié le 2026-09-18 : sous
  bridage CPU ×20 (la spec passe de 46 s à 3 min), elle reste **4/4 verte** ; en
  retardant de 1,5 s le chargement du document, **4/4 verte** aussi. Seul le
  retard sur l'écriture reproduit le symptôme. La perte de frappe existe bien
  ailleurs — c'est ce que traite `cy.aceReady()` (lot C) — mais ce n'est pas ce
  qui cassait `formView`.
- **Solution** : ancrer le test sur l'état observable avant de lire le backend.
  L'application ne retourne à la liste qu'une fois l'écriture persistée : c'est
  le signal. Puis `cy.expectBackend()`, qui rejoue la requête et donne un diff
  lisible. Garde-fou, persistance retardée de 1,5 s :

  | Spec | Résultat |
  |---|---|
  | avant | ❌ `expected 42 to equal 43` |
  | après | ✅ 4/4 |

  `retries: { runMode: 2 }` reste en place : ce n'est pas le correctif, c'est ce
  qui retire le bruit du signal CI. Les `cy.wait()` sont traités (source 2,
  [§ 1.1](#11-attentes-cypress--adr-0006)). ✅
- **Pourquoi la CI ne voit rien** : elle lance **un job par spec**, chacun avec
  son `docker compose` neuf — 17 jobs parallèles. Zéro tentative rejouée sur les
  5 derniers runs (85 exécutions de spec). La CI ne peut donc structurellement
  pas observer ni l'enchaînement des specs, ni l'état de backend partagé. Une
  suite verte en CI ne dit rien de sa stabilité en local, où elle tourne d'affilée
  sur un seul backend.
- **À retenir pour la phase 2** : ces instabilités vont empirer quand chaque
  écran sera réécrit. Elles seront alors difficiles à distinguer d'une vraie
  régression de migration. Autant les traiter avant.


<!--
Gabarit à copier :

#### G-00X — <symptôme en une ligne>
- **Contexte** : phase / composant concerné
- **Symptôme** : ce qu'on observe réellement (message d'erreur exact si court)
- **Cause** : ce qui se passe vraiment
- **Solution** : ce qu'on a fait
- **Ref** : PR / issue
-->

#### G-002 — Elasticsearch 8 a retiré des fonctions `geo_shape` que la console utilise encore

- **Contexte** : phase 0, `docs.spec.js`, vue carte (formes).
- **Symptôme** : deux `400` successifs du backend, d'abord à la création de la
  collection, puis à celle du document.
- **Cause** : la stack `docker-compose` est passée à Elasticsearch 8, qui a
  supprimé deux choses que le test utilisait, héritées d'ES 6/7 :
  - le paramètre `strategy` sur un mapping `geo_shape` —
    *« using deprecated parameters [strategy] in mapper […] is no longer allowed »* ;
  - la géométrie `CIRCLE` elle-même — *« CIRCLE geometry is not supported »*.
    C'était précisément ce que la stratégie `recursive` permettait de stocker.
- **Solution** : le test exerce désormais un **polygone**, accepté par ES 8 et
  rendu par la vue carte avec les mêmes ancrages (`data-cy-shape-<id>`).
- **⚠️ Ce n'est pas qu'un problème de test.** `Map.vue` sait rendre `circle`,
  `polygon` et `multipolygon`. Le rendu des cercles **n'est plus atteignable sur
  un backend Elasticsearch 8** : plus personne ne peut stocker une telle forme.
  Ce code n'est pour autant pas mort — il reste utile pour les backends
  Kuzzle v1 / ES 6, dont le support est maintenu
  ([ADR-0005](adr/0005-conserver-les-deux-sdk-kuzzle.md)). À garder en tête si
  la question du support de Kuzzle v1 se repose : le jour où il s'arrête, ce
  code part avec.

#### G-003 — Cypress se connecte à `127.0.0.1`, Vite n'écoute que sur `::1`

- **Contexte** : exécution locale d'une spec e2e sur macOS (PR #1013).
- **Symptôme** : les 9 tests de `roles.spec.js` échouent tous sur
  `cy.visit()` — *« Error: connect ECONNREFUSED 127.0.0.1:8080 »* — alors que
  `curl http://localhost:8080` répond bien et que la CI, elle, est verte.
- **Cause** : `npm run dev` sans `--host` fait écouter Vite sur `localhost`,
  que macOS résout en IPv6 `::1` uniquement. `curl` suit la même résolution et
  réussit ; le proxy Node de Cypress, lui, compose `127.0.0.1` en dur. Les deux
  adresses ne désignent pas la même socket. Sur Ubuntu (la CI) le cas ne se pose
  pas, d'où l'asymétrie local / CI.
- **Solution** : lancer le serveur avec une adresse IPv4 explicite —
  `npm run dev -- --host 127.0.0.1 --port 8080 --strictPort`. Le `--strictPort`
  n'est pas cosmétique : sans lui, Vite bascule silencieusement sur 8081 quand
  8080 est pris et on croit tester un serveur qui n'est pas celui visé.
- **À retenir** : un « tous les tests échouent au tout premier `cy.visit()` »
  est presque toujours un problème d'adresse, pas d'application.

#### G-004 — `security:restrictDefaultRights` n'existe qu'à partir de Kuzzle 2.56

- **Contexte** : PR #1013, remplacement de la révocation des droits anonymes
  faite côté console par l'action backend dédiée.
- **Symptôme** : le job *E2E Test - roles* échoue sur la PR alors que le code
  est correct ; en local, le clic sur « Revoke anonymous rights » ne change
  rien et la console affiche le toast *« This action is not supported by your
  Kuzzle version »*.
- **Cause** : deux causes empilées.
  1. L'action `security:restrictDefaultRights` a été livrée dans Kuzzle
     **2.56.0**. La PR avait aligné la devDependency `kuzzle` sur 2.55.0, qui
     ne l'expose pas — et de toute façon cette devDependency ne pilote rien :
     le backend des tests vient de `docker-compose` (`kuzzleio/kuzzle:2`), qui
     était encore en 2.55 au moment de la PR.
  2. L'assertion de la spec décrivait la sortie de l'ancien code côté console,
     qui écrivait un joker `'*': { actions: { '*': false } }` explicite. La
     configuration standard du backend ne contient pas ce joker : elle
     n'énumère que les actions autorisées. La restriction est identique — ce
     qui n'est pas listé est refusé — mais la forme du document diffère.
- **Solution** : l'assertion vérifie désormais la forme produite par le backend
  (sans joker), et couvre aussi le rôle `default`, que l'action restreint au
  même titre que `anonymous`. La devDependency `kuzzle` a été retirée par
  ailleurs (voir #988) : elle n'a jamais servi à rien ici.
- **À retenir** : `docker-compose.yml` épingle `kuzzleio/kuzzle:2`, un tag
  flottant. Une PR qui dépend d'une action backend récente peut donc échouer
  puis passer sans qu'une ligne de code ait bougé, au gré des publications de
  l'image. Vérifier la version réellement servie avant de conclure à un bug :
  `curl -s localhost:7512/_publicApi | jq '.result.security | keys'`.


#### G-005 — Un `defaultCommandTimeout` très large masque les attentes fixes inutiles

- **Contexte** : ADR-0006 / ADR-0007, lot E d'`environments.spec.js`.
- **Symptôme** : une `cy.wait(5000)` posée devant une assertion paraît
  indispensable — on « sait » que le toast met 5 s à apparaître — alors que la
  supprimer ne change rien : le test passe et devient plus court.
- **Cause** : `cypress.config.ts` fixe `defaultCommandTimeout: 60000`. Toute
  assertion réessayée dispose donc déjà de 60 s, soit douze fois le délai que
  l'attente fixe prétendait couvrir. Le sommeil ne couvrait pas le délai, il
  s'additionnait à un réessai qui le couvrait déjà.
- **Solution** : avant de classer une attente comme « vrai délai à conserver »,
  la retirer et regarder si la commande suivante est réessayée. Si oui, le
  sommeil est du temps mort — quelle que soit l'intuition qu'on a du délai.
  Le revers : un `defaultCommandTimeout` large est aussi ce qui rend un échec
  lent (60 s × 3 tentatives = 3 min pour une seule assertion). D'où le plafond
  explicite des commandes de `commands.js`, cf.
  [ADR-0007](adr/0007-lot-e-assertion-plutot-que-sommeil.md).
- **À retenir** : ne pas conclure d'un `cy.wait()` qu'il protège quelque chose.
  Le seul verdict qui compte est expérimental — retirer, exécuter, et saboter le
  comportement visé pour vérifier que le test échoue encore.
- **Ref** : ADR-0007.

#### G-006 — Un backend local qui vit longtemps fait échouer la suite, et les messages ne pointent pas vers la cause

- **Contexte** : exécutions locales de la suite complète. La CI n'est pas
  concernée : elle démarre un `docker compose` neuf à chaque run.
- **Symptôme** : après quelques heures d'utilisation du même backend, **jusqu'à
  5 specs sur 17** échouent avec des messages hétérogènes et sans rapport avec
  le diff en cours — `412 Login "admin" is already used` sur `_createFirstAdmin`,
  `404 User "kuid-…" not found` **sur `admin/_resetSecurity` lui-même**, suites
  entières marquées *skipped* parce que l'échec tombe dans un `before each`
  (`roles`, `profiles`, `users`, `environments`). Le même arbre passe en CI.
- **Cause** : `admin/_resetSecurity` supprime les utilisateurs mais **laisse
  leurs credentials `local`**. L'orpheline suffit à faire échouer toute
  recréation du même login, et le `_resetSecurity` suivant part en 404 sur un
  kuid qu'il ne retrouve plus — ce qui contamine les specs d'après par leurs
  hooks. Tuer un `cypress run` en cours produit le même genre de résidu
  (`500 Internal database inconsistency detected: existing credentials found on
  non-existing user goofy`), le verrou `412 api.process.action_locked` en prime
  tant que le reset interrompu s'achève.
- **Solution** : repartir d'une stack neuve — c'est le seul nettoyage fiable,
  `_resetSecurity` ne suffit pas :
  ```sh
  docker compose down -v && docker compose up --wait
  ```
  Vérifié : sur le backend sale, `login` (4 échecs) et `roles` (1 + 8 skipped)
  échouaient **à l'identique sur `HEAD` avec le diff stashé** ; sur la stack
  recréée, les 17 specs passent. Pour un diagnostic ciblé, une orpheline se
  constate avec
  `curl -s 'localhost:7512/credentials/local/<login>/_exists'` alors que
  `users/_search` ne renvoie rien.
- **À retenir** : deux réflexes avant de suspecter son propre diff devant une
  fournée d'échecs hétérogènes. **Un** : rejouer la spec avec `--config
  retries=0` — les retries masquent l'échec initial et n'exposent que la
  cascade, ici un 404 qui cachait le 412 d'origine. **Deux** : rejouer sur
  `HEAD` avec `git stash`, puis sur une stack neuve. La suite n'est pas isolée
  du backend ; son état se manifeste loin de sa cause.
- **Ref** : rencontré pendant le lot E (ADR-0007).

#### G-007 — `cy.aceReady()` ne s'applique pas aux éditeurs du formulaire document

- **Contexte** : tentative d'étendre la commande du lot C
  ([ADR-0006](adr/0006-attentes-sur-assertion-cypress.md)) aux éditeurs JSON de
  la vue formulaire (`formView.spec.js`).
- **Symptôme** : `cy.aceReady('[name="items"]')` échoue au bout de 60 s —
  `expected '<div.ace_line>' to be 'visible'`, puis, en déplaçant la cible,
  `<div.ace_content>` et `<div.ace_scroller>` tour à tour, avec le motif
  « *is not visible because its content is being clipped by one of its parent
  elements, which has a CSS property of overflow: hidden* ».
- **Cause** : Ace dimensionne `.ace_content` **au contenu** et le laisse
  déborder de `.ace_scroller`, en `overflow: hidden` — mesuré ici 589×292 dans
  250 px de haut. Le débordement est normal, c'est ainsi qu'Ace défile ; mais il
  suffit à ce que Cypress déclare l'élément masqué. Aucune cible de l'éditeur
  n'est donc assertable en visibilité dans ce formulaire, et `.ace_line` est en
  plus de hauteur nulle tant que l'éditeur est vide (formulaire de création).
- **Solution** : ne pas utiliser `cy.aceReady()` là. Elle reste valable pour les
  éditeurs plein écran de ses quatre specs (`api-actions`, `docs`, `search`,
  `users`), où le contenu ne déborde pas. Pour la vue formulaire, les specs
  tapent déjà en `force: true` — la visibilité ne leur est pas nécessaire — et
  l'instabilité réelle venait d'ailleurs (cf. G-001).
- **À retenir** : `should('be.visible')` sur un composant tiers qui gère son
  propre défilement est un pari. Vérifier la géométrie réelle
  (`getBoundingClientRect` sur une sonde jetable) avant de bâtir une commande
  partagée dessus.
- **Ref** : rencontré en corrigeant `formView.spec.js`.

#### G-008 — Une utilitaire Tailwind peut perdre contre Bootstrap sans rien signaler

- **Contexte** : phase 1, branchement de Tailwind à côté de Bootstrap 4.
- **Symptôme** : sur `<button class="btn btn-primary tw:bg-accent rounded-lg">`,
  le fond prend bien la valeur du token — mais le rayon vaut **4,8 px** au lieu
  des 6 px attendus. Aucune erreur, aucun avertissement : juste la mauvaise
  valeur.
- **Cause** : Bootstrap 4 définit lui aussi `.rounded-lg`, en
  `border-radius: .3rem !important`. Ranger Bootstrap dans une couche CSS basse
  ne suffit pas : une déclaration `!important` **inverse** l'ordre des couches,
  la couche la plus basse l'emporte. Les collisions de noms sont nombreuses —
  `rounded`, `border`, `shadow`, `text-center`, `m-0`, `p-0`, `w-100`,
  `d-block`, `bg-primary`…
- **Solution** : préfixer les utilitaires Tailwind (`tw:`) tant que Bootstrap
  est présent. Vérifié : avec le préfixe, fond **et** rayon prennent les valeurs
  attendues. Décision et retrait en
  [ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md).
- **À retenir** : un conflit de CSS ne casse rien, il décale. Sur un écran
  repris, mesurer la valeur calculée (`getComputedStyle`) plutôt que de se fier
  au rendu à l'œil — 4,8 px et 6 px sont indiscernables sur une capture.
- **Ref** : ADR-0008.

#### G-009 — `tailwind-merge` mal configuré supprime des classes Bootstrap

- **Contexte** : phase 1, écriture de `cn()` pour la première primitive.
- **Symptôme** : sur un composant portant encore des classes Bootstrap, une
  classe disparaît du DOM. `cn('m-0 m-3')` rend `m-3`, `cn('bg-primary bg-light')`
  rend `bg-light`, `cn('text-left text-center')` rend `text-center`.
- **Cause** : `tailwind-merge` déduplique par groupe d'utilitaires. Sans lui
  dire que nos classes portent le préfixe `tw:` (ADR-0008), il prend les classes
  Bootstrap pour des classes Tailwind et en garde une seule — alors que les deux
  ont un sens pour Bootstrap.
- **Solution** : `extendTailwindMerge({ prefix: 'tw' })` dans `src/lib/utils.ts`.
  Vérifié : avec la configuration, `cn('m-0 m-3')` rend bien `m-0 m-3`. À retirer
  avec le préfixe, en fin de phase 2.
- **À retenir** : tant que les deux vocabulaires coexistent, tout outil qui
  *raisonne* sur les noms de classes doit savoir lequel est le nôtre.
- **Ref** : [ADR-0009](adr/0009-contrat-des-primitives-ui.md).

#### G-010 — Le `<style scoped>` d'un SFC bat les utilitaires Tailwind

- **Contexte** : phase 1, vérification de la cohabitation sur le bundle construit.
- **Symptôme** : `tw:text-primary-foreground` seule donne `rgb(255, 255, 255)`.
  La **même** classe, sur un élément portant une règle scopée de SFC, donne
  `rgb(0, 0, 0)` : l'utilitaire est écrasée. Là encore, aucune erreur.
- **Cause** : les `<style scoped>` des SFC — et les CSS importés par les
  composants, comme `vue-form-generator` — sont émis **hors couche**, en tête de
  bundle. Le CSS hors couche l'emporte sur *toutes* les couches, `utilities`
  comprise. Ranger le legacy dans une couche (ADR-0008) règle le cas Bootstrap,
  pas celui-là.
- **Solution** : reprendre un écran, c'est retirer ses classes Bootstrap **et**
  ses styles scopés décoratifs (couleur, espacement, rayon, typographie). Un
  `<style scoped>` qui subsiste gagne en silence
  ([ADR-0009](adr/0009-contrat-des-primitives-ui.md), règle 4).
- **À retenir** : la garantie d'ADR-0008 vaut face à Bootstrap, pas face au
  style scopé du composant qu'on reprend. Vérifier avec `getComputedStyle`, pas
  à l'œil.
- **Ref** : [ADR-0009](adr/0009-contrat-des-primitives-ui.md).

#### G-011 — Le job Lint porte le portillon du job E2E

- **Contexte** : phase 1, première PR du chantier design ([#1034](https://github.com/kuzzleio/kuzzle-admin-console/pull/1034)).
- **Symptôme** : la PR échoue sur `Lint`, et les 17 specs sortent en
  `skipping` — alors que la PR ne touche ni les specs ni le fichier fautif.
- **Cause** : le job `E2E Test` dépend du job `Lint`. Une seule erreur ESLint
  **préexistante** (`stores/auth.ts`, `@typescript-eslint/no-misused-promises`)
  suffit donc à retirer le filet de sécurité sur *toutes* les PR, y compris
  celles qui n'y sont pour rien.
- **Solution** : corrigée dans [#1035](https://github.com/kuzzleio/kuzzle-admin-console/pull/1035).
  Tant que le chantier dure, traiter une erreur de lint préexistante comme
  bloquante et non comme du bruit : elle coûte le e2e à tout le monde.
- **À retenir** : vérifier que le e2e a **tourné**, pas seulement que la PR est
  verte. Un job `skipping` n'est pas un job qui passe.
- **Ref** : [#1035](https://github.com/kuzzleio/kuzzle-admin-console/pull/1035).

#### G-012 — `v-model` sur une primitive ne porte pas le même nom en Vue 2 et en Vue 3

- **Contexte** : phase 1, écriture de la primitive `Input`.
- **Symptôme** : `<Input v-model="valeur" />` affiche bien la valeur initiale,
  mais la saisie ne remonte jamais. Aucune erreur.
- **Cause** : l'amont shadcn-vue nomme la prop `modelValue` et l'événement
  `update:modelValue` (Vue 3). Le `v-model` de Vue 2, lui, attend `value` et
  `input` : il pose la valeur sur une prop `value` que la primitive ne déclare
  pas, et écoute un événement qu'elle n'émet pas.
- **Solution** : l'option `model` de Vue 2
  (`model: { prop: 'modelValue', event: 'update:modelValue' }`) fait le pont.
  L'API publique reste celle de l'amont, et les noms n'auront pas à changer en
  phase 4.
- **À retenir** : toute primitive à valeur (`Input`, `Textarea`, `Select`,
  `Checkbox`, `Switch`) porte cette option. L'oublier ne casse rien de visible —
  le champ s'affiche, il ne remonte simplement rien.
- **Ref** : [ADR-0009](adr/0009-contrat-des-primitives-ui.md).
#### G-013 — Un `@import` de `.css` placé dans un `@layer` sort du bundle

- **Contexte** : phase 1, mise de `style.scss` dans la couche `legacy` (ADR-0008).
- **Symptôme** : six specs e2e échouent d'un coup avec
  `cy.click() failed because this element is not visible: <a data-cy="MainMenu-logoutBtn">`,
  `effective width and height of: 0 x 0 pixels`. Le build passe, le lint passe,
  la preview se déploie. En réalité **toutes les icônes de la console ont
  disparu** : un `<a>` dont le seul contenu est un `<i class="fas fa-…">` mesure
  0 × 0 sans la fonte.
- **Cause** : `@import '@fortawesome/fontawesome-free/css/all.css'` était dans
  `style.scss`. Sass hisse l'`@import` d'un fichier `.css` **hors** du bloc
  `@layer`, en tête de feuille ; Vite cesse alors de le résoudre et le laisse
  tel quel. Le bundle contient `@import"@fortawesome/fontawesome-free/css/all.css"`,
  un spécificateur que le navigateur ne sait pas résoudre. Aucune erreur nulle
  part — ni au build, ni à l'exécution.
- **Solution** : importer la feuille depuis `tailwind.css`, où c'est
  `@tailwindcss/vite` qui résout, avec la couche en toutes lettres :
  `@import '@fortawesome/fontawesome-free/css/all.css' layer(legacy);`.
  Vérifié : la fonte est de retour dans le bundle, dans la couche `legacy`, et
  les `.woff2` sont émis.
- **À retenir** : après une intervention sur la feuille de styles, vérifier que
  les dépendances CSS sont **encore dans le bundle** — `grep` sur une règle
  connue — et pas seulement que le build passe. Et rejouer les specs contre un
  `vite preview` du build, pas contre le serveur de dev : les sept specs de
  `login` passaient en dev et échouaient sur le bundle.
- **Ref** : [#1034](https://github.com/kuzzleio/kuzzle-admin-console/pull/1034).

#### G-014 — `props: ['x']` fait perdre la vérification de types aux sites d'appel

- **Contexte** : phase 2, reprise de `ModalCreateOrUpdate.vue` en TypeScript.
- **Symptôme** : `vue-tsc` échoue sur le **parent**, pas sur le composant fautif :
  `Argument of type '{ environmentId: string; … }' is not assignable to
  parameter of type '…Readonly<ExtractPropTypes<string[]>>…'`. Le composant
  enfant, lui, ne signale rien.
- **Cause** : `CreateEnvironment.vue` déclarait `props: ['environmentId']`. La
  forme tableau ne porte aucun type : `vue-tsc` en déduit `string[]` et refuse
  tout attribut passé depuis un parent typé. Tant que le parent est en
  JavaScript, personne ne s'en aperçoit.
- **Solution** : passer la forme objet (`{ environmentId: { type: String,
  default: null } }`) sur l'enfant. Un composant encore en Bootstrap peut rester
  en JavaScript, mais ses props doivent être déclarées en forme objet dès qu'un
  parent repris le rend.
- **À retenir** : reprendre un composant en TypeScript fait remonter des erreurs
  chez ses **voisins**. Ce n'est pas une régression, c'est de la dette qui
  devient visible — mais ça élargit le périmètre d'une PR de reprise, et il vaut
  mieux l'avoir prévu.
- **Ref** : [ADR-0010](adr/0010-primitive-dialog-en-vue-2.md).

#### G-015 — La route temporaire de revue rend une page blanche, sans erreur

- **Contexte** : phase 2, reprise de `MainSpinner` et `PageNotAllowed`. Aucun
  des deux ne s'affiche pendant une spec : il faut les monter sur une route
  temporaire pour les regarder (§ 1.3, point 4).
- **Symptôme** : la route répond, le routeur navigue, la console du navigateur
  est vide — et la page est blanche. Rien dans le build, rien dans le lint.
- **Cause** : la route était déclarée avec un composant en ligne
  (`component: { components: {...}, template: '<div>…</div>' }`). Le bundle
  embarque le **runtime seul** de Vue, sans compilateur de templates : une
  option `template` y est ignorée en silence. En dev le comportement est le même,
  mais on l'attribue plus volontiers à la route.
- **Solution** : écrire la page de revue dans un vrai `.vue` temporaire
  (`src/components/TmpPreview.vue`, non commité) et l'importer. Le SFC est
  compilé à la build, donc il rend.
- **À retenir** : le raccourci « juste un `template:` en ligne » ne marche jamais
  ici. Deux autres pièges de cette route de revue, du même coup : le routeur est
  en mode **hash**, donc l'URL à visiter est `/#/ma-route` et non `/ma-route` —
  sinon la navigation retombe sur la garde d'environnement ; et une assertion
  `should('be.visible')` sur un élément situé sous la ligne de flottaison échoue
  alors que `.click()`, lui, défile tout seul.

#### G-016 — `disabled` ne désactive rien sur un `Button` rendu en `router-link`

- **Contexte** : phase 2, reprise des pages Security. « Create Role » et
  « Create Profile » sont des liens de navigation qui doivent être inertes quand
  l'utilisateur n'a pas le droit de créer.
- **Symptôme** : le bouton se grise (`disabled:opacity-50` s'applique) mais reste
  cliquable, et la navigation a lieu. Aucune spec ne le voit : elles sont
  toujours jouées en administrateur.
- **Cause** : `b-button` arbitrait tout seul — avec `to` **et** `disabled`, il
  rendait un `<a>` inerte. La prop `as` de notre `Button` ne fait pas cet
  arbitrage : elle rend ce qu'on lui demande, et `disabled` n'a aucun effet sur
  un `<a>` ni sur un `router-link`.
- **Solution** : faire l'arbitrage au site d'appel —
  `:as="peut ? 'router-link' : 'button'"` et `:to="peut ? { … } : undefined"`.
  Le cas interdit rend un vrai `<button disabled>`, que le navigateur sait
  rendre inerte au clavier comme à la souris.
- **À retenir** : chaque `Button` avec `:to` **et** `:disabled` est à traiter
  ainsi. Il en reste dans `Security/Users/Page.vue` et dans Data. Ne pas
  « corriger » en ajoutant un `disabled` à la primitive : c'est l'absence de
  magie qui est le contrat d'ADR-0009.

#### G-017 — Une spec peut cibler un `id`, pas seulement un `data-cy`

- **Contexte** : phase 2, reprise de `UserItem.vue`. Le `<b-collapse>` qui montre
  le JSON du document devient un simple `v-show` — aucune primitive n'est
  nécessaire pour masquer un bloc.
- **Symptôme** : `users.spec.js` échoue sur un seul test,
  `Expected to find element: [id="collapse-without-credentials"], but never
  found it`. Les dix-sept autres passent, le rendu est correct à l'œil.
- **Cause** : `b-collapse` exigeait un `id` (il le relie à son déclencheur par
  `aria-controls`). Le composant le portait donc, et une spec s'en est servie
  comme point d'ancrage. En remplaçant la balise par un `<div v-show>`, l'`id`
  est parti avec elle.
- **Solution** : reporter l'`id` sur le `<div>`. Il est du reste utile en propre,
  pour `aria-controls`.
- **À retenir** : avant de supprimer une balise `<b-*>`, relever **tous** ses
  attributs qui peuvent servir d'ancrage — `id`, `name`, `aria-*` —, pas
  seulement les `data-cy` et les classes. Un `grep` de l'`id` dans
  `test/e2e/` coûte dix secondes ; ce test-là en a coûté six minutes.

#### G-018 — `flex flex-col` sur un bloc de texte coupe chaque mot balisé en ligne

- **Contexte** : phase 2, reprise des deux `CreateOrUpdate` de Security. Les
  `<b-col>` deviennent des `<div>`, et j'ai repris par réflexe le
  `tw:flex tw:flex-col` qui servait à l'autre colonne.
- **Symptôme** : le pense-bête (« Your role consists of a `controllers`
  object… ») s'affiche en escalier — chaque `<code>` seul sur sa ligne, chaque
  morceau de phrase sur la sienne. Aucune spec ne le voit : le texte est bien
  là, c'est sa mise en forme qui est cassée.
- **Cause** : un conteneur `display: flex` transforme **chaque enfant**, nœud de
  texte compris, en élément de flex. `flex-direction: column` les empile donc un
  par ligne, et le texte cesse de couler autour de ses `<code>`. `b-col` était
  un simple bloc, il n'avait pas ce comportement.
- **Solution** : ne pas mettre de `flex` sur un conteneur dont le contenu est de
  la prose. Le `flex` va sur la *rangée* qui porte les deux colonnes, pas sur
  les colonnes elles-mêmes.
- **À retenir** : `d-flex flex-column` de Bootstrap avait le même effet — mais
  l'ancien code ne le posait pas là. Traduire une classe pour la traduire est le
  bon moyen d'en introduire une qui n'existait pas.

#### G-019 — Deux familles de modales à 1050 : c'est le DOM qui tranche, pas l'intention

- **Contexte** : phase 2, reprise des sept modales de Data. `Dialog` était à
  `z-index: 1050`, la même valeur que `.modal` de Bootstrap.
- **Symptôme** : `login.spec.js`, « login without losing context when token
  expires ». Le jeton expire pendant une création d'index, la modale
  « Sorry, your session has expired » s'ouvre *et est visible* — `cy.contains`
  la trouve — mais son bouton « Login as anonymous » est **recouvert** par
  l'alerte d'erreur du `Dialog` resté ouvert derrière. Trois minutes quarante de
  `cy.click()` qui réessaie, puis l'échec.
- **Cause** : à `z-index` égal, c'est l'ordre dans le document qui décide. Or
  `Dialog` déplace son nœud en fin de `<body>` à l'ouverture (G-012) et
  `b-modal` fait de même — mais le `Dialog` était déjà ouvert, donc déplacé en
  dernier. Le `Dialog` gagnait donc **toujours**, y compris contre la modale qui
  doit interrompre tout le reste.
- **Solution** : `Dialog` passe à `z-index: 1030`, c'est-à-dire **sous** la bande
  modale de Bootstrap (`.modal-backdrop` 1040, `.modal` 1050) et au-dessus de
  tout ce que la console utilise par ailleurs (le maximum est 1003, dans
  `Materialize/Modal.vue`). Pendant la cohabitation, une `b-modal` ouverte
  par-dessus un `Dialog` gagne, ce qui est le comportement voulu : la seule
  modale capable de surgir sur n'importe quel écran est justement une `b-modal`.
  La valeur remonte quand bootstrap-vue s'en va.
- **Fausse piste** : relever le `z-index` de la seule modale « session expirée »
  via `modal-class`. Deux échecs successifs — d'abord parce qu'un `<style
  scoped>` ne s'applique plus à un nœud déplacé dans `<body>` (l'attribut de
  scope n'a plus d'ancêtre où s'accrocher), ensuite parce qu'à spécificité égale
  c'est l'ordre des feuilles dans le bundle qui tranche, et Bootstrap passe
  après. Corriger la primitive une fois vaut mieux que corriger chaque site
  d'appel qui la croise.
- **À retenir** : un composant qui se déplace dans `<body>` sort du raisonnement
  habituel sur les styles **et** sur l'empilement. Les deux se sont mordus ici.

#### G-020 — Vue 2 refuse de résoudre un composant nommé `Switch`

- **Contexte** : phase 2, primitive `Switch` ajoutée pour la bascule
  « Form view » des documents. Nommée `Switch` comme chez l'amont, importée et
  enregistrée normalement.
- **Symptôme** : rien. Pas d'avertissement, pas d'erreur, pas de composant — le
  DOM contient littéralement `<Switch data-cy="formView-switch">Form view</Switch>`,
  une balise inconnue que le navigateur affiche comme un `<span>` vide. Quatre
  tests de `formView.spec.js` échouent sur `[data-cy=FormField-age]` introuvable,
  c'est-à-dire trois écrans plus loin que la cause.
- **Cause** : dans `createElement`, un tag réservé gagne *avant* qu'on regarde
  les composants enregistrés, et Vue ne signale rien puisque de son point de vue
  le tag existe. Or les deux tables de tags réservés ne se comparent pas de la
  même façon (`platforms/web/util/element.ts`) :

  ```js
  const isHTMLTag = makeMap('…,input,label,table,dialog,…')        // sensible à la casse
  const isSVG     = makeMap('…,image,line,switch,symbol,text,…', true) // insensible
  ```

  `<Input>` et `<Label>` se résolvent donc très bien — `input` ≠ `Input`. Mais
  `isSVG` est construite avec `expectsLowerCase`, et `Switch`.toLowerCase() est
  dans la liste. **Seuls les noms de la liste SVG sont piégés.**
- **Solution** : l'export garde le nom de l'amont (`Switch`), les templates
  l'enregistrent sous `UiSwitch`. En phase 3 le tag redevient `<Switch>` : Vue 3
  résout les composants en respectant la casse, le problème disparaît avec Vue 2.
- **À retenir** : l'asymétrie entre les deux tables est le vrai piège, parce
  qu'elle rend l'échec imprévisible — quinze primitives passent, la seizième
  non. Les noms shadcn-vue encore à écrire qui tombent dans la liste SVG :
  `Image`, `Text`, `Switch`. Et le seul indice est le DOM : regarder ce qui a
  été rendu avant de suspecter la logique.

#### G-021 — Sans preflight, un `<button>` sans fond déclaré n'est pas transparent

- **Contexte** : phase 2, reprise de `Views/Column/`. Les boutons d'action d'une
  ligne (crayon, corbeille) sont en `variant="ghost"`, qui ne pose pas de fond.
- **Symptôme** : ils s'affichent sur un rectangle **gris clair**, comme s'ils
  étaient désactivés. Aucune spec ne le voit — elles cliquent le bouton, elles
  ne regardent pas sa couleur.
- **Cause** : le preflight de Tailwind n'est pas chargé (ADR-0008), et le reboot
  de Bootstrap ne remet pas non plus le fond des `<button>` à `transparent` —
  seule la classe `.btn` le fait, et nous ne l'utilisons plus. Le fond
  `buttonface` du navigateur reste donc visible partout où la variante n'en pose
  pas : `ghost` et `link`.
- **Solution** : `tw:bg-transparent` passe dans les classes **de base** de
  `Button`, pas dans les variantes concernées. Les variantes qui posent un fond
  gagnent, `tailwind-merge` les départage — et une variante future sans fond
  n'aura pas à y repenser.
- **Portée** : le défaut était en production depuis les reprises de Security.
  `RoleItem`, `UserItem` et `ProfileItem` affichaient les mêmes boutons gris
  depuis trois PR. Corrigé du même coup.
- **À retenir** : c'est le troisième effet du preflight absent après la bordure
  et le rayon. La règle pratique : une primitive ne peut **rien** supposer des
  styles par défaut, y compris « un bouton est transparent ». Et ce genre de
  défaut ne se voit qu'en regardant l'écran — les specs cliquent, elles ne
  regardent pas.

#### G-022 — Une colonne `sortable` peut ne rien trier, et rien ne le dit

- **Contexte** : phase 2, reprise de `Indexes/Page.vue` et de
  `Collections/CollectionList.vue` ([ADR-0011](adr/0011-table-sans-data-table.md)).
- **Symptôme** : la spec de tri écrite **avant** la réécriture, comme l'ADR
  l'engage, échoue sur la page Indexes — contre le code de production, pas
  contre la reprise. Les deux colonnes déclarées `sortable` y sont inertes :
  l'en-tête prend bien `aria-sort="ascending"` au clic, et l'ordre des lignes ne
  bouge pas d'un pouce.
- **Cause** : `b-table` trie sur `item[field.key]`. Les deux clés déclarées —
  `indexName` et `collectionCount` — ne correspondent à **aucune** propriété de
  la classe `Index`, qui porte `name` et le getter `collectionsCount`. Toutes
  les valeurs comparées valent donc `undefined`, et le tri est un `sort`
  stable sur rien. Rien ne le signale, parce que la colonne s'affiche quand
  même : un slot `#cell(indexName)` la rend explicitement. La déclaration
  indirecte sépare le nom qui **rend** du nom qui **trie**, et seul le premier
  est vérifié par l'œil.
- **Portée** : deux colonnes sur trois. Seul le `name` de `CollectionList`
  triait — sa clé tombe juste. Les deux autres ne fonctionnaient pas depuis
  qu'elles existent.
- **Solution** : dans le `v-for` explicite, la colonne triée est nommée par une
  **fonction** (`sorters: { collections: (index) => index.collectionsCount }`),
  pas par une clé à faire correspondre. Une faute de frappe devient une erreur
  de compilation ou un `undefined` visible, pas un tri silencieusement mort.
- **À retenir** : c'est le même défaut que le `#cell(count)` mort de
  `CollectionList` relevé dans ADR-0011, dans l'autre sens. Toute API qui
  associe deux déclarations par une **chaîne de caractères** peut se désaccorder
  sans bruit. Et une fonctionnalité sans spec n'est pas « à risque de casser » :
  elle peut être déjà cassée, et l'être depuis des années.

#### G-023 — L'attribut `autofocus` ne remplace pas la prop `autofocus` de bootstrap-vue

- **Contexte** : phase 2, reprise des deux listes de Data. Le champ de filtre
  passait de `<b-form-input autofocus>` à `<Input autofocus>`.
- **Symptôme** : `collections.spec.js`, « Should be able to autofocus collection
  search », échoue. La spec tape `f{enter}` sur le `body` en comptant sur le
  champ focalisé ; l'URL ne change pas. Rien d'autre ne régresse — c'est la
  seule spec qui exerce le focus initial.
- **Cause** : l'attribut HTML `autofocus` n'est honoré par le navigateur qu'au
  **chargement du document**. Un élément inséré plus tard par Vue, quand la
  liste arrive, ne le déclenche pas. `b-form-input` ne se reposait pas dessus :
  sa prop `autofocus` appelle `focus()` au montage, en JavaScript.
- **Solution** : `v-focus`, la directive maison qui existait déjà
  (`src/directives/focus.directive.ts`) et qui appelle `focus()` au `nextTick`.
- **À retenir** : une prop de `bootstrap-vue` qui porte le nom d'un attribut
  HTML n'est pas forcément cet attribut. Avant de la traduire en attribut natif,
  vérifier ce qu'elle fait — ici, l'écart tient à ce que le composant amont
  compensait une limite du navigateur.

#### G-024 — Une deuxième classe Bootstrap avait échappé à l'audit des sélecteurs

- **Contexte** : phase 2, reprise de `Collections/DropdownView.vue`
  ([ADR-0012](adr/0012-primitive-dropdown-menu-en-vue-2.md)).
- **Symptôme** : `chartView.spec.js`, « should not offer the chart view on a
  collection without any integer field », échoue sur
  `.should('have.class', 'disabled')`. L'élément de menu est bien désactivé à
  l'écran, et la classe n'existe plus.
- **Cause** : `disabled` est une classe de Bootstrap, posée par
  `b-dropdown-item` sur le `<a>` qu'il rend. Comme `.badge` avant elle, elle
  ressemblait trop à une classe applicative pour que l'audit du 2026-09-18 la
  reconnaisse.
- **Solution** : l'assertion porte sur `aria-disabled`, que la primitive pose.
  Pas de commande Cypress cette fois, contrairement à `cy.notificationBadge()` :
  ce sélecteur n'a qu'un seul site d'appel, et il est migré dans la même PR —
  il n'y a pas de cohabitation à couvrir.
- **À retenir** : c'est la deuxième escapée du même type, et probablement pas la
  dernière. Le point important n'est pas qu'elle ait échappé à l'audit, c'est
  que la spec l'ait attrapée — et qu'elle ait attrapé au passage un vrai
  changement de comportement : `b-dropdown-item` posait la classe **et laissait
  passer le clic**. Seul le fait que l'action derrière ne faisait rien évitait
  le dégât.

#### G-025 — Échapper les moustaches en entités HTML n'empêche pas l'interpolation

- **Contexte** : phase 2, reprise de `Documents/Page.vue`
  ([ADR-0013](adr/0013-primitive-pagination-en-vue-2.md)).
- **Symptôme** : sous le message « Due to limitations imposed by Elasticsearch,
  you won't be able to browse documents beyond 10000 », l'écran affiche un
  nombre nu, sans libellé. Dans le source, ce n'est pas une interpolation :
  c'est `&lcub;&lcub;totalDocuments&rcub;&rcub;`.
- **Cause** : `vue-template-compiler` **décode les entités HTML avant** de
  chercher les moustaches. Vérifié :

  ```js
  compile('<div>&lcub;&lcub;total&rcub;&rcub;</div>').render
  // with(this){return _c('div',[_v(_s(total))])}
  ```

  L'échappement produit donc exactement le même rendu que `{{ total }}`. Celui
  qui l'a écrit voulait vraisemblablement afficher les accolades littéralement,
  ou neutraliser un reste de mise au point ; il a obtenu l'interpolation, et
  personne ne l'a relu depuis [#938](https://github.com/kuzzleio/kuzzle-admin-console/pull/938)
  (janvier 2022) — la PR qui portait aussi le `describe.only` de `docs.spec.js`.
- **Solution** : supprimé. Le seuil est devenu une constante,
  `ES_RESULT_WINDOW_LIMIT`, partagée entre le `v-if` et le message — les deux
  disaient 10000 chacun de leur côté.
- **À retenir** : pour afficher des accolades littérales en Vue 2, il faut
  `v-pre` ou `{{ '{{' }}`, pas des entités. Et un nombre nu dans une interface
  est presque toujours un reste : la spec `Should handle collections with more
  than 10k documents` vérifiait que le message **existe**, jamais ce qu'il
  contient.

#### G-026 — Une troisième classe Bootstrap avait échappé à l'audit des sélecteurs

- **Contexte** : phase 2, reprise de `Documents/Page.vue`
  ([ADR-0013](adr/0013-primitive-pagination-en-vue-2.md)).
- **Symptôme** : quatre specs pilotent la pagination par
  `.page-link[aria-posinset="N"]` (`roles`, `profiles`, `users`) ou
  `[aria-posinset=N]` (`search`).
- **Cause** : `.page-link` est une classe Bootstrap, et `aria-posinset` un
  attribut que `b-pagination` pose lui-même sur chaque lien. Aucun des deux ne
  nous appartient. Troisième escapée du même type après `.badge` (G-024 en cite
  la première) et `.disabled`.
- **Solution** : commande `cy.paginationPage(parent, n)`, qui accepte
  `.page-link[aria-posinset]` **et**
  `[data-slot="pagination-link"][value]`. Contrairement à G-024, la
  cohabitation est nécessaire : les trois listes de Security restent sur
  `b-pagination` jusqu'à leur propre reprise.
- **À retenir** : l'audit du 2026-09-18 comptait les classes qu'il savait
  reconnaître. Les trois escapées ont le même profil — un nom court qui
  ressemble à une classe applicative. Il n'y a pas de raison de croire que la
  liste est close ; elles continueront de se déclarer à la reprise, une par une,
  et c'est le bon moment.

#### G-027 — `npm run <script> -- --fix` n'atteint que la dernière commande d'un `&&`

- **Contexte** : phase 2, en corrigeant le lint de ce lot.
- **Symptôme** : `npm run test:lint:fix` ne corrige rien dans `src`. Les mêmes
  avertissements `import/order` reviennent identiques à chaque exécution, alors
  qu'ils sont marqués « potentially fixable with the `--fix` option ».
- **Cause** : le script était
  `"test:lint:fix": "npm run test:lint -- --fix"`, et `test:lint` vaut
  `eslint src --ext .ts,.vue && eslint test/e2e/cypress --ext .js`. npm **colle
  les arguments à la fin de la chaîne entière**, pas à chaque commande : la
  ligne exécutée est donc

  ```sh
  eslint src --ext .ts,.vue && eslint test/e2e/cypress --ext .js --fix
  ```

  `--fix` n'a jamais porté que sur les specs. La commande annonçait l'inverse de
  ce qu'elle faisait.
- **Solution** : le drapeau est écrit sur chacune des deux commandes.
- **À retenir** : même famille que G-022 (une colonne `sortable` qui ne trie
  pas) et que le `disabled` de G-024 qui laissait passer le clic — une
  déclaration qui a l'air de faire quelque chose, et dont personne n'a vérifié
  l'effet. Ici le coût était invisible : chaque contributeur corrigeait le
  formatage à la main en croyant que l'outil ne pouvait pas.

#### G-028 — Reprendre un composant de `Common/` casse des specs d'un domaine qu'on n'a pas touché

- **Contexte** : phase 2, reprise de `PerPageSelector.vue` avec `Select`
  (ADR-0014). Le lot porte sur Data.
- **Symptôme** : `profiles.spec.js` et `users.spec.js` échouent sur
  `cy.select() can only be called on a <select>. Your subject is a: <button
  role="combobox">`. Aucun des deux ne concerne Data, et aucun fichier de
  Security n'a été touché par le lot.
- **Cause** : `PerPageSelector` est monté par cinq écrans de trois domaines, et
  **quatre specs** le pilotent — `roles`, `profiles`, `users`, `search`. La
  règle de contribution (« toute PR de migration doit passer les specs du
  domaine touché ») suppose qu'un composant appartient à un domaine ; celui-ci
  n'appartient à aucun. Le relevé initial n'en avait vu que deux parce que le
  `grep` avait été tronqué à l'affichage — deux appels sur quatre n'ont jamais
  été regardés.
- **Solution** : les quatre appels passent par `cy.selectOption()`. Suite
  complète relancée : 17/17.
- **À retenir** : pour tout composant de `Common/`, la liste des specs à passer
  se lit dans les specs, pas dans l'arborescence des composants —
  `grep -rn '<data-cy>' test/` sur le `data-cy` du composant, sans tronquer la
  sortie. Les trois composants de `Common/` qui gardent un `<b-form-select>`
  (`BasicFilter`, `UserProfileList`, `CreateEnvironment`) poseront exactement la
  même question à leur reprise : `BasicFilter` seul est piloté par 20 appels de
  `cy.select()`, tous dans `search.spec.js`.

### 5.2 Anticipés — à confirmer ou infirmer sur le terrain

Points de vigilance connus pour un passage Vue 2 → Vue 3, à valider contre ce
codebase précis. **Ce ne sont pas des faits constatés** : ils sont à déplacer en
5.1 une fois rencontrés, ou à supprimer s'ils ne se présentent jamais.

- **`v-model` sur composant** : `value`/`input` devient `modelValue`/
  `update:modelValue`. Touche toute la couche formulaires.
- **`.sync`** : supprimé au profit de `v-model:prop`. *Relevé le 2026-09-18 :
  aucune occurrence. Depuis, la phase 2 en introduit une par modale reprise
  (`:open.sync`), soit 14 au 2026-09-21* — c'est le prix assumé d'ADR-0010, qui
  remplace l'API impérative `$bvModal` par un état possédé par le site d'appel.
  La bascule vers `v-model:open` est mécanique et se fait en phase 3.
- **Filtres de template (`{{ x | y }}`)** : supprimés en Vue 3. Une seule
  occurrence détectée + `src/filters/highlight.filter.ts` à convertir en
  fonction ou composable.
- **`$listeners`** : fusionné dans `$attrs`.
- **Réactivité** : `Vue.set` / `this.$set` disparaissent (Proxy). À surveiller
  sur les mutations de tableaux et d'objets dynamiques dans les stores.
- **`new Vue()`** : `src/main.ts` passe à `createApp()`. Les `Vue.use()` et
  `Vue.component()` globaux deviennent `app.use()` / `app.component()`.
- **Directives personnalisées** : hooks renommés (`bind`→`beforeMount`,
  `inserted`→`mounted`, `update`/`componentUpdated`→`updated`,
  `unbind`→`unmounted`). Concerne `src/directives/`.
- **`$bvToast` / `$bvModal`** : API d'instance de bootstrap-vue. Disparaissent
  dès la phase 2 — le store `toaster.ts` doit devenir l'unique point d'entrée.
- **`functional: true`** et les composants fonctionnels par template : supprimés.
- **Fragments** : Vue 3 autorise plusieurs nœuds racine. Attention aux
  composants qui reçoivent des `class`/`style` héritées (`inheritAttrs`).

---

## 6. Journal des décisions

| Date | Décision | Ref |
|---|---|---|
| 2026-09-18 | Système de suivi : ADR + ce document + issues GitHub | [ADR-0001](adr/0001-systeme-de-suivi.md) |
| 2026-09-18 | Sortir de bootstrap-vue **avant** de migrer vers Vue 3 | [ADR-0002](adr/0002-sortir-de-bootstrap-vue-avant-vue-3.md) |
| 2026-09-18 | Design system : Tailwind CSS + shadcn-vue | [ADR-0003](adr/0003-design-system-tailwind-shadcn-vue.md) |
| 2026-09-18 | Cible Node 24 LTS, versions alignées partout | [ADR-0004](adr/0004-node-24-lts.md) |
| 2026-09-18 | Conserver les deux SDK `kuzzle-sdk` v6 et v7 | [ADR-0005](adr/0005-conserver-les-deux-sdk-kuzzle.md) |
| 2026-09-18 | Interdire `cy.wait(<durée fixe>)` : attentes sur assertion | [ADR-0006](adr/0006-attentes-sur-assertion-cypress.md) |
| 2026-09-18 | Le lot E s'assertionne aussi : plafond de patience, pas de sommeil | [ADR-0007](adr/0007-lot-e-assertion-plutot-que-sommeil.md) |
| 2026-09-19 | Cohabitation Tailwind / Bootstrap : pas de preflight, couche `legacy`, préfixe `tw:` | [ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md) |
| 2026-09-19 | Contrat des primitives UI en Vue 2 : API shadcn-vue, deux écarts nommés | [ADR-0009](adr/0009-contrat-des-primitives-ui.md) |
| 2026-09-19 | `Dialog` écrite à la main, et abandon de l'API impérative des modales | [ADR-0010](adr/0010-primitive-dialog-en-vue-2.md) |
| 2026-09-21 | `Table` est du balisage : pas de `DataTable`, tri et filtre dans les pages | [ADR-0011](adr/0011-table-sans-data-table.md) |
| 2026-09-21 | `DropdownMenu` à la main, panneau dans `<body>`, élément courant en bouton radio | [ADR-0012](adr/0012-primitive-dropdown-menu-en-vue-2.md) |
| 2026-09-21 | `Pagination` à la main en huit pièces, composition partagée dans `Common/` | [ADR-0013](adr/0013-primitive-pagination-en-vue-2.md) |
| 2026-09-21 | `Select` à la main en neuf pièces, panneau flottant extrait en mixin partagé | [ADR-0014](adr/0014-primitive-select-en-vue-2.md) |
| 2026-09-21 | Pas de primitive `Calendar` : types natifs `date` et `time` pour le seul champ date | [ADR-0015](adr/0015-pas-de-primitive-calendar.md) |
