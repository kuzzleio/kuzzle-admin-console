# Modernisation de l'Admin Console — tableau de bord

> **Ce document est vivant.** Il dit *où on en est*. Le *pourquoi* est dans
> [`adr/`](adr/), le *qui fait quoi* dans les issues GitHub.
>
> Mettre à jour ce fichier fait partie de la definition of done de **chaque** PR
> de migration. Un tableau de bord faux est pire que pas de tableau de bord.

**Dernière mise à jour** : 2026-09-18 · **Phase courante** : 0 — Toolchain

---

## 1. Où on en est

| Phase | Objet | Epic | Statut |
|---|---|---|---|
| **0** | Toolchain : Node 24 LTS, Vite, TS, ESLint, Cypress (en Vue 2) | [#1017](https://github.com/kuzzleio/kuzzle-admin-console/issues/1017) | 🟡 En cours |
| **1** | Fondations design : Tailwind + tokens + primitives UI | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | ⬜ À faire |
| **2** | Dé-bootstrapisation écran par écran + refonte UI/UX | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | ⬜ À faire |
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

#### État du filet de sécurité au 2026-09-18

| | Avant | Après |
|---|---:|---:|
| Tests actifs | 140 | **153** |
| Tests inactifs (`.only` + `it.skip`) | 20 | **0** |
| Sélecteurs fragiles (tests actifs) | 61 | **0** |
| Politique de retry | aucune | `runMode: 2` |
| ESLint sur `test/` | non | oui, bloquant |

Suite complète vérifiée contre un backend Kuzzle réel : **17/17 specs,
152 tests passants, 0 échec** (1 `pending` légitime, skip dynamique via
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


---

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
| `bootstrap-vue` 2.23.1 | aucune version Vue 3, **incompatible `@vue/compat`** | supprimé, remplacé par Tailwind + primitives locales | 2 | ⬜ |
| `bootstrap` 4.6.2 | supprimé avec le précédent | Tailwind | 2 | ⬜ |
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
| `Data/Collections/Watch.vue` | 38 | 496 | ⬜ |
| `Data/Documents/Views/Map.vue` | 24 | 429 | ⬜ |
| `Data/Documents/Views/Column/Column.vue` | 22 | 506 | ⬜ |
| `Data/Collections/CollectionList.vue` | 19 | 426 | ⬜ |
| `Data/Indexes/Page.vue` | 18 | 352 | ⬜ |
| `Data/Documents/Common/CreateOrUpdate.vue` | 18 | 247 | ⬜ |
| `Data/Documents/Page.vue` | 13 | 955 | ⬜ |
| `Data/Documents/FormInputs/DateTimeFormInput.vue` | 13 | 85 | ⬜ |
| `Data/Collections/CreateOrUpdate.vue` | 12 | 309 | ⬜ |
| `Data/Documents/DocumentListItem.vue` | 11 | 218 | ⬜ |
| `Data/Documents/Views/TimeSeries.vue` | 8 | 351 | ⬜ |
| `Data/Indexes/CreateIndexModal.vue` | 8 | 163 | ⬜ |
| `Data/Documents/ListActions.vue` | 7 | 68 | ⬜ |
| `Data/Collections/DropdownView.vue` | 7 | 110 | ⬜ |
| `Data/Indexes/BulkDeleteIndexesModal.vue` | 6 | 98 | ⬜ |
| `Data/Indexes/DeleteIndexModal.vue` | 6 | 87 | ⬜ |
| `Data/Collections/DeleteCollectionModal.vue` | 6 | 112 | ⬜ |
| `Data/Collections/BulkDeleteCollectionsModal.vue` | 6 | 108 | ⬜ |
| `Data/Collections/ModalClear.vue` | 5 | 95 | ⬜ |
| `Data/Documents/FormInputs/JsonFormInput.vue` | 5 | 49 | ⬜ |
| `Data/Collections/DropdownAction.vue` | 5 | 135 | ⬜ |
| `Data/Documents/DeleteModal.vue` | 4 | 52 | ⬜ |
| `Data/Data404.vue` | 4 | 30 | ⬜ |
| `Data/Documents/Views/List.vue` | 4 | 126 | ⬜ |
| `Data/Leftnav/Treeview.vue` | 3 | 97 | ⬜ |
| `Data/Documents/Views/Column/TableCell.vue` | 3 | 79 | ⬜ |
| `Data/Indexes/DropdownActions.vue` | 3 | 75 | ⬜ |
| `Data/Documents/NoResultsEmptyState.vue` | 3 | 20 | ⬜ |
| `Data/Documents/Update.vue` | 3 | 173 | ⬜ |
| `Data/Realtime/Notification.vue` | 3 | 147 | ⬜ |
| `Data/Leftnav/IndexBranch.vue` | 2 | 273 | ⬜ |
| `Data/Collections/Create.vue` | 1 | 72 | ⬜ |
| `Data/Documents/Views/Column/HeaderTableView.vue` | 1 | 56 | ⬜ |
| `Data/Documents/EmptyState.vue` | 1 | 39 | ⬜ |
| `Data/Documents/Views/Column/HighlightableRow.vue` | 1 | 30 | ⬜ |
| `Data/Documents/Common/NewDocumentsBadge.vue` | 1 | 27 | ⬜ |
| `Data/Layout.vue` | 1 | 253 | ⬜ |
| `Data/Documents/Create.vue` | 1 | 138 | ⬜ |
| `Data/Documents/NoGeopointFieldState.vue` | 1 | 12 | ⬜ |
| `Data/Collections/Update.vue` | 1 | 104 | ⬜ |
| `Data/Documents/RealtimeOnlyEmptyState.vue` | 0 | 45 | ⬜ |
| `Data/Documents/Views/TimeSeriesItem.vue` | 0 | 151 | ⬜ |
| `Data/Documents/DocumentBoxItem.vue` | 0 | 114 | ⬜ |
| `Data/Documents/ListViewButtons.vue` | 0 | 104 | ⬜ |
| `Data/Collections/Tabs.vue` | 0 | 102 | ⬜ |

### Security — 37 composants, 217 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Security/Users/List.vue` | 17 | 395 | ⬜ |
| `Security/Profiles/List.vue` | 17 | 335 | ⬜ |
| `Security/Roles/List.vue` | 16 | 306 | ⬜ |
| `Security/Layout.vue` | 13 | 98 | ⬜ |
| `Security/Roles/CreateOrUpdate.vue` | 13 | 275 | ⬜ |
| `Security/Users/EditCustomMapping.vue` | 13 | 176 | ⬜ |
| `Security/Profiles/CreateOrUpdate.vue` | 11 | 216 | ⬜ |
| `Security/Profiles/Filters.vue` | 10 | 155 | ⬜ |
| `Security/Roles/Filters.vue` | 10 | 115 | ⬜ |
| `Security/Users/CreateOrUpdate.vue` | 9 | 356 | ⬜ |
| `Security/Profiles/ProfileItem.vue` | 9 | 186 | ⬜ |
| `Security/Roles/RoleItem.vue` | 9 | 109 | ⬜ |
| `Security/Roles/Page.vue` | 8 | 167 | ⬜ |
| `Security/Users/Page.vue` | 8 | 120 | ⬜ |
| `Security/Users/Steps/UserProfileList.vue` | 8 | 118 | ⬜ |
| `Security/Users/Steps/CredentialsSelector.vue` | 8 | 112 | ⬜ |
| `Security/Users/Steps/Basic.vue` | 7 | 91 | ⬜ |
| `Security/Profiles/Page.vue` | 6 | 76 | ⬜ |
| `Security/Users/UserItem.vue` | 6 | 204 | ⬜ |
| `Security/Users/DeleteModal.vue` | 4 | 57 | ⬜ |
| `Security/Roles/DeleteModal.vue` | 4 | 57 | ⬜ |
| `Security/Profiles/DeleteModal.vue` | 4 | 57 | ⬜ |
| `Security/Users/Steps/CustomData.vue` | 3 | 80 | ⬜ |
| `Security/Profiles/Update.vue` | 2 | 120 | ⬜ |
| `Security/Profiles/Create.vue` | 1 | 71 | ⬜ |
| `Security/Common/Notice.vue` | 1 | 26 | ⬜ |
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
| `Common/Offline.vue` | 8 | 88 | ⬜ |
| `Common/Environments/ModalImport.vue` | 7 | 159 | ⬜ |
| `Common/Environments/SelectEnvironmentPage.vue` | 6 | 59 | ⬜ |
| `Common/Filters/Filters.vue` | 6 | 349 | ⬜ |
| `Common/Environments/EnvironmentsSwitch.vue` | 6 | 159 | ⬜ |
| `Common/Login/ResetPasswordForm.vue` | 6 | 145 | ⬜ |
| `Common/Environments/CreateEnvironmentPage.vue` | 6 | 104 | ⬜ |
| `Common/Filters/RawFilter.vue` | 5 | 147 | ⬜ |
| `Common/Environments/ModalDelete.vue` | 5 | 118 | ⬜ |
| `Common/ListNotAllowed.vue` | 4 | 22 | ⬜ |
| `Common/Environments/ModalCreateOrUpdate.vue` | 3 | 49 | ⬜ |
| `Common/MainSpinner.vue` | 2 | 16 | ⬜ |
| `Common/PerPageSelector.vue` | 1 | 35 | ⬜ |
| `Common/PageNotAllowed.vue` | 1 | 30 | ⬜ |
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
| `404.vue` | 6 | 35 | ⬜ |
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
| `ApiAction/SaveQueryModal.vue` | 3 | 70 | ⬜ |

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
| `Materialize/Dropdown.vue` | 0 | 69 | ⬜ |
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

### 5.2 Anticipés — à confirmer ou infirmer sur le terrain

Points de vigilance connus pour un passage Vue 2 → Vue 3, à valider contre ce
codebase précis. **Ce ne sont pas des faits constatés** : ils sont à déplacer en
5.1 une fois rencontrés, ou à supprimer s'ils ne se présentent jamais.

- **`v-model` sur composant** : `value`/`input` devient `modelValue`/
  `update:modelValue`. Touche toute la couche formulaires.
- **`.sync`** : supprimé au profit de `v-model:prop`. ✅ *Vérifié le 2026-09-18 :
  aucune occurrence dans `src/`.*
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
