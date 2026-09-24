# Modernisation de l'Admin Console — tableau de bord

> **Ce document est vivant.** Il dit *où on en est*. Le *pourquoi* est dans
> [`adr/`](adr/), le *qui fait quoi* dans les issues GitHub.
>
> Mettre à jour ce fichier fait partie de la definition of done de **chaque** PR
> de migration. Un tableau de bord faux est pire que pas de tableau de bord.

**Dernière mise à jour** : 2026-09-24 · **Phase courante** : 4 — nettoyage : retrait de `compat`
>
> **Branche du chantier** : `5-dev`, déployée sur console-v5.kuzzle.io
> ([ADR-0030](adr/0030-branche-5-dev-et-deploiement-console-v5.md)). `4-dev` est
> revenue à son état pré-migration et redéploie next-console.kuzzle.io en v4.

---

## 1. Où on en est

| Phase | Objet | Epic | Statut |
|---|---|---|---|
| **0** | Toolchain : Node 24 LTS, Vite, TS, ESLint, Cypress (en Vue 2) | [#1017](https://github.com/kuzzleio/kuzzle-admin-console/issues/1017) | 🟡 En cours |
| **1** | Fondations design : Tailwind + tokens + primitives UI | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | 🟡 En cours |
| **2** | Dé-bootstrapisation écran par écran + refonte UI/UX | [#1018](https://github.com/kuzzleio/kuzzle-admin-console/issues/1018) | ✅ **Bootstrap est sorti** ([ADR-0022](adr/0022-retrait-de-bootstrap-et-preflight.md)) |
| **3** | Bascule Vue 3 (+ `@vue/compat` temporaire), router, Pinia | [#1019](https://github.com/kuzzleio/kuzzle-admin-console/issues/1019) | ✅ **Close** : `MODE: 3` a remplacé la liste de drapeaux ([ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)) — 17/17 specs |
| **4** | Nettoyage : retrait de `compat`, vrai shadcn-vue, Composition API | [#1019](https://github.com/kuzzleio/kuzzle-admin-console/issues/1019) | 🟡 En cours — ouverte le 2026-09-24. Verrou : les 4 paquets Vue 2 encore en `MODE: 2` (§ 3.2) |

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
| `id` généré par `vue-form-generator` | 5 | `attributes.input` dans `formSchema.ts` → `data-cy="FormField-<champ>"`. L'ancrage a survécu au retrait de la bibliothèque : `DocumentForm` lit le même champ du schéma ([ADR-0025](adr/0025-reimplementer-vue-form-generator.md)) |
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
| `DropdownMenu` — panneau dans `<body>` ([ADR-0012](adr/0012-primitive-dropdown-menu-en-vue-2.md)) | ✅ |
| `Pagination` ([ADR-0013](adr/0013-primitive-pagination-en-vue-2.md)) et `Select` ([ADR-0014](adr/0014-primitive-select-en-vue-2.md)) | ✅ |
| `Tabs` — pilotée par valeur, panneau caché démonté ([ADR-0017](adr/0017-primitive-tabs-en-vue-2.md)) | ✅ |
| `TagsInput` — pour le seul champ à étiquettes ([ADR-0019](adr/0019-primitive-tags-input-en-vue-2.md)) | ✅ |
| `Resizable` — splitter maison, poignée au clavier ([ADR-0021](adr/0021-reprise-apiaction-splitter-et-onglets.md)) | ✅ |
| `Toast` — zone unique et store ([ADR-0020](adr/0020-systeme-de-toasts.md)) | ✅ |
| Dernière primitive interactive : `Combobox` (pour `vue-multiselect`) | ⬜ |

Les tokens reprennent la palette existante (`styles/_variables.scss`) : la
plomberie est posée, l'apparence n'est pas décidée. La refonte visuelle se fera
en changeant ces valeurs, à un seul endroit — c'est précisément ce qu'on achète.
Le jeu sombre est défini mais branché sur rien.

Trois réglages temporaires ont rendu la cohabitation tenable pendant la phase 2
(cf. [ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md)) : **pas de
preflight**, **legacy rangé dans une couche CSS**, et **utilitaires préfixées
`tw:`**. ADR-0008 annonçait qu'ils « se retirent mécaniquement avec Bootstrap » ;
c'était vrai pour un seul :

| Réglage | Sort avec Bootstrap ? |
|---|---|
| Pas de preflight | **Non — l'inverse.** Le retrait du *reboot* de Bootstrap *oblige* à charger le preflight dans le même changement, sinon la console retombe sur les styles par défaut du navigateur ([ADR-0022](adr/0022-retrait-de-bootstrap-et-preflight.md)) |
| Couche `legacy` | **Non**, mais dégraissée ([ADR-0024](adr/0024-degraisser-la-couche-legacy.md)) : 781 lignes de SCSS ramenées à 122, le reste est nommé. `vfg.css` en est sorti avec `vue-form-generator` ([ADR-0025](adr/0025-reimplementer-vue-form-generator.md)) ; restent les cinq feuilles nommées et FontAwesome |
| Préfixe `tw:` | **Non, et pas mécaniquement.** Retiré dans une PR à soi ([ADR-0023](adr/0023-retrait-du-prefixe-tw.md)) : le renommage a fait se rencontrer `tw:flex-grow` et le `.flex-grow` du legacy, collision qu'aucune ligne du diff ne montre (G-036) |

---

### 1.3 Dé-bootstrapisation — phase 2

**100 composants repris sur 107**, **813 balises `<b-*>` retirées sur 813 — il
n'en reste aucune.**

Les sept composants encore ⬜ n'ont jamais porté de balise `bootstrap-vue` : ce
sont des fichiers de logique ou de balisage ordinaire (`Breadcrumb`,
`JsonEditor`, `HighlightedSpan`, `Materialize/Headline`, `App.vue`…). Ils seront
repris avec la refonte visuelle, pas contre Bootstrap.

> Le dénominateur passe de 134 à 107 : 27 composants non atteignables ont été
> supprimés ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)). Ce
> n'est pas de l'avancement, c'est du travail qui n'avait pas lieu d'être
> compté.
>
> La formule de comptage des balises change aussi. `grep -rho "<b-[a-z-]*" src
> --include="*.vue" | wc -l` retourne `378`, mais **19 de ces occurrences sont
> des mentions en commentaire** dans les primitives (« Remplace
> `<b-pagination>` ») : elles ne sont pas du balisage. Le compte réel est
> `grep -rhn '<b-[a-z-]*' src --include='*.vue' | grep -vE '^[0-9]+:\s*(\*|//|/\*)'
> | grep -o '<b-[a-z-]*' | wc -l` = **0 restante**. Les trois occurrences que
> la commande brute retourne encore sont des mentions en commentaire, qui
> expliquent ce que chaque reprise a remplacé.

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

**Plus rien n'est bloqué dans Common par `vue-multiselect`.** Ce paragraphe
disait que `Autocomplete.vue` et `MSelect.vue` en dépendaient : c'était faux
pour le premier — `Autocomplete.vue` n'importe rien du tout, il est écrit à la
main — et sans objet pour le second, supprimé avec le code mort (ADR-0016).
`PerPageSelector.vue` a été débloqué par
[ADR-0014](adr/0014-primitive-select-en-vue-2.md). Le seul client restant de
`vue-multiselect` est `Data/Documents/Views/Column/Column.vue`, déjà repris.

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

**Data est entièrement dé-bootstrapisé** : `grep -rn "<b-" src/components/Data`
ne retourne plus rien. Le domaine le plus gros et le plus risqué — celui qu'on
avait mis en dernier pour cette raison — est passé.

Ce qui reste dans `Data/Layout.vue` n'est pas du `bootstrap-vue` mais
`vue-multipane`, abandonné, qui y tient le redimensionnement de la barre
latérale (§ 3.1). Il n'est pas traité ici parce qu'il n'appartient pas à Data :
`ApiAction.vue` et `ApiAction/QueryCard.vue` l'utilisent aussi. Le splitter est
une décision à prendre avec ApiAction, pas un reste de ce lot. La seule chose
qui demeure dans le `<style scoped>` du layout est la poignée que la
bibliothèque rend elle-même, sous sa propre classe : ses couleurs passent par
les tokens en attendant, et le bloc s'en ira avec elle.

`--sidebar-width` rejoint les tokens à cette occasion. La largeur minimale de la
barre latérale est une contrainte de mise en page, pas une décision visuelle,
mais elle n'a pas à être codée en dur dans un composant pour autant.

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

**Six composants avaient été supprimés plutôt que repris**, un par un, chacun
découvert au moment où on allait le migrer :

| Composant | Pourquoi |
|---|---|
| `Documents/ListViewButtons.vue` | importé nulle part (relevé le 2026-09-18, resté coché ⬜) |
| `Documents/ListActions.vue` | importé nulle part — `Views/List.vue` réécrit ses trois boutons en propre |
| `Collections/Tabs.vue` | importé nulle part, et lisait un store Vuex que la console n'a plus |
| `Documents/RealtimeOnlyEmptyState.vue` | importé nulle part — encore en balisage Materialize (`col s1 offset-s1`) |
| `Documents/DocumentBoxItem.vue` | importé nulle part — idem, et seul client de `Materialize/Dropdown.vue` |
| `Materialize/Dropdown.vue` | orphelin une fois le précédent parti |

Le recensement initial comptait des fichiers, pas des composants atteignables.
Le réflexe était acquis — on vérifie qu'un composant est atteint **avant** de le
reprendre — mais il se pratiquait au `grep`, un fichier à la fois.

**Les trois listes de Security passent sans primitive nouvelle**, comme le
formulaire de collection avant elles. `Card`, `Button`, `Spinner`, `Checkbox`,
`ListPagination` et `PerPageSelector` couvraient `<b-card>`, `<b-list-group>`,
`<b-pagination>` et le reste ; les `<b-row>` / `<b-col>` deviennent des
utilitaires. `Security/Layout.vue` et `Users/Page.vue` suivent dans le même lot
parce qu'ils encadrent ces listes.

Quatre points tranchés plutôt que transposés :

- **Les trois copies de l'état « aucun résultat » deviennent une**,
  `Security/Common/NoSearchResult.vue`. Elles étaient identiques au mot près —
  sauf le lien : Profiles pointait vers la documentation de **Kuzzle 1**, les
  deux autres vers le *cookbook* v2. C'est ce qu'une copie finit par faire.
- **`<b-list-group>` devient un vrai `<ul>`**, pas une pile de `<div>`. Une
  liste d'éléments est une liste ; le lecteur d'écran l'annonce et en donne le
  nombre.
- **La barre latérale de Security devient un `<nav>`** avec `aria-current` sur
  la section ouverte. `<b-nav vertical>` ne rendait qu'un `<ul>` en colonne :
  ni rôle de navigation, ni indication de la page courante autrement que par la
  graisse et l'opacité.
- **L'ombre portée de la barre latérale disparaît.** C'était une valeur de
  design en dur (`0 0 5px rgba(112,112,112,1)`) ; la barre passe au `bg-muted`
  des tokens, comme celle de Data.

Deux pièges y ont été rencontrés, tous deux invisibles pour les specs et
visibles à l'œil dès la première capture : G-030 (les puces d'un `<ul>` sans
preflight) et **G-031**, le plus coûteux — une primitive réutilisée d'une
branche `v-if` à l'autre garde les classes de la branche précédente.

**Les quatre écrans d'authentification** — connexion, inscription,
réinitialisation de mot de passe, et les deux formulaires qu'ils montent —
passent eux aussi **sans primitive nouvelle**. Trois points valent d'être notés :

- **`b-alert dismissible` posait sa propre croix ; `Alert` n'en rend pas.**
  Le bouton de fermeture est écrit au site d'appel, et il appelle
  `dismissError()`, une méthode qui existait déjà **sans être branchée à rien**.
- **`b-jumbotron` disparaît sans remplaçant** : c'était un bloc gris à gros
  titre, soit du balisage ordinaire et trois utilitaires.
- **Deux boutons de `Signup.vue` portaient le même `data-cy`**
  (`LoginAsAnonymous-Btn`) : « Go to Login Page » et « Login as Anonymous ».
  Un `cy.get()` visant cet écran aurait échoué sur « found 2 elements ». Les
  deux appels de `login.spec.js` visent celui de l'écran de connexion ; le
  premier bouton devient `Signup-goToLoginBtn`.

L'alerte « pas d'administrateur » passe de `variant="info"` à `warning` : la
primitive n'a pas d'`info`, et le message commence par « Warning! ».

**La barre de navigation, le sélecteur de connexion et la page d'erreur de
connexion** ferment l'ossature de l'application. `b-navbar` + `b-navbar-toggle`
+ `b-collapse` deviennent un `<nav>`, un bouton qui annonce `aria-expanded` et
un repli en `hidden`/`flex` sous le point de rupture `sm`.

- **Une connexion n'est plus un lien contenant des boutons.**
  `b-dropdown-item` empilait le nom, l'icône d'édition et celle de suppression
  dans un même `<a>` — des zones cliquables imbriquées dans un lien. L'élément
  de menu ne porte plus que le nom ; éditer et supprimer sont deux boutons à
  côté, avec un `aria-label` chacun.
- **`v-b-tooltip.hover` disparaît sans remplaçant** : la directive doublait
  l'attribut `title` que le navigateur affiche déjà.
- **`--navbar-height` rejoint les tokens.** `Home.vue` réservait 66 px à son
  menu et `MainMenu` les atteignait par la taille de son logo : deux valeurs
  qui devaient coïncider sans que rien ne le dise. Même traitement que
  `--sidebar-width`.
- **Un `<style>` non `scoped` posait `max-height: 98vh` sur *tous* les
  `.dropdown-menu` de la console**, depuis `EnvironmentsSwitch.vue`. La
  primitive porte désormais sa propre hauteur maximale ; les `b-dropdown`
  restants perdent une règle qui ne leur était pas destinée.

`Home.vue` n'est repris qu'à moitié : la modale de session expirée passe à
`Dialog`, le `<b-toast>` reste. Les toasts sont le prochain sujet structurant
— `$bvToast` est appelé depuis une trentaine de fichiers, et trois écrans
montent un `<b-toast>` déclaratif. C'est une ADR à écrire, pas une
transposition.

Le lot a coûté deux pièges. **G-032** : `Object.freeze` sur un composant passé
en prop `as` casse son rendu — le motif venait de Data et dormait depuis quatre
lots, dans cinq fichiers déjà sur `4-dev`. **G-033** : trois assertions
d'`environments.spec.js` lisaient la liste des connexions **sans ouvrir le
menu**, ce que `b-dropdown` permettait puisqu'il rendait ses éléments en
permanence. Le scénario est repris, pas le sélecteur.

**Les formulaires restants de Security et de Common** demandent la dernière
primitive à panneau : `Tabs` ([ADR-0017](adr/0017-primitive-tabs-en-vue-2.md)).
Elle est la moins chère des quatre écrites à la main, parce qu'elle ne flotte
pas — tout est dans le document. Deux choses qu'elle change :

- **un onglet est désigné par une valeur, pas par un rang.**
  `Users/CreateOrUpdate.vue` passait à `b-tabs` une prop `:object-tab-active`
  qui n'existe pas et écoutait un `@tab-changed` qu'il n'émet pas : son
  pilotage d'onglet ne faisait rien, et personne ne l'avait vu parce que
  l'onglet par défaut est le bon ;
- **le panneau caché est démonté** (`v-if`). Les champs de l'onglet « Custom »
  n'existent plus pendant qu'on remplit « Basic ».

Deux corrections de fond sont sorties de ce lot, toutes deux invisibles en
lecture :

- **Un panneau flottant ouvert dans une modale passait derrière elle.**
  `CreateEnvironment` vit à deux endroits — une page et la modale de connexion.
  La clause de `z-index` d'ADR-0012 et d'ADR-0014 est amendée par
  [ADR-0018](adr/0018-panneaux-flottants-au-dessus-des-modales.md) : 1035 au
  lieu de 1020, au-dessus de `Dialog` et sous la bande modale de Bootstrap.
- **`SelectValue` n'affichait que la valeur brute tant que la liste n'avait pas
  été ouverte** (`2` au lieu de `v2.x`), les `SelectItem` s'enregistrant à leur
  montage. Le cas était prévu par la primitive : le libellé passe par son slot.
  C'est le premier champ de la console dont la valeur et le libellé diffèrent.

**Le panneau de filtres** est le plus gros morceau restant de `Common/` et le
plus regardé de la console : `search.spec.js` le pilote sur 22 tests, et
`users`, `roles` et `profiles` s'en servent aussi. Les six fichiers passent
d'un coup, sans primitive nouvelle — `Tabs` venait d'arriver.

Quatre choses y ont changé de nature :

- **Le bouton « Quick Search » ne faisait rien.** Il appelait `submitSearch`,
  une méthode qui n'existe nulle part. Personne ne s'en est aperçu parce que
  `submitOnType` vaut `true` par défaut et que la saisie déclenche déjà la
  recherche. Il appelle désormais le même chemin que la touche Entrée.
- **`b-form-input debounce="600"` n'a pas d'équivalent dans `Input`**, et c'est
  voulu : un champ ne décide pas du rythme auquel son hôte veut être prévenu.
  L'attente vit dans `QuickFilter`, nommée, où l'on sait qu'elle sert à ne pas
  lancer une recherche par frappe. `Entrée` la court-circuite.
- **Les deux modales de renommage passaient par `$bvModal.show()`**, l'API
  impérative qu'ADR-0010 abandonne. Elles ont un état local, et **toute**
  fermeture qui n'est pas « OK » restaure le nom — `b-modal` ne le faisait ni
  sur `Échap` ni au clic extérieur.
- **`b-nav card-header tabs` faisait passer une liste de liens pour des
  onglets.** Ce sont de vrais onglets, et `Tabs` les annonce comme tels.

Les deux `b-collapse` deviennent une grille `0fr` → `1fr`, comme l'arborescence
de Data, et les chevrons cliquables deviennent des boutons qui portent
`aria-expanded`.

Côté specs, dix-huit `cy.select()` passent à `cy.selectOption()`, une assertion
`have.value` devient `contain` (le déclencheur est un bouton, pas un `<select>`),
et **trois assertions lisaient des `<option>` d'une liste fermée** — G-033 pour
la troisième fois. Elles ouvrent la liste et lisent les `[role="option"]`.

**Security est entièrement dé-bootstrapisé** : `grep -rn "<b-" src/components/Security`
ne retourne plus que deux mentions en commentaire. Les deux derniers écrans
sont ses filtres, et ils ont demandé la cinquième et dernière primitive écrite
à la main, `TagsInput`
([ADR-0019](adr/0019-primitive-tags-input-en-vue-2.md)).

C'est la décision inverse d'ADR-0015, pour un composant qui n'a lui aussi qu'un
seul site d'appel — et c'est justifié par quatre écarts : le coût est d'un autre
ordre (cinq fichiers courts, aucun calcul de position), **le champ est couvert
par les specs**, il n'existe aucun équivalent natif, et l'hôte n'est pas
condamné.

Le filtre par rôle des profils, lui, n'a rien demandé : `b-dropdown-text`
enveloppait une case à cocher et son libellé dans un élément qui n'était ni un
bouton ni un élément de menu. `DropdownMenuCheckboxItem` existait depuis
ADR-0012 et annonce `aria-checked`.

**Les notifications** étaient le dernier sujet structurant avant `ApiAction` :
`$bvToast` était appelée **48 fois dans 28 fichiers**, et quatre `<b-toast>`
déclaratifs vivaient dans trois écrans.
[ADR-0020](adr/0020-systeme-de-toasts.md) pose un store, une zone unique montée
dans `App.vue`, et **conserve une API impérative** — `this.$toast.danger(titre,
message)`. C'est la seule dérogation à ADR-0010, et elle est assumée : un toast
est déclenché par un événement, pas rendu par un état.

Trois choses que la lecture des 48 appels a apprises :

- **`discarded-toast` (« Request Discarded ») n'était affiché par personne.**
  Supprimé — c'est le quatrième composant dans ce cas depuis le début de la
  phase.
- **`no-admin-warning` ne s'affiche pas non plus**, et **pas à cause de la
  reprise** : mesuré dans le DOM avant et après, sur le même scénario, il est
  absent des deux côtés. Son état dépend d'`adminAlreadyExists` ; c'est un sujet
  produit, pas un sujet de migration.
- **La règle de persistance était répétée à chaque site d'appel** — trois
  options (`noAutoHide`, `dismissible`, `appendToast`) recopiées 35 fois. Elle
  vit maintenant dans le store : une erreur reste, le reste disparaît au bout de
  cinq secondes. Neuf toasts `danger` s'effaçaient tout seuls ; ils restent
  désormais, ce qui est le sens utile.

`useToasterStore` existait déjà — une coquille héritée de Materialize
(`text`, `duration`, `cssClass`, `cb`) dont les seuls clients étaient les
fichiers morts d'ADR-0016. **Le contrôle d'atteignabilité ne l'avait pas vue** :
il regarde les modules, pas les exports (§ 5.1, G-035).

Un défaut de conception a été rattrapé par la capture d'écran : les deux
bandeaux persistants rendaient chacun leur zone fixe, au même coin que celle des
notifications. Ils sont devenus des toasts du store, avec leurs boutons portés
par une liste d'`actions`.

**`ApiAction` ferme la phase**, et il était le seul écran encore bloqué sur une
décision : `vue-multipane`, abandonné, tenait le redimensionnement à trois
endroits. [ADR-0021](adr/0021-reprise-apiaction-splitter-et-onglets.md) écrit le
splitter à la main — `ResizablePanelGroup` / `ResizablePanel` /
`ResizableHandle` — et **retire la dépendance**.

Ce que `vue-multipane` faisait vraiment, une fois lu : écouter un `mousedown`,
suivre la souris, et **écrire `width` sur le nœud DOM qui précède la poignée**.
D'où deux choses que la primitive change :

- **le groupe émet la taille, il n'écrit pas dans le DOM.** Un composant qui
  modifie un nœud qu'il ne rend pas est un composant dont on ne peut pas prévoir
  l'effet ;
- **la poignée est un `<button role="separator">`**, déplaçable aux flèches.
  Celle de `vue-multipane` était un `<div>` : le redimensionnement n'existait pas
  au clavier. Au passage, le `<style scoped>` de 30 lignes qui l'habillait
  disparaît — la poignée est notre nœud, elle prend des utilitaires.

**La conséquence négative annoncée par ADR-0017 s'est produite**, et c'est la
spec qui l'a vue : `b-tabs` gardait ses panneaux montés, la primitive les
démonte, et l'éditeur d'ApiAction perdait une saisie **invalide** — `QueryCard`
ne remonte au parent que les JSON valides. `TabsContent` reçoit donc
`force-mount`, l'échappatoire de l'amont, utilisée à un seul endroit et
justifiée au site d'appel. Remonter le texte brut aurait changé le contrat entre
`QueryCard` et `ApiAction`, donc le format des requêtes sauvegardées : c'est une
décision produit, pas un correctif de migration.

#### Bootstrap est sorti — ✅ ADR-0022

`grep -rn "<b-" src` ne retourne plus que des commentaires, `$bvToast` et
`$bvModal` n'ont plus un seul appel : les deux paquets sont retirés de
`package.json`, de `main.ts`, de `style.scss` et du découpage de bundle.
**Le bundle perd 1 042 ko** (244 ko gzip) et une feuille CSS entière.

Le geste n'est pas celui qui était prévu. Retirer `bootstrap.scss` retire aussi
son *reboot* — la police de base, les liens sans soulignement, les tailles de
titres. La première capture d'écran a montré une console **en Times New Roman,
tous liens soulignés**. Le preflight de Tailwind est donc chargé dans le même
changement : ce n'est pas deux étapes, c'est une.

Sa contrepartie connue est arrivée avec : `h1`–`h6` reviennent à la taille du
texte courant. Les primitives portaient déjà la leur (`CardTitle`,
`DialogTitle`) ; les neuf titres bruts restants ont reçu la leur. C'est le bon
prix : une taille de titre est une décision de design, pas un défaut de
navigateur.

**La phase 3 est débloquée** — c'était la condition posée par ADR-0002.

#### Le code non atteignable, cherché une bonne fois — ✅ ADR-0016

Le `grep` répond à la mauvaise question : il dit « ce nom est écrit quelque
part », pas « ce fichier est dans le bundle ». La fermeture transitive depuis
`main.ts` et `App.vue`, elle, y répond — et elle a trouvé **27 composants et 3
modules** que rien n'atteint, soit **3 328 lignes**. Le calcul est désormais un
script, `npm run check:unreachable`, bloquant dans l'action composite `lint`
([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)).

| Famille | Composants supprimés |
|---|---|
| `Security/` (11) | `Common/List.vue`, `Common/JsonWithMapping.vue`, `Common/Filters/{BasicFilter,QuickFilter,RawFilter}.vue`, `Roles/CrudlDocument.vue`, `Roles/Filters/BasicFilter.vue`, `Profiles/CrudlDocument.vue`, `Profiles/RoleChips.vue`, `Users/Steps/{Mapping,StepsContent}.vue` |
| `Common/` (6) | `CommonList.vue`, `CrudlDocument.vue`, `MSelect.vue`, `Stepper.vue`, `MappingForm/{Form,FormLine}.vue` |
| `Materialize/` (5) | `Modal.vue`, `Pagination.vue`, `Tab.vue`, `Tabs.vue`, `Toaster.vue` |
| `Error/` (4) | `Layout.vue`, `Connecting.vue`, `KuzzleDisconnected.vue`, `KuzzleDisconnectedPage.vue` |
| `Data/` (1) | `Documents/NoResultsEmptyState.vue` |

Et 3 modules hors composants : `routes/children/errors.ts` (jamais importé par
`routes/index.ts` — c'est ce qui rendait les quatre fichiers `Error/` morts),
`filters/highlight.filter.ts` et `services/userCookies.ts`.

Trois constats valent d'être retenus :

- **`Security/Common/List.vue` importait `./CrudlDocument.vue`, supprimé en
  juin 2017.** Un import cassé depuis neuf ans, que le build n'a jamais
  signalé — Vite ne résout que ce qu'on lui demande. Le fichier avait pourtant
  été passé à Pinia en octobre 2024 et relinté en septembre 2024.
- **La page « Kuzzle disconnected » existe, et n'a pas d'URL.** Le chemin vivant
  est `ConnectionAwareContainer` → `Common/Offline.vue` +
  `Error/KuzzleErrorPage.vue`. Deux réponses au même besoin, dont une seule
  s'affiche.
- **Les cinq derniers fichiers `Materialize/` partent**, sauf `Headline.vue`.
  Le framework qui précédait Bootstrap n'a plus qu'un composant dans la console.
- **`Documents/NoResultsEmptyState.vue` a été repris pour rien** au lot #1048 :
  `git grep NoResultsEmptyState` sur le commit précédent ne retourne que le
  fichier lui-même. C'est le coût réel du contrôle manquant, payé une fois —
  un composant lu, réécrit, relu en revue, et jamais affiché.

Effets de bord : `velocity-animate` n'avait plus de site d'appel une fois
`Stepper.vue` parti (§ 3.3), et `vue-multiselect` n'est plus utilisé que par
`Views/Column/Column.vue` (§ 3.1).

### 1.4 Drapeaux de compat — phase 3

`MODE: 2` est posé dans `vite.config.ts` : l'application démarre en
comportement Vue 2, et chaque drapeau s'éteint dans son propre lot, dans
`src/main.ts`. **Ce qui est encore allumé est la dette restante de la phase 3** ;
la phase 4 s'ouvre quand `MODE: 3` peut remplacer la liste.

| Drapeau | Geste | Volume | Ref | Statut |
|---|---|---:|---|---|
| `INSTANCE_LISTENERS` | retrait de `v-on="$listeners"`, `emits` déclaré | 62 + 22 composants | [ADR-0029](adr/0029-declarer-emits-sur-les-evenements-du-dom.md), [G-049](#g-049) | ✅ |
| `OPTIONS_BEFORE_DESTROY`, `OPTIONS_DESTROYED` | `beforeDestroy` → `beforeUnmount`, `destroyed` → `unmounted` | 21 fichiers | [G-050](#g-050) | ✅ |
| `GLOBAL_PROTOTYPE` | `Vue.prototype.$x` → `app.config.globalProperties` | 2 sites + 2 shims | [G-051](#g-051) | ✅ |
| `INSTANCE_SET` | `this.$set` → affectation directe | 8 sites | — | ✅ |
| `COMPILER_V_BIND_SYNC` | `.sync` → `v-model:` | 22 occurrences, 11 fichiers | [G-052](#g-052) | ✅ |
| `COMPONENT_V_MODEL` | retrait de l'option `model` de Vue 2 | 13 composants | [G-012](#g-012), [G-053](#g-053) | ✅ |

`COMPILER_V_BIND_SYNC` et `COMPONENT_V_MODEL` se croisent sur les mêmes
composants — `Dialog`, `Pagination`, `DropdownMenu` portent les deux — mais ils
se sont éteints **séparément**, et c'est ce qui a rendu le lot tenable : le site
d'appel (`:open.sync` → `v-model:open`) et la déclaration (l'option `model` de
Vue 2) sont deux contrats distincts. Convertir les appels ne touche pas la
déclaration, parce que `v-model:prop` compile vers exactement ce que `.sync`
compilait : une prop et un `update:<prop>`.

`COMPONENT_V_MODEL` s'est éteint ensuite : **13** composants portaient
l'option, pas 14 — la 14ᵉ correspondance était une prop nommée `model` dans
`DocumentForm.vue`, faux positif du recensement initial. Aucun `v-model` nu ne
visait les cinq composants non conformes ; le lot précédent les avait tous
passés à `v-model:open` ou `v-model:page`. Le vrai périmètre était ailleurs, sur
**trois bibliothèques tierces** que le drapeau atteint sans qu'on puisse les
corriger ([G-053](#g-053)).

**La liste est donc soldée.** Deux régressions antérieures de la bascule,
restées invisibles faute de couverture, ont été mises au jour en écrivant les
tests de ce lot : [G-054](#g-054), corrigée, et [G-055](#g-055), qui n'a pas de
correctif au site d'appel et conditionne le remplacement de `vue-color`.

#### `MODE: 3` a remplacé la liste — la phase 3 est close

Le 2026-09-24, `MODE: 3` est posé aux deux endroits qui décident du mode — le
compilateur de template dans `vite.config.ts`, le runtime dans `src/main.ts` —
et la liste ci-dessus disparaît de `configureCompat`
([ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)).

**La liste ne disait pas ce qu'on croyait.** Six drapeaux à `false` décrivaient
ce dont le chantier s'était explicitement passé ; les quelque quarante autres
restaient allumés par défaut, sans avoir jamais été regardés. `MODE: 3` inverse
la charge de la preuve, et il a trouvé : un `<template>` nu dans `App.vue`,
qu'aucun lot n'avait de raison de croiser, rendait **toute l'application
invisible** ([G-056](#g-056)). C'est le seul de nos fichiers qui est tombé.

Ce qui reste en `MODE: 2` n'est plus à nous : quatre bibliothèques écrites pour
Vue 2 (§ 3.2). Elles y restent par une fonction `MODE` évaluée par composant,
qui teste le marqueur `_compiled` de `vue-loader` — ce qui couvre les
sous-composants internes de `vue-color`, qu'aucun site d'appel n'atteint. Les
deux paquets dont le `render` est écrit à la main échappent au marqueur et sont
épinglés à leur site d'appel ([G-057](#g-057)).

**La phase 4 s'ouvre, et son verrou est nommé : ces quatre paquets.**

Trois dettes sont tombées avec le passage, toutes sur des drapeaux qu'aucun lot
n'avait nommés, et **aucune n'a laissé d'erreur** — une page blanche
([G-056](#g-056)), un filtre qui n'agit pas ([G-058](#g-058)), un champ qui
reste vide ([G-059](#g-059)). C'est l'argument qui compte contre l'idée qu'une
liste soldée valait `MODE: 3`.

### 1.5 Bibliothèques Vue 2 — phase 4

L'objet de la phase 4 est le **retrait de `@vue/compat`**, et son verrou tient en
quatre paquets : ce sont exactement ceux que
[ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md) laisse en
`MODE: 2`. Tant qu'il en reste un, `configureCompat` reste dans `main.ts`.

| Paquet | Site d'appel | Cible | Reste en `MODE: 2` par | Statut |
|---|---|---|---|---|
| ~~`vue-apexcharts` 1.6.2~~ | `Views/TimeSeries.vue` | `vue3-apexcharts` 1.7.0 ([ADR-0032](adr/0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md)) | ~~épinglage manuel~~ | ✅ |
| `vuedraggable` 2.24.3 | `Views/Column/Column.vue` | `vue-draggable-plus` — `vuedraggable@4` n'est pas publié | épinglage manuel ([G-057](#g-057)) | ⬜ |
| `vue-multiselect` 2.1.7 | `Views/Column/Column.vue` | `vue-multiselect` 3.x, ou un Combobox shadcn-vue | heuristique `_compiled` | ⬜ |
| `vue-color` 2.8.1 | `Views/TimeSeriesItem.vue` | aucune 3.x — remplacement à décider, ADR à lui seul | heuristique `_compiled` | ⛔ [G-055](#g-055) |

L'ordre est celui du coût croissant, un lot par paquet, chacun validé contre un
build avant le suivant. `vue-color` ferme la marche : c'est le seul des quatre
qui porte une régression ouverte ([G-055](#g-055)), et le seul qui n'ait pas de
successeur direct.

Le dernier lot de la phase retire `@vue/compat`, la fonction `MODE` de
`main.ts` et le `compatConfig` de `vite.config.ts` — il ne peut pas commencer
avant que les trois lignes ci-dessus soient barrées.

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
| ~~`bootstrap-vue` 2.23.1~~ | aucune version Vue 3, **incompatible `@vue/compat`** | **Retiré** ([ADR-0022](adr/0022-retrait-de-bootstrap-et-preflight.md)) | 2 | ✅ |
| ~~`bootstrap` 4.6.2~~ | supprimé avec le précédent | **Retiré** — le preflight de Tailwind prend le relais du *reboot* | 2 | ✅ |
| ~~`vue-form-generator` 2.3.4~~ | **abandonné**, aucun successeur | **Retiré** — `DocumentForm.vue`, ~110 lignes ([ADR-0025](adr/0025-reimplementer-vue-form-generator.md)) | 2 | ✅ |
| ~~`vue-multipane` 0.9.5~~ | **abandonné** | **Retiré** — splitter écrit à la main ([ADR-0021](adr/0021-reprise-apiaction-splitter-et-onglets.md)) | 2 | ✅ |
| ~~`vuejs-logger` 1.5.5~~ | Vue 2 uniquement | **Retiré** — wrapper maison, ~40 lignes ([ADR-0026](adr/0026-wrapper-de-log-maison.md)) | 2 | ✅ |

**Toutes les lignes sont barrées.** Plus aucune dépendance de la console n'est
sans chemin de migration vers Vue 3 : ce qui reste à faire est le passage de Vue
lui-même (§ 3.2).

> Les quatre paquets écrits pour Vue 2 qui subsistent en § 3.2 ne sont pas
> bloquants au sens de cette section — ils ont tous un successeur. Ils sont le
> **verrou du retrait de `@vue/compat`** : ce sont exactement les composants
> laissés en `MODE: 2` par
> [ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md).

### 3.2 Migration directe disponible

| Paquet | Cible | Phase | Statut |
|---|---|---|---|
| ~~`vue` 2.7.16~~ | **3.5.43 + `@vue/compat`** | 3 | ✅ |
| ~~`vue-router` 3.6.5~~ | **4.6.4**, `createWebHashHistory` | 3 | ✅ |
| ~~`pinia` 2.2.4 + `PiniaVuePlugin`~~ | **3.0.4**, sans plugin. La 4.x exige TypeScript ≥ 5.6 (on est en 5.4) | 3 | ✅ |
| ~~`@vitejs/plugin-vue2`~~ | **`@vitejs/plugin-vue` 6.0.9** | 3 | ✅ |
| ~~`vue2-leaflet` 2.7.1~~ | **`@vue-leaflet/vue-leaflet` 0.10.1** | 3 | ✅ |
| `vuedraggable` 2.24.3 | `vuedraggable@next` ou `vue-draggable-plus` | 4 | ⬜ épinglé `MODE: 2` à son site d'appel ([G-057](#g-057)) |
| ~~`vue-apexcharts` 1.6.2~~ | **`vue3-apexcharts` 1.7.0** — `apexcharts` reste en 3.53.0 ([ADR-0032](adr/0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md)) | 4 | ✅ |
| `vue-multiselect` 2.1.7 | 3.x — ou supprimé au profit d'un Combobox shadcn-vue | 4 | 🟡 un seul site d'appel (`Views/Column/Column.vue`), laissé en `MODE: 2` par `_compiled` |
| `vue-color` 2.8.1 | 3.x — ou supprimé (usage marginal) | 4 | ⛔ laissé en `MODE: 2` par `_compiled` ; sa saisie textuelle reste cassée ([G-055](#g-055)) |
| ~~`@vue/test-utils` 1.3.6~~ | **Supprimé** — zéro usage, et il épinglait `vue@2.x` | 3 | ✅ |

### 3.3 Dette à évacuer au passage

| Paquet | Pourquoi | Statut |
|---|---|---|
| ~~`kuzzle-sdk` v6 **et** v7~~ | **Conservé** — c'est le support des backends Kuzzle v1, pas de la dette. Voir [ADR-0005](adr/0005-conserver-les-deux-sdk-kuzzle.md) | ➖ |
| `bluebird` | les Promises natives suffisent depuis Node 4 | ⬜ |
| `moment` | en maintenance depuis 2020 → `date-fns` ou `Temporal` | ⬜ |
| ~~`velocity-animate`~~ | **Retiré** — son seul client était `Common/Stepper.vue`, code mort (ADR-0016) | ✅ |
| `@fortawesome/fontawesome-free` | à réévaluer avec le nouveau design system | ⬜ |
| `json-formatter-js` | utilisé via une directive ; à réévaluer | ⬜ |
| `apexcharts` 3.53.0 | figé par `vue3-apexcharts` 1.7.0 ; la 5.x est la version courante ([ADR-0032](adr/0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md)) | ⬜ |

---

## 4. Inventaire des composants

140 composants, ~25 000 LOC, **813 balises `<b-*>`**, dont 135 fichiers en
Options API. Trié par volume de `<b-*>` : c'est le proxy le plus fiable de
l'effort de migration.

> **Les en-têtes de section ci-dessous sont le recensement initial du
> 2026-09-18** ; ils ne bougent pas, c'est la colonne « Statut » qui dit où on
> en est. 33 composants portent `➖ supprimé` : 6 découverts un par un, 27 par
> le contrôle d'atteignabilité ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)).
> Le périmètre réel de la phase 2 est donc de **107 composants**.

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
| `Data/Documents/NoResultsEmptyState.vue` | 3 | 20 | ➖ supprimé — repris pour rien en [#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048), il n'était déjà atteint par personne ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Data/Documents/Update.vue` | 3 | 173 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Realtime/Notification.vue` | 3 | 147 | ✅ reprise ([#1051](https://github.com/kuzzleio/kuzzle-admin-console/pull/1051)) |
| `Data/Leftnav/IndexBranch.vue` | 2 | 273 | ✅ reprise ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Data/Collections/Create.vue` | 1 | 72 | ✅ reprise ([#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054)) |
| `Data/Documents/Views/Column/HeaderTableView.vue` | 1 | 56 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Documents/EmptyState.vue` | 1 | 39 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Documents/Views/Column/HighlightableRow.vue` | 1 | 30 | ✅ reprise ([#1049](https://github.com/kuzzleio/kuzzle-admin-console/pull/1049)) |
| `Data/Documents/Common/NewDocumentsBadge.vue` | 1 | 27 | ✅ reprise ([#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)) |
| `Data/Layout.vue` | 1 | 253 | ✅ reprise ([#1058](https://github.com/kuzzleio/kuzzle-admin-console/pull/1058)) |
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
| `Security/Users/List.vue` | 17 | 395 | ✅ reprise ([#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)) |
| `Security/Profiles/List.vue` | 17 | 335 | ✅ reprise ([#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)) |
| `Security/Roles/List.vue` | 16 | 306 | ✅ reprise ([#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)) |
| `Security/Layout.vue` | 13 | 98 | ✅ reprise ([#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)) |
| `Security/Roles/CreateOrUpdate.vue` | 13 | 275 | ✅ reprise |
| `Security/Users/EditCustomMapping.vue` | 13 | 176 | ✅ reprise |
| `Security/Profiles/CreateOrUpdate.vue` | 11 | 216 | ✅ reprise |
| `Security/Profiles/Filters.vue` | 10 | 155 | ✅ reprise ([#1065](https://github.com/kuzzleio/kuzzle-admin-console/pull/1065)) |
| `Security/Roles/Filters.vue` | 10 | 115 | ✅ reprise ([#1065](https://github.com/kuzzleio/kuzzle-admin-console/pull/1065)) |
| `Security/Users/CreateOrUpdate.vue` | 9 | 356 | ✅ reprise ([#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)) |
| `Security/Profiles/ProfileItem.vue` | 9 | 186 | ✅ reprise |
| `Security/Roles/RoleItem.vue` | 9 | 109 | ✅ reprise |
| `Security/Roles/Page.vue` | 8 | 167 | ✅ reprise |
| `Security/Users/Page.vue` | 8 | 120 | ✅ reprise ([#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)) |
| `Security/Users/Steps/UserProfileList.vue` | 8 | 118 | ✅ reprise ([#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)) |
| `Security/Users/Steps/CredentialsSelector.vue` | 8 | 112 | ✅ reprise ([#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)) |
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
| `Security/Common/JsonWithMapping.vue` | 0 | 97 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Users/Steps/Mapping.vue` | 0 | 87 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Profiles/RoleChips.vue` | 0 | 83 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Common/Filters/RawFilter.vue` | 0 | 70 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Profiles/CrudlDocument.vue` | 0 | 257 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Roles/CrudlDocument.vue` | 0 | 244 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Common/List.vue` | 0 | 208 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Common/Filters/BasicFilter.vue` | 0 | 192 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Users/Steps/StepsContent.vue` | 0 | 168 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Roles/Filters/BasicFilter.vue` | 0 | 121 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Security/Common/Filters/QuickFilter.vue` | 0 | 112 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |

### Common — 33 composants, 184 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Common/Filters/BasicFilter.vue` | 40 | 469 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/Environments/CreateEnvironment.vue` | 17 | 380 | ✅ reprise ([#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)) |
| `Common/Filters/QuickFilter.vue` | 14 | 215 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/MainMenu.vue` | 14 | 200 | ✅ reprise ([#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062)) |
| `Common/Filters/FilterHistoryItem.vue` | 12 | 134 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/Filters/FavoriteFilterItem.vue` | 11 | 111 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/Login/Form.vue` | 9 | 208 | ✅ reprise ([#1061](https://github.com/kuzzleio/kuzzle-admin-console/pull/1061)) |
| `Common/Offline.vue` | 8 | 88 | ✅ reprise |
| `Common/Environments/ModalImport.vue` | 7 | 159 | ✅ reprise |
| `Common/Environments/SelectEnvironmentPage.vue` | 6 | 59 | ✅ reprise |
| `Common/Filters/Filters.vue` | 6 | 349 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/Environments/EnvironmentsSwitch.vue` | 6 | 159 | ✅ reprise ([#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062)) |
| `Common/Login/ResetPasswordForm.vue` | 6 | 145 | ✅ reprise ([#1061](https://github.com/kuzzleio/kuzzle-admin-console/pull/1061)) |
| `Common/Environments/CreateEnvironmentPage.vue` | 6 | 104 | ✅ reprise |
| `Common/Filters/RawFilter.vue` | 5 | 147 | ✅ reprise ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)) |
| `Common/Environments/ModalDelete.vue` | 5 | 118 | ✅ reprise |
| `Common/ListNotAllowed.vue` | 4 | 22 | ✅ reprise |
| `Common/Environments/ModalCreateOrUpdate.vue` | 3 | 49 | ✅ reprise |
| `Common/MainSpinner.vue` | 2 | 16 | ✅ reprise |
| `Common/PerPageSelector.vue` | 1 | 35 | ✅ reprise ([#1053](https://github.com/kuzzleio/kuzzle-admin-console/pull/1053)) |
| `Common/PageNotAllowed.vue` | 1 | 30 | ✅ reprise |
| `Common/Autocomplete.vue` | 1 | 166 | ✅ reprise ([#1068](https://github.com/kuzzleio/kuzzle-admin-console/pull/1068)) |
| `Common/Filters/HistoryFilter.vue` | 0 | 80 | ⬜ |
| `Common/Filters/FavoriteFilters.vue` | 0 | 65 | ⬜ |
| `Common/MSelect.vue` | 0 | 60 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/HighlightedSpan.vue` | 0 | 36 | ⬜ |
| `Common/CrudlDocument.vue` | 0 | 254 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/CommonList.vue` | 0 | 228 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/Breadcrumb.vue` | 0 | 161 | ⬜ |
| `Common/MappingForm/Form.vue` | 0 | 129 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/MappingForm/FormLine.vue` | 0 | 121 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/Stepper.vue` | 0 | 112 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Common/JsonEditor.vue` | 0 | 106 | ⬜ |

### Racine — 8 composants, 56 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Signup.vue` | 19 | 245 | ✅ reprise ([#1061](https://github.com/kuzzleio/kuzzle-admin-console/pull/1061)) |
| `ApiAction.vue` | 12 | 432 | ✅ reprise ([#1068](https://github.com/kuzzleio/kuzzle-admin-console/pull/1068)) |
| `404.vue` | 6 | 35 | ✅ reprise ([#1037](https://github.com/kuzzleio/kuzzle-admin-console/pull/1037)) |
| `Login.vue` | 6 | 110 | ✅ reprise ([#1061](https://github.com/kuzzleio/kuzzle-admin-console/pull/1061)) |
| `ResetPassword.vue` | 5 | 75 | ✅ reprise ([#1061](https://github.com/kuzzleio/kuzzle-admin-console/pull/1061)) |
| `TelemetryBanner.vue` | 4 | 60 | ✅ reprise ([#1066](https://github.com/kuzzleio/kuzzle-admin-console/pull/1066)) |
| `Home.vue` | 3 | 173 | ✅ reprise ([#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062) et [#1066](https://github.com/kuzzleio/kuzzle-admin-console/pull/1066)) |
| `ConnectionAwareContainer.vue` | 1 | 226 | ✅ reprise ([#1066](https://github.com/kuzzleio/kuzzle-admin-console/pull/1066)) |

### ApiAction — 4 composants, 49 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `ApiAction/QueryCard.vue` | 24 | 349 | ✅ reprise ([#1068](https://github.com/kuzzleio/kuzzle-admin-console/pull/1068)) |
| `ApiAction/QueryList.vue` | 14 | 128 | ✅ reprise ([#1068](https://github.com/kuzzleio/kuzzle-admin-console/pull/1068)) |
| `ApiAction/ResponseCard.vue` | 8 | 85 | ✅ reprise ([#1068](https://github.com/kuzzleio/kuzzle-admin-console/pull/1068)) |
| `ApiAction/SaveQueryModal.vue` | 3 | 70 | ✅ reprise |

### Error — 5 composants, 9 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Error/KuzzleErrorPage.vue` | 6 | 82 | ✅ reprise ([#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062)) |
| `Error/Layout.vue` | 3 | 20 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Error/KuzzleDisconnectedPage.vue` | 0 | 94 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Error/KuzzleDisconnected.vue` | 0 | 70 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Error/Connecting.vue` | 0 | 69 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |

### Materialize — 7 composants, 0 balises `<b-*>`

| Composant | `<b-*>` | LOC | Statut |
|---|---:|---:|---|
| `Materialize/Tabs.vue` | 0 | 87 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Materialize/Dropdown.vue` | 0 | 69 | ➖ supprimé — orphelin avec `DocumentBoxItem.vue` ([#1056](https://github.com/kuzzleio/kuzzle-admin-console/pull/1056)) |
| `Materialize/Tab.vue` | 0 | 53 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Materialize/Headline.vue` | 0 | 36 | ⬜ |
| `Materialize/Toaster.vue` | 0 | 22 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Materialize/Modal.vue` | 0 | 156 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |
| `Materialize/Pagination.vue` | 0 | 147 | ➖ supprimé — non atteignable ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)) |

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

#### G-037 — Une classe absente des templates peut être bien vivante

- **Contexte** : phase 2, dégraissage de la couche `legacy`
  ([ADR-0024](adr/0024-degraisser-la-couche-legacy.md)). 781 lignes de SCSS à
  trier, sans savoir laquelle style encore quelque chose.
- **Symptôme** : un audit qui croise les classes définies avec les attributs
  `class` des templates déclare mortes des règles parfaitement vivantes. Trois
  l'ont été à tort : `EnvColor--*` (la couleur de toutes les connexions),
  `.realtime-highlight.updated` et ses quatre sœurs (la surbrillance temps
  réel), `json-formatter-row`.
- **Cause** : trois façons de poser une classe qu'aucun grep sur `class=` ne
  voit —
  1. **construite à l'exécution** : `` :class="`EnvColor--${color}`" `` ;
  2. **posée en JavaScript** : `this.$el.classList.add(getBadgeText(n.action))`
     dans `DocumentListItem`, `HighlightableRow`, `TableCell` ;
  3. **rendue par une bibliothèque** : `ace_*`, `multiselect__*`,
     `json-formatter-row` — et ce sont justement les règles qu'on ne peut pas
     remplacer par un utilitaire, donc celles qui restent le plus longtemps.
- **Solution** : croiser les classes définies avec **toutes les chaînes du
  code**, pas seulement les attributs `class` ; écarter à la main ce qui vient
  d'une bibliothèque rendue au runtime ; puis exécuter les specs. Les trois
  étapes, dans cet ordre — la première seule donne un faux positif par famille.
- **À retenir** : symétrique de G-036. Là-bas, une règle présente dans la
  feuille ne prouvait pas qu'on l'utilise ; ici, une classe absente du code ne
  prouve pas qu'on ne l'utilise plus. **Le CSS mort ne se prouve pas par
  lecture.**
- **Ref** : [ADR-0024](adr/0024-degraisser-la-couche-legacy.md)

#### G-036 — Retirer un préfixe de classes fait apparaître une collision qu'aucun diff ne montre

- **Contexte** : phase 2, retrait du préfixe `tw:` ([ADR-0023](adr/0023-retrait-du-prefixe-tw.md)).
  Réécriture de 2 608 occurrences sur 169 fichiers, diff parfaitement
  symétrique : 903 lignes en +, 903 en −.
- **Symptôme** : aucun. Lint vert, types inchangés, diff illisible autrement
  que comme un renommage. Trois éléments (`Views/List.vue`, `Views/Map.vue` ×2)
  changent pourtant de comportement en flexbox.
- **Cause** : `tw:flex-grow` ne pouvait entrer en conflit avec rien. Renommée
  `flex-grow`, elle rencontre `.flex-grow { flex: 1 1 1px }`, héritage
  Bootstrap resté dans `_override.scss`. La couche `utilities` gagne — mais
  uniquement sur `flex-grow`, la propriété que la règle Tailwind mentionne.
  `flex-basis` reste celui du raccourci legacy : la base passe de `auto` à
  `1px`. **Le conflit n'est écrit dans aucun des 169 fichiers modifiés** — il
  naît de la rencontre entre un fichier modifié et un fichier qui ne l'est pas.
- **Solution** : utiliser `grow`, le nom canonique en Tailwind v4, qui n'a pas
  d'homonyme dans le legacy. `flex-grow` ne marchait que par alias, et c'est
  l'alias qui a créé la collision.
- **À retenir** : un renommage qui *supprime* un préfixe ne se vérifie pas en
  relisant le diff. Il se vérifie en comparant le CSS produit avant et après,
  préfixe normalisé : **un renommage réussi ne fait apparaître aucun sélecteur
  nouveau**. Les 19 qui sont apparus ici ont aussi montré que le scanner de
  Tailwind v4 prend `data-slot="table-container"` ou `variant="outline"` pour
  des candidats — inerte, mais une règle présente dans la feuille ne prouve
  plus que quelqu'un la porte.
- **Ref** : [ADR-0023](adr/0023-retrait-du-prefixe-tw.md)

#### G-035 — Le contrôle d'atteignabilité voit les modules, pas les exports

- **Contexte** : phase 2, reprise des notifications (ADR-0020).
- **Symptôme** : `useToasterStore` existait, avec un état `toast: {}` et un type
  hérité de Materialize. Personne ne l'appelait — ses seuls clients étaient les
  fichiers morts supprimés par ADR-0016 — mais `npm run check:unreachable` ne
  signalait rien.
- **Cause** : le contrôle calcule la fermeture transitive des **modules**.
  `stores/index.ts` fait `export * from './toaster'`, et il est atteint : le
  module l'est donc aussi, quand bien même **aucun de ses exports** n'est
  utilisé. Un baril d'exports (`index.ts` qui ré-exporte tout) rend n'importe
  quel module de son dossier atteignable pour toujours.
- **Solution** : aucune pour l'instant, et c'est une limite à connaître plutôt
  qu'un bug. La détecter demanderait d'analyser les identifiants importés, pas
  seulement les chemins — c'est-à-dire un vrai analyseur, là où cinquante lignes
  suffisent aujourd'hui (ADR-0016, point 4).
- **À retenir** : `check:unreachable` répond à « ce fichier est-il dans le
  bundle ? », pas à « ce code sert-il à quelque chose ? ». Derrière un baril,
  la deuxième question se pose encore à la main.
- **Ref** : [#1066](https://github.com/kuzzleio/kuzzle-admin-console/pull/1066)

#### G-034 — Un panneau flottant ouvert dans une modale passe derrière elle

- **Contexte** : phase 2, reprise de `CreateEnvironment.vue`. Son champ
  « Kuzzle version » devient un `Select` ; le composant est monté à deux
  endroits, une page et la modale de connexion d'`App.vue`.
- **Symptôme** : cinq tests d'`environments.spec.js` échouent sur
  `cy.click() failed because this element: <span
  data-slot="select-item-text">v2.x</span> is being covered by another element:
  <div class="tw:sm:w-1/3">`. Le message ne parle ni de `z-index` ni de modale,
  et l'élément « couvrant » est un bloc du formulaire lui-même. Le test qui
  ouvre le **même composant sur sa page** passe.
- **Cause** : le panneau est à `z-index: 1020`, `Dialog` à 1030. ADR-0012 avait
  posé cette valeur sur l'idée qu'« un menu ouvert derrière une modale ne doit
  pas passer devant » — mais le cas courant est le menu ouvert **depuis** une
  modale, et il était alors invisible et non cliquable.
- **Solution** : 1035, au-dessus de `Dialog` et sous la bande modale de
  Bootstrap ([ADR-0018](adr/0018-panneaux-flottants-au-dessus-des-modales.md)).
- **À retenir** : quand Cypress dit « couvert par un autre élément », l'élément
  nommé est celui du dessus à ce point de l'écran, pas la cause. Ici il
  appartenait à la modale — c'est ça, l'indice.
- **Ref** : [#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)

#### G-033 — Un menu `bootstrap-vue` garde ses éléments dans le DOM même fermé

- **Contexte** : phase 2, reprise d'`EnvironmentsSwitch.vue` avec la primitive
  `DropdownMenu`.
- **Symptôme** : deux tests d'`environments.spec.js` échouent sur
  `Expected to find element: [data-cy="EnvironmentSwitch-env_local"], but never
  found it` — après avoir créé la connexion, donc au moment précis où elle
  devrait apparaître. Les douze autres tests du fichier passent, y compris ceux
  qui lisent la même liste.
- **Cause** : `b-dropdown` rend son menu en permanence et se contente de le
  masquer ; la primitive (ADR-0012) ne monte son panneau **que lorsqu'il est
  ouvert**, et dans `<body>`. Les deux tests en échec lisaient la liste des
  connexions **sans ouvrir le menu** — ce que les douze autres faisaient.
- **Solution** : les trois assertions concernées ouvrent le menu d'abord, et
  passent de « existe » à `should('be.visible')`. L'intention du test ne change
  pas : la nouvelle connexion apparaît bien dans le sélecteur.
- **À retenir** : un test qui lit le contenu d'un menu fermé teste le DOM de
  `bootstrap-vue`, pas l'application. Même famille que G-024 et G-026, mais ce
  n'est pas un sélecteur qu'il faut reprendre ici : c'est le scénario.
- **Rencontré trois fois de plus** : au lot suivant sur une liste déroulante, et
  deux fois dans `search.spec.js`, qui lisait les `<option>` de la liste des
  attributs de tri **sans l'ouvrir** pour vérifier qu'un champ `text` n'y figure
  pas. Les assertions ouvrent maintenant la liste et lisent les
  `[role="option"]` ([#1064](https://github.com/kuzzleio/kuzzle-admin-console/pull/1064)).
- **Le détail du deuxième cas** :
  `cy.contains('v2.x')` trouvait une `<option>` que `b-form-select` rendait même
  fermée — sur un environnement **malformé**, c'est-à-dire justement dépourvu de
  version. L'assertion ne disait rien ; elle porte désormais sur l'état réel du
  champ, le placeholder « Select version »
  ([#1063](https://github.com/kuzzleio/kuzzle-admin-console/pull/1063)).
- **Ref** : [#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062)

#### G-032 — `Object.freeze` sur un composant passé en prop `as` casse son rendu

- **Contexte** : phase 2, reprise de `MainMenu.vue` et `EnvironmentsSwitch.vue`.
  `DropdownMenuTrigger` prend le composant lui-même en prop `as` (ADR-0012), il
  faut donc l'exposer au template. Le motif retenu depuis
  `Collections/DropdownAction.vue` était `Button: Object.freeze(Button)` dans
  `data()`, pour éviter de rendre l'objet réactif.
- **Symptôme** : l'écran de connexion s'arrête net après « Connected to » —
  ni sélecteur de connexion, ni formulaire. Aucune erreur visible à l'écran,
  aucune spec en échec **avant** celle qui visait justement ces écrans. En
  console : `[Vue warn]: Error in render: "TypeError: Cannot add property
  _Ctor, object is not extensible"`, répété pour six composants.
- **Cause** : Vue 2 met en cache le constructeur d'un composant **sur son objet
  d'options**, dans `_Ctor`, la première fois qu'il le résout. Un objet gelé
  refuse cette écriture, le rendu lève, et Vue abandonne **tout le sous-arbre**
  sans rien afficher. Le gel est global : figer `Button` dans un composant le
  fige pour toute l'application.
- **Pourquoi ça ne s'était jamais vu** : le motif marchait par ordre de rendu.
  Dans Data, un `<Button>` ordinaire était rendu **avant** que le composant
  gelant ne s'initialise, si bien que `_Ctor` était déjà posé. Sur l'écran de
  connexion, `EnvironmentSwitch` gèle avant tout rendu de `Button` — et
  l'application tombe.
- **Solution** : `markRaw()`, que Vue 2.7 fournit. Il pose `__v_skip` et
  n'empêche aucune écriture. Les **huit** sites du motif sont repris, dont les
  cinq déjà sur `4-dev` : le bug y dormait.
- **À retenir** : ne jamais geler un objet que Vue doit instancier — composant,
  options, `defineComponent`. Pour sortir une valeur de la réactivité,
  `markRaw` ; `Object.freeze` n'est pas un substitut. Et un rendu qui s'arrête
  au milieu d'un écran, sans erreur affichée, se diagnostique dans la console
  du navigateur, pas dans le diff.
- **Ref** : [#1062](https://github.com/kuzzleio/kuzzle-admin-console/pull/1062)

#### G-030 — Sans preflight, un `<ul>` garde ses puces et son retrait

- **Contexte** : phase 2, reprise des trois listes de Security. `<b-list-group>`
  remplacé par un `<ul>` porteur d'utilitaires Tailwind.
- **Symptôme** : chaque ligne de la liste s'affiche précédée d'une puce noire,
  et la liste entière est décalée de 40 px vers la droite. Aucune spec ne le
  voit : les `data-cy` sont au bon endroit, le contenu est le bon.
- **Cause** : ADR-0008 désactive le preflight de Tailwind pour ne pas casser
  Bootstrap. Or c'est le preflight qui remet `list-style: none` et
  `padding: 0` sur `ul`. Sans lui, la feuille de style par défaut du navigateur
  s'applique — `list-style: disc` et `padding-inline-start: 40px`. Même famille
  que G-021 (`<button>` sans fond déclaré) : ce que le preflight normalisait,
  il faut le demander.
- **Solution** : `tw:list-none tw:pl-0` sur chaque `<ul>` rendu par nos soins.
- **À retenir** : la liste des éléments que le preflight normalise est la liste
  des surprises à venir. Les prochaines vraisemblables : `ol`, `blockquote`,
  `fieldset`, `table` — à vérifier au premier usage, pas après.
- **Ref** : [#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)

#### G-031 — Une primitive réutilisée d'une branche `v-if` à l'autre garde les classes de la précédente

- **Contexte** : phase 2, `Security/Roles/List.vue`. Le composant rend
  `<slot name="emptySet">` tant que la liste est vide, et sa propre `<Card>`
  dès que les documents arrivent.
- **Symptôme** : la liste s'affiche centrée et large de 400 px au milieu d'une
  carte qui en fait 1 070. Mesuré dans le navigateur, le `CardContent` porte
  `tw:flex tw:flex-col tw:items-center tw:text-center` — trois classes que ce
  fichier **n'écrit nulle part**. Elles viennent de l'état vide, défini dans
  `Roles/Page.vue`, qui n'est plus rendu.
- **Cause** : les deux branches occupent la même position dans la liste
  d'enfants, et rendent toutes deux une `Card`. Sans `key`, Vue réutilise
  l'instance plutôt que de la recréer, et la `class` statique de la branche
  précédente reste attachée. Le premier rendu passe toujours par l'état vide —
  `totalDocuments` vaut 0 avant la réponse du backend — donc **le cas se
  produit systématiquement**, jamais au premier coup d'œil sur le code.
- **Solution** : une `key` distincte sur la branche liste (`<Card key="list">`).
  Vérifié en mesurant `getComputedStyle` avant et après : `text-align` repasse
  de `center` à `left`, et l'élément de liste de 257 px à 1 018 px.
- **À retenir** : deux branches d'un `v-if` qui rendent **la même primitive**
  doivent porter des `key` distinctes. Le symptôme n'est pas une erreur, c'est
  une mise en page qui a l'air « presque bien » — et aucune spec ne le verra,
  puisque le DOM et les `data-cy` sont corrects. C'est le cas d'école du point 4
  de la procédure de reprise : le rendu se regarde.
- **Ref** : [#1060](https://github.com/kuzzleio/kuzzle-admin-console/pull/1060)

#### G-029 — `grep` dit qu'un composant est utilisé, alors que rien ne l'atteint

- **Contexte** : phase 2, avant le lot Security. Vérification de routine avant
  de reprendre `Security/Roles/List.vue` et ses voisins.
- **Symptôme** : `grep -rn "CrudlDocument" src` retourne six lignes, dont deux
  `import CrudlDocument from './CrudlDocument.vue'`. Le composant a l'air
  vivant. Il ne l'est pas : ces deux imports sont écrits dans deux **autres**
  répertoires et résolvent vers deux autres fichiers, eux-mêmes importés par
  personne.
- **Cause** : `grep` répond à « ce nom est écrit quelque part », pas à « ce
  fichier est dans le bundle ». Trois pièges se cumulent : l'import relatif qui
  résout ailleurs que là où on croit, l'importeur qui est lui-même mort, et le
  fichier de routes que `routes/index.ts` n'importe pas (c'est le cas des
  quatre composants `Error/`). Le build ne dit rien non plus : Vite ne résout
  que ce qu'on lui demande, si bien que `Security/Common/List.vue` a pu importer
  un fichier supprimé en **juin 2017** sans que rien n'échoue en neuf ans.
- **Solution** : `npm run check:unreachable`, la fermeture transitive depuis
  `main.ts` et `App.vue`. 27 composants et 3 modules supprimés, contrôle rendu
  bloquant dans l'action composite `lint`
  ([ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md)).
- **À retenir** : avant de reprendre un composant, la question n'est pas « qui
  le nomme ? » mais « quel chemin d'imports y mène depuis `main.ts` ? ». Un
  composant qui a été relinté et migré à Pinia récemment n'est pas pour autant
  vivant : les commits de balayage touchent les fichiers morts comme les autres.
- **Ref** : ADR-0016

#### G-038 — Une feuille CSS importée depuis du JavaScript n'entre dans aucune couche

- **Contexte** : phase 2, retrait de `vue-form-generator`
  ([ADR-0025](adr/0025-reimplementer-vue-form-generator.md)). `main.ts`
  contenait `import 'vue-form-generator/dist/vfg.css'`.
- **Symptôme** : aucun, et c'est le problème. [ADR-0008](adr/0008-cohabitation-tailwind-bootstrap.md)
  puis [ADR-0024](adr/0024-degraisser-la-couche-legacy.md) affirmaient toutes
  deux que `vfg.css` était rangé dans la couche `legacy` ; les commentaires en
  tête de `style.scss` et de `tailwind.css` le répétaient. C'était faux.
- **Cause** : `@layer` ne se pose que dans du CSS — par un bloc `@layer legacy {}`
  ou par `@import … layer(legacy)`. Un `import` **JavaScript** d'un fichier
  `.css` est résolu par le bundler et émis tel quel, hors de toute couche. Dans
  le CSS produit, `.vue-form-generator *` était à l'octet 87, avant le premier
  `@layer` du fichier (octet 19 560). Or **une règle sans couche bat toutes les
  règles en couche**, quelle que soit leur spécificité : la feuille censée
  perdre face aux utilitaires Tailwind gagnait contre elles.
- **Solution** : ici, le retrait de la bibliothèque a rendu la question sans
  objet. Pour une feuille tierce qu'on veut réellement ranger, c'est
  `@import '…' layer(legacy);` dans `tailwind.css` — là où `@tailwindcss/vite`
  résout l'import — comme pour FontAwesome. Ne pas la passer par `style.scss` :
  Sass hisse l'`@import` d'un `.css` hors du bloc `@layer` (G-013).
- **À retenir** : la couche d'une feuille se vérifie dans le **bundle produit**,
  pas dans la ligne qui l'importe. `@layer legacy, theme, base, …` n'annonce que
  l'ordre des couches ; il ne range rien, et il ne signale pas ce qui est resté
  dehors.
- **Ref** : [ADR-0025](adr/0025-reimplementer-vue-form-generator.md)

#### G-039 — Vue 3 résout la chaîne d'un `:is` comme un composant **avant** de la traiter comme une balise

- **Contexte** : phase 3, bascule sous `@vue/compat` ([ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)).
- **Symptôme** : l'application monte, puis `RangeError: Maximum call stack size
  exceeded`, **sans une seule frame applicative dans la pile** — que des frames
  internes de Vue, `mountComponent → patch → mountComponent`. La page reste
  blanche.
- **Cause** : `Button.vue` s'appelle `Button` et rendait
  `<component :is="as">` avec `as` valant `'button'`. `resolveDynamicComponent`
  passe par `resolveAsset`, qui compare le nom demandé au nom du composant
  courant (`runtime-core`, `selfName === capitalize(camelize(name))`) :
  `capitalize(camelize('button'))` vaut `Button`. Le bouton se résolvait
  lui-même, à l'infini. En Vue 2, la même ligne donnait la balise native.
- **Solution** : le cas natif est écrit en dur, `<button v-if="as === 'button'">`,
  et `<component :is>` ne sert plus qu'aux valeurs non natives.
- **À retenir** : c'est une classe de pièges, pas un cas isolé. Toute primitive
  dont le `name` est la forme capitalisée d'une balise qu'elle rend
  **dynamiquement** tombe dedans — `Input`, `Label`, `Select`, `Table`, `Form`
  sont toutes des primitives de la console. Seule `Button` était concernée,
  parce que c'est la seule dont le `name` coïncidait avec le défaut de son `as`.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-040 — Vue 3 mémorise le conteneur d'insertion : déplacer un nœud rendu lui coupe ses enfants

- **Contexte** : phase 3, panneaux flottants de `Select` et `DropdownMenu`
  (ADR-0012, ADR-0014).
- **Symptôme** : les panneaux s'ouvrent et sont visibles, mais **vides** : ni
  options de liste, ni entrées de menu. Quatre specs échouent sur
  `[role="option"]` ou `RoleSelect--anonymous` introuvables.
- **Cause** : le mixin `floatingPanel` sortait le panneau de l'arbre rendu par
  `document.body.appendChild()`, pour qu'il échappe au `overflow-x-auto` de
  `Table` (ADR-0011). En Vue 2, le patch visait l'élément lui-même et le
  déplacement passait inaperçu. Vue 3 mémorise le conteneur dans lequel il a
  inséré : les enfants du panneau continuaient d'être insérés dans **l'ancien
  parent**.
- **Solution** : `<Teleport to="body">`, dont le déplacement manuel était
  l'émulation. Le mixin ne fait plus que placer.
- **À retenir** : tout code qui déplace à la main un nœud rendu par Vue est à
  reprendre en phase 3, pas seulement celui-là. Le symptôme ne ressemble pas à
  la cause : un conteneur visible mais vide.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-041 — `RENDER_FUNCTION` casse les bibliothèques écrites **pour Vue 3**, et celles écrites pour Vue 2 en dépendent

- **Contexte** : phase 3, reprise de la vue carte.
- **Symptôme** : la carte se rend en nœud commentaire vide,
  `mapView-map` introuvable. Dans la console :
  `TypeError: Cannot read properties of undefined (reading 'style')`, levé
  depuis le `render()` de `@vue-leaflet/vue-leaflet`.
- **Cause** : le drapeau `RENDER_FUNCTION` du mode 2 réécrit la signature de
  tout `render()` en celle de Vue 2, où le premier argument est
  `createElement`. `@vue-leaflet` — adopté *parce qu'il est natif Vue 3* —
  expose un `render(ctx)` et recevait donc `h` à la place du contexte.
- **Solution tentée puis écartée** : l'éteindre globalement. Ça casse
  l'inverse — `vuedraggable` et `vue-multiselect` sont des bibliothèques Vue 2
  et **en dépendent** : la vue Colonne tombait, et `docs` passait de 2 à 8
  échecs.
- **Solution** : `compatConfig = { MODE: 3 }` posé sur les composants de
  `@vue-leaflet`, à leur point d'import, avec la raison écrite à côté.
- **À retenir** : **`MODE: 2` est un réglage par composant, pas par
  application.** Une base qui héberge des bibliothèques des deux mondes n'a
  aucune valeur globale correcte. Et un mode de compatibilité peut abîmer le
  code moderne autant qu'il protège l'ancien.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-042 — Deux écritures d'URL qui reconstruisent la query entière s'écrasent, parce que la navigation est asynchrone

- **Contexte** : phase 3, `vue-router` 4.
- **Symptôme** : le filtre de recherche disparaît de l'URL au retour sur une
  collection ; `listViewType=column` n'y apparaît jamais. Trois specs `search`.
- **Cause** : la console écrit la query depuis deux endroits qui la
  reconstruisent chacun en entier — `filterManager.saveToRouter` et
  `Documents/Page.vue → setListViewTypeInRoute`. En `vue-router` 3, la première
  écriture était appliquée avant que la seconde ne lise `$route`. En v4 la
  navigation est **asynchrone** : les deux lisent la même query périmée, et la
  seconde écrase la première.
- **Cause seconde, trouvée au passage** : `router.currentRoute` est une `Ref`
  en v4. `filterManager` lisait `.query` directement dessus, donc `undefined`.
- **Solution** : `filterManager.pushQuery(router, build)` sérialise les
  écritures ; `build` reçoit la query telle qu'elle est **au moment où
  l'écriture s'applique**, pas telle qu'elle était quand on l'a demandée.
- **À retenir** : sous `vue-router` 4, `$route` est une photo, pas une vérité
  courante. Toute écriture d'URL qui part de `$route` doit être sérialisée avec
  les autres, ou n'écrire que sa propre clé.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-043 — Un `:class` sur un composant de couche Leaflet n'atterrit nulle part

- **Contexte** : phase 3, `vue2-leaflet` → `@vue-leaflet/vue-leaflet`.
- **Symptôme** : `.data-cy-shape` compte bien ses 4 formes, mais
  `.data-cy-shape-selected` n'existe jamais.
- **Cause** : `l-circle` et `l-polygon` ne rendent **aucun élément DOM** — le
  tracé est un `<path>` SVG créé par Leaflet. Un `:class` n'a donc nulle part
  où atterrir. Seule l'option Leaflet `class-name` atteint le tracé, ce qui
  explique que l'un des deux sélecteurs marchait et pas l'autre.
- **Solution** : la classe de sélection passe par `class-name`. Comme Leaflet
  ne l'applique **qu'à la création du tracé**, la clé de boucle porte l'état de
  sélection : en changer recrée la couche, seul moyen d'en changer la classe.
- **À retenir** : sur un composant qui pilote un objet d'une bibliothèque
  tierce plutôt qu'un élément, les attributs Vue ne veulent rien dire. Ce sont
  les options de la bibliothèque qui comptent, et leur mutabilité est la
  sienne, pas celle de Vue.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-044 — `app.mount()` **remplit** le conteneur, `new Vue({ el })` le **remplaçait**

- **Contexte** : phase 3, `src/main.ts`.
- **Symptôme** : une seule spec échoue — une icône de danger « rognée par un
  parent en `overflow` ». La cause est beaucoup plus large : **toute la console
  tournait dans 400 px de haut**, dans une fenêtre de 800.
- **Cause** : `index.html` monte sur
  `<div class="app-loading h-100" id="app">`, qui porte l'écran de chargement.
  `new Vue({ el: '#app' })` **substituait** cet élément par le rendu de
  l'application : le div et sa classe disparaissaient. `app.mount('#app')` vide
  le conteneur et rend dedans, **en le gardant**. Or `h-100` est un héritage de
  Bootstrap, parti avec [ADR-0022](adr/0022-retrait-de-bootstrap-et-preflight.md) :
  il n'existe plus que comme utilitaire Tailwind v4, qui le lit
  `height: 25rem`.
- **Solution** : `h-full` sur le conteneur de montage.
- **À retenir** : deux choses, et la seconde est la plus vicieuse. Ce qui était
  écrit sur le nœud de montage devient actif en Vue 3 — classes, attributs,
  `id`. Et **une classe d'un framework retiré peut être réinterprétée par celui
  qui l'a remplacé** : `h-100` ne voulait plus dire `height: 100%` depuis
  ADR-0022, mais plus rien ne la lisait, donc personne ne l'a vu.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-045 — Écrire dans une prop : avertissement en Vue 2, **exception** en Vue 3

- **Contexte** : phase 3, `Security/Users/CreateOrUpdate.vue`.
- **Symptôme** : l'édition d'un utilisateur n'affiche aucun de ses profils, et
  un toast « Something went wrong while loading the user » apparaît. En
  console : `TypeError: 'set' on proxy: trap returned falsish for property 'id'`.
- **Cause** : `this.id = _id`, avec `id` déclarée en prop. La valeur écrite
  était **la même** que celle déjà présente — le `_id` renvoyé par le backend
  vaut le paramètre de route. Vue 2 laissait passer avec un avertissement ;
  Vue 3 fait des props un proxy en lecture seule, et l'affectation lève, ce qui
  interrompait le chargement avant les profils.
- **Solution** : l'affectation est retirée.
- **À retenir** : un avertissement de Vue 2 qu'on a appris à ignorer est un
  échec de Vue 3. Le détecteur est court à écrire — croiser les props déclarées
  de chaque composant avec les `this.<prop> =` du fichier — et il a confirmé
  que c'était **le seul** cas de la console.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-046 — Le `$delete` de `@vue/compat` n'est pas celui de Vue 2

- **Contexte** : phase 3, suppression d'un document en temps réel.
- **Symptôme** : `Cannot read properties of undefined (reading '_id')`, levé
  pendant un rendu — pas dans le gestionnaire de notification, qui reçoit
  pourtant une notification bien formée.
- **Cause** : `this.$delete(this.documents, docIdx)`. Le `$delete` de
  `@vue/compat` est `(target, key) => { delete target[key] }` — un `delete`
  brut. Celui de Vue 2 traitait les tableaux à part, avec un
  `splice(index, 1)`. Sur un tableau, `delete` laisse un **trou** : `undefined`
  à l'index, que le `v-for` rendait ensuite.
- **Solution** : `splice`. Au passage, le `Vue.delete` du store des connexions
  — un objet, donc correct — passe au `delete` natif, que Vue 3 suit ; c'était
  le dernier `import Vue` d'un store.
- **À retenir** : **le mode de compatibilité n'est pas toujours fidèle.** On
  l'active en supposant que l'API Vue 2 se comporte comme avant ; ici elle
  porte le même nom, fait autre chose, silencieusement, et seulement sur les
  tableaux. Les `$set` / `$delete` restants sont à relire un par un, pas à
  supposer équivalents.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)

#### G-047 — Une méthode nommée `on<Event>` est écrasée par l'écouteur que le parent passe sous le même nom

- **Contexte** : phase 3, suppression en masse sur les pages Indexes et
  Collections, et saisie du Quick Search.
- **Symptôme** : on coche deux lignes, on supprime, **une seule** disparaît.
  Trois specs rouges en CI (`indexes`, `collections`, `search`) alors que la
  même base passait 17/17 en local.
- **Mesure** : instrumentation de `onCheckboxClick`, les appels réels sont
  `["testindex1", "testindex2", "testindex2"]`. Un seul événement `change` part
  du DOM, mais le gestionnaire du parent tourne **deux fois** sur le second
  clic : ajout puis retrait immédiat. Trois clics sur la *même* case donnent
  bien trois appels — le doublon n'apparaît qu'au passage d'une ligne à l'autre.
- **Cause** : le site d'appel écrit `@change="onCheckboxClick(index)"`, que Vue 3
  transmet à l'enfant comme une prop de vnode littéralement nommée **`onChange`**.
  Or `Checkbox` avait une **méthode** `onChange`. Le rendu compilé est :

  ```js
  mergeProps(_ctx.$attrs, { … }, toHandlers(_ctx.$listeners, true), {
    onChange: _cache[0] || (_cache[0] = (...args) => _ctx.onChange && _ctx.onChange(...args))
  })
  ```

  Dans ce wrapper mis en cache, `_ctx.onChange` résout vers **la prop du parent**
  et non vers la méthode du composant. Résultat : le gestionnaire du parent est
  branché deux fois — une fois par `$listeners`, une fois par le wrapper — et
  l'`$emit('update:modelValue')` du composant n'est jamais exécuté.
- **Solution** : aucune méthode ne porte un nom de la forme `on<Event>` quand un
  parent peut passer `@<event>` au composant. Préfixe `handle`. Onze méthodes
  dans huit fichiers étaient réellement en collision :

  | Fichier | Avant | Après |
  | --- | --- | --- |
  | `ui/checkbox/Checkbox.vue` | `onChange` | `handleChange` |
  | `ui/input/Input.vue` | `onInput` | `handleInput` |
  | `ui/textarea/Textarea.vue` | `onInput` | `handleInput` |
  | `Common/Filters/QuickFilter.vue` | `onInput` | `handleInput` |
  | `Common/Filters/Filters.vue` | `onReset`, `onSubmit`, `onFiltersUpdated`, `onEnterPressed` | `handle…` |
  | `Data/Indexes/DeleteIndexModal.vue` | `onCancel` | `handleCancel` |
  | `Data/Collections/CreateOrUpdate.vue` | `onSubmit` | `handleSubmit` |
  | `Data/Documents/Common/DocumentForm.vue` | `onFieldChange` | `handleFieldChange` |

  La détection est versionnée : `npm run check:listener-collisions`
  (`scripts/listener-name-collisions.ts`), code 1 et liste si une collision
  réapparaît. Elle est **bloquante en CI**, dans l'action composite `lint`, à
  côté de `check:unreachable` — un garde-fou que la CI ne lance pas n'en est
  pas un.
- **À retenir** : ce n'est **pas** un problème de `$listeners` ni de
  `v-bind="$attrs"` — les deux ont été innocentés par la mesure (`$attrs` ne
  contient que `checked,data-cy`, et `$listeners.change` est bien une fonction
  unique). C'est une **collision de noms** entre l'espace des méthodes et celui
  des props d'écouteurs, que Vue 2 gardait séparés et que Vue 3 fusionne.

  La collision n'est pas non plus réservée aux méthodes liées en ligne dans le
  template. `Filters.onSubmit` n'est appelée que depuis d'autres méthodes, par
  `this.onSubmit(…)` — et `this` passe par le même proxy que `_ctx`. C'est ce
  qui a fait rater la spec `search` à la première passe de correction : la
  détection ne regardait que les `@x="onFoo"`, ce qui couvrait `Checkbox` et
  ratait `Filters`. Le symptôme y était pourtant différent — pas de double
  appel, mais **aucun** effet : le gestionnaire du parent était appelé à la
  place de la méthode, la frappe arrivait bien jusqu'à
  `onQuickFilterSubmitted`, et l'URL ne bougeait pas.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md), [G-048](#g-048)

#### G-048 — Le serveur de dev ne reproduit pas le bug : `cacheHandlers` n'existe qu'au build

- **Contexte** : phase 3, validation de la bascule Vue 3.
- **Symptôme** : 17/17 specs vertes en local, trois specs rouges en CI, **sur le
  même commit** et le même backend.
- **Cause** : [G-047](#g-047) passe par `_cache[0]`, produit par l'optimisation
  `cacheHandlers` du compilateur. Elle est **désactivée sur le serveur de dev**
  (HMR) et activée au `vite build`. Mesuré, deux fois sur chaque cible :

  | cible | appels du gestionnaire |
  | --- | --- |
  | `vite` (dev) | 1 + 1 ✅ |
  | `vite build` + `vite preview` | 1 + 2 ❌ |

- **Solution** : **toute validation de migration se fait contre un build.**
  `npm run build && npx vite preview --host 127.0.0.1 --port 8080`, puis
  Cypress. Deux pièges de mise en place, tous deux vus ici : un `npm run dev`
  oublié depuis la veille occupait le port avec un cache Vite d'avant la
  bascule, et `vite preview` écoute sur `::1` alors que Cypress appelle
  `127.0.0.1` — d'où `ECONNREFUSED` sur un serveur pourtant joignable au `curl`.

  > Le premier piège a resservi le 2026-09-23, malgré cette fiche : `preview`
  > meurt en silence quand `--strictPort` trouve le port pris, et le `curl` de
  > contrôle répond quand même `200` — servi par le serveur de dev. **Contrôler
  > que le port répond ne suffit pas**, il faut contrôler *qui* répond :
  > `curl -s http://127.0.0.1:8080/ | grep -o 'src="/assets/[^"]*"'` ne renvoie
  > quelque chose que sur un build.
- **À retenir** : le garde-fou du chantier, ce sont les 17 specs — mais une spec
  verte ne vaut que si elle a couru sur l'artefact qu'on livre. Sous
  `@vue/compat`, dev et production **ne compilent pas le même code**. Un
  « 17/17 » obtenu sur `npm run dev` ne dit rien.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md), [G-047](#g-047)


#### G-049 — En Vue 3 un écouteur du parent retombe sur la racine de l'enfant, et double l'événement natif du même nom

- **Contexte** : phase 3, extinction du drapeau `INSTANCE_LISTENERS`.
- **Symptôme** : 21 tests rouges sur 8 specs, dont aucun ne désigne la cause.
  La plus lisible : Elasticsearch refuse le document avec
  `failed to parse field [employeeOfTheMonthSince] of type [date] […] Preview of
  field's value: '{code:Digit0,_vts:1790153413940,isTrusted:false}'`. La valeur
  écrite dans le document est **un événement clavier du DOM**.
- **Cause** : en Vue 2, les écouteurs du parent vivaient dans `$listeners` et
  n'agissaient **que** là où l'enfant écrivait `v-on="$listeners"`. En Vue 3 ils
  sont dans `$attrs`, donc ils retombent tout seuls sur l'**élément racine** de
  tout composant sans `inheritAttrs: false`. `DateTimeFormInput` émet `input` et
  sa racine est une `Card` : le `@input` de `DocumentForm` était à la fois
  l'écouteur d'émission **et** un écouteur DOM natif sur la div de la carte, que
  les `input` remontant des champs imbriqués déclenchaient.
- **Solution** : déclarer l'événement dans `emits`, ce qui **retire la clé de
  `$attrs`** ([ADR-0029](adr/0029-declarer-emits-sur-les-evenements-du-dom.md)).
  Aucun des 140 composants n'en déclarait. 22 étaient exposés ; ils sont traités.
  Contrôle bloquant : `npm run check:dom-emits`.
- **À retenir** : le drapeau `INSTANCE_LISTENERS` **ne se limite pas à
  `$listeners`**. Tant qu'il est allumé, `shouldSkipAttr` exclut les clés `onX`
  de `$attrs` ; l'éteindre les y fait entrer. Retirer les `v-on="$listeners"`
  sans éteindre le drapeau perd les écouteurs, l'éteindre sans les retirer les
  pose deux fois : les deux gestes vont ensemble. Et le travail n'est pas dans
  les 62 primitives, qui se corrigent mécaniquement, mais **chez les composants
  intermédiaires que personne ne regardait**.
- **Deux fois où `grep` ne suffit pas** — et deux fois où il a fallu une spec
  rouge pour s'en apercevoir :
  - `QuickFilter` émet par un **nom calculé**,
    `this.$emit(this.submitOnType ? 'submit' : 'input', term)`. Invisible à
    `grep "$emit('input'"`. C'est le site qui a laissé `search.spec.js` rouge
    après la première correction ;
  - `FilterHistoryItem` émet **sur son parent**, `this.$parent.$emit('submit')`.
    J'avais supprimé le `@submit` de `<history-filter>` en le croyant mort ; il
    ne l'était pas. Le contrôle remonte désormais cette relation.
- **Trois écouteurs réellement morts** ont en revanche été supprimés : `@reset`
  sur `<basic-filter>`, `@reset` sur `<filters>` dans `Roles/List` et
  `Users/List`. Inoffensifs en Vue 2 ; écouteurs DOM natifs en Vue 3, sur des
  racines qui contiennent formulaires et cases à cocher.
- **Un angle mort assumé** : une bibliothèque tierce écrite pour Vue 2 ne peut
  pas déclarer `emits`. `vue-color` est traité au site d'appel
  (`TimeSeriesItem`), qui distingue l'objet couleur de l'`Event`. Ce chemin
  **n'est couvert par aucune spec**.
- **Ref** : [ADR-0029](adr/0029-declarer-emits-sur-les-evenements-du-dom.md),
  [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md), [G-047](#g-047)

#### G-050 — Un drapeau de compat éteint rend muet le hook qu'on a oublié de renommer, et aucune spec ne le voit

- **Contexte** : phase 3, renommage `beforeDestroy`/`destroyed` →
  `beforeUnmount`/`unmounted` et extinction de `OPTIONS_BEFORE_DESTROY` /
  `OPTIONS_DESTROYED`.
- **Symptôme** : **aucun**. 17/17 specs vertes, 163 tests passants, contre un
  build ([ADR-0028](adr/0028-valider-les-specs-contre-un-build.md)). En quittant
  l'écran Watch ou l'écran de mise à jour d'un document, la console laissait
  simplement fuir sa souscription temps réel.
- **Cause** : le renommage a traité 17 + 2 fichiers et en a raté deux —
  `Data/Collections/Watch.vue` et `Data/Documents/Update.vue`, qui écrivent
  `async destroyed()`. Le `grep` de recensement cherchait `destroyed() {` en
  début de propriété et **le mot-clé `async` l'a fait passer à côté**. Les deux
  hooks faisaient la même chose :
  `await this.$kuzzle.realtime.unsubscribe(this.room)`.
- **Ce qui rend le cas méchant** : tant que `OPTIONS_DESTROYED` est allumé, un
  `destroyed` oublié continue de s'exécuter et le renommage incomplet ne coûte
  rien. **L'éteindre transforme l'oubli en code mort silencieux** : Vue 3 ne
  connaît pas cette option, ne la considère pas comme un hook, et n'émet aucun
  avertissement — c'est une clé inconnue dans un objet d'options, rien de plus.
  Le drapeau qui devait sécuriser le lot est ce qui a armé le bug.
- **Pourquoi le filet n'a rien vu** : une souscription orpheline ne casse
  aucune assertion. Les specs vérifient ce que l'écran affiche, pas ce qu'il
  libère en partant. C'est la classe de régression que les 17 specs **ne
  peuvent pas** attraper, et il faut le savoir avant d'annoncer un N/N.
- **Solution** : renommer les deux hooks, et surtout **poser la règle plutôt que
  de refaire le `grep`** : `vue/no-deprecated-destroyed-lifecycle` en `error`
  dans `.eslintrc.cjs`. Elle trouve les deux cas en une commande, `async` ou
  non, et interdit leur retour.
- **À retenir, et c'est la leçon générale du lot** : *éteindre un drapeau de
  compat et reprendre le code correspondant sont un seul geste, et il se ferme
  par une règle ESLint, pas par un `grep`.* Chaque lot de la phase 3 retire un
  usage Vue 2 sans rien qui empêche de le réintroduire ; `eslint-plugin-vue` a
  une règle `no-deprecated-*` pour presque chacun. Le `grep` mesure un instant,
  la règle tient dans le temps — et ici elle aurait trouvé ce que le `grep` a
  manqué, le jour même.
- **Ref** : [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md),
  [ADR-0028](adr/0028-valider-les-specs-contre-un-build.md)

#### G-051 — Un fichier de shims qui augmente `vue/types/vue` ne décrit plus rien depuis la bascule

- **Contexte** : phase 3, extinction du drapeau `GLOBAL_PROTOTYPE`.
- **Symptôme** : `npm run test:types` reproche `Property '$toast' does not exist`
  et `Property '$log' does not exist` sur les 34 fichiers qui les appellent,
  alors que `src/shims-toast.d.ts` et `src/shims-logger.d.ts` sont bien là, bien
  écrits, et n'ont pas bougé.
- **Cause** : ils déclarent `declare module 'vue/types/vue' { interface Vue }`.
  C'est l'espace de noms **de Vue 2**. En Vue 3 il n'existe plus, et une
  augmentation d'un module qui n'existe pas ne provoque aucune erreur : elle ne
  fait simplement rien. Le fichier reste valide, il cesse d'être branché.
- **Solution** : `declare module 'vue' { interface ComponentCustomProperties }`.
- **À retenir** : les erreurs de types apparues à la bascule ne sont pas toutes
  du code à reprendre — certaines sont des **déclarations devenues muettes**.
  Chercher d'abord ce qui augmentait `vue/types/*` : le symptôme se lit sur des
  dizaines de fichiers d'appel, et la cause tient dans une ligne d'un fichier
  que personne ne relit. C'est aussi pourquoi le compte d'erreurs est tombé de
  54 à 42 sur un lot qui ne touche que deux plugins.
- **Ref** : [ADR-0026](adr/0026-wrapper-de-log-maison.md), [ADR-0020](adr/0020-systeme-de-toasts.md)

#### G-052 — La config ESLint partagée est restée en Vue 2, et refuse la syntaxe du lot

- **Contexte** : phase 3, extinction du drapeau `COMPILER_V_BIND_SYNC`.
- **Symptôme** : `npm run test:lint` passe de 0 à **22 erreurs**
  `vue/no-v-model-argument` — « `'v-model'` directives require no argument » —
  sur les 11 fichiers du lot, alors que le build est vert, `vue-tsc` ne signale
  aucune régression et les specs passent. La règle proteste contre exactement ce
  que le lot vient d'écrire : `v-model:open`, `v-model:page`.
- **Cause** : `.eslintrc.cjs` étend `plugin:vue-kuzzle/default`, qui active le
  jeu de règles **Vue 2** d'`eslint-plugin-vue`. `v-model` à argument n'existe
  pas en Vue 2 : la règle est correcte pour la version qu'elle croit linter.
  La bascule vers Vue 3 sous `compat` a changé le runtime et le compilateur,
  **pas le linter** — qui est resté sur son jeu de règles d'origine, sans que
  rien ne le signale tant qu'aucun lot n'écrivait de syntaxe Vue 3 pure.
- **Solution** : `'vue/no-v-model-argument': 'off'`, et son symétrique
  `'vue/no-deprecated-v-bind-sync': 'error'` pour interdire le retour de
  `:prop.sync`. Même geste que pour `vue/no-deprecated-destroyed-lifecycle`
  ([G-050](#g-050)) : chaque drapeau éteint échange la règle qui gardait
  l'usage Vue 2 contre celle qui garde l'usage Vue 3.
- **À retenir** : le linter est un **troisième** compilateur, à côté de Vite et
  de `vue-tsc`, et c'est le seul des trois que la bascule n'a pas mis à jour.
  Tant que les lots ne faisaient que renommer (`beforeDestroy`, `$set`,
  `Vue.prototype`), il n'avait rien à redire. Le premier lot qui introduit une
  **syntaxe de template** propre à Vue 3 le réveille — attendre la même chose
  des lots à venir, et traiter l'erreur comme un signal de config, jamais comme
  un signal de code. Le passage global à `plugin:vue/vue3-*` appartient à la
  phase 4 : le faire ici rendrait tout le reste du code non conforme d'un coup.
- **Ref** : [G-050](#g-050)

#### G-053 — Un drapeau de compat éteint s'applique aussi aux bibliothèques tierces, qu'on ne peut pas corriger

- **Contexte** : phase 3, extinction du drapeau `COMPONENT_V_MODEL`.
- **Symptôme** : rien. Le build passe, les 17 specs passent, et trois
  composants continuent de s'afficher — c'est précisément le problème.
- **Cause** : `configureCompat` s'applique à **toute** l'application, y compris
  au code de `node_modules`. Sur les 51 `v-model` nus de `src`, trois portent
  sur des bibliothèques écrites pour Vue 2 — `vue-color` 2.8.1,
  `vue-multiselect` 2.1.7, `vuedraggable` 2.24.3. Aucune ne déclare l'option
  `model` : elles reposent sur le défaut de Vue 2, `value` + `input`. Le drapeau
  éteint, leur `v-model` compile vers `modelValue` + `update:modelValue`,
  qu'elles ne déclarent ni n'émettent. La valeur cesse de circuler, sans erreur.
- **Solution** : écrire le contrat Vue 2 à la main sur le site d'appel —
  `:value="x"` et `@input="x = $event"`. Le composant tiers ne peut pas être
  corrigé ; c'est l'appelant qui porte l'adaptation, jusqu'à son remplacement.
- **À retenir** : les lots précédents ne touchaient que du code à nous. Celui-ci
  est le premier dont le périmètre déborde sur `node_modules`. **Avant
  d'éteindre un drapeau, recenser les sites d'appel qui visent une bibliothèque
  tierce** : ce sont les seuls que le lot ne peut pas corriger à la source, et
  ils cassent en silence. Corollaire : un `grep` sur la syntaxe visée ne suffit
  pas, il faut savoir sur *quel composant* chaque occurrence porte.
- **Ref** : [G-050](#g-050), [G-054](#g-054), [G-055](#g-055)

#### G-054 — Le contenu par défaut d'un `<slot>` de bibliothèque Vue 2 ne rend rien

- **Contexte** : découvert en écrivant la couverture du lot `COMPONENT_V_MODEL`,
  mais **antérieur à lui** — reproduit à l'identique sur `5-dev`.
- **Symptôme** : dans la vue Column, le sélecteur de champs ouvre une liste de
  onze lignes **blanches**. Les `<li>` sont bien là, les `<span
  class="multiselect__option">` aussi, et ils sont vides. On ne peut pas choisir
  ses colonnes : la fonctionnalité est inutilisable depuis la bascule Vue 3.
- **Cause** : `vue-multiselect` rend le libellé via le contenu **par défaut**
  de son `<slot name="option">`. Ce repli ne s'exécute pas sous `@vue/compat`
  quand le composant vient d'une fonction de rendu précompilée pour Vue 2.
- **Solution** : fournir le slot depuis le site d'appel, ce qui court-circuite
  le repli cassé — `<template #option="{ option }">{{ option }}</template>`.
- **À retenir** : le symptôme est **visuel et muet**. Aucune erreur, aucun
  avertissement, aucune spec en échec — parce qu'aucune spec n'ouvrait ce
  sélecteur. Trois specs touchaient la vue Column sans jamais interagir avec
  lui. C'est le trou de couverture qui a caché le bug, pas sa subtilité.
- **Ref** : [G-053](#g-053)

#### G-055 — `v-model` dans une fonction de rendu précompilée d'un paquet Vue 2 casse sous compat

- **Contexte** : même campagne de couverture. **Antérieur au lot** lui aussi,
  reproduit à l'identique sur `5-dev`. **Non corrigé à ce jour.**
- **Symptôme** : saisir dans le champ hexadécimal ou RVBA du sélecteur de
  couleur de la vue Chart lève
  `TypeError: el[assignKey] is not a function`, une exception applicative qui
  fait échouer toute spec présente sur la page.
- **Cause** : `vue-color` est publié **déjà compilé** par
  `vue-template-compiler`. Son `v-model` sur des `<input>` natifs y est figé
  sous la forme `model: { value, callback, expression }` dans les données de
  vnode. `@vue/compat` traduit cette forme en directive `vModelText` de Vue 3,
  mais la fonction `assign` que la directive attend sur l'élément n'est jamais
  posée : son gestionnaire `input` appelle alors `el[assignKey]`, qui n'existe
  pas.
- **Ce qui a été écarté** : le drapeau `INSTANCE_SET`. `vue-color` appelle bien
  `this.$set` dans ces mêmes rappels, mais le rallumer ne change rien — vérifié
  par un build dédié. La piste était plausible et fausse.
- **Solution** : aucune au site d'appel. Le code fautif est déjà compilé dans
  `node_modules`, hors de portée du compilateur de template. `vue-color` 2.8.1
  n'a pas de version Vue 3. **Le remplacer est une décision de phase 4, à
  porter par une ADR.** En attendant, le reste du sélecteur — la zone de
  saturation et la glissière de teinte, qui passent par des gestionnaires de
  souris — n'est pas affecté ; seule la saisie textuelle l'est.
- **À retenir** : une bibliothèque Vue 2 **précompilée** est un angle mort
  irréductible de `@vue/compat`. Le mode de compatibilité réécrit ce qu'il
  compile ; ce qui arrive déjà compilé ne lui passe pas entre les mains. Les
  recenser tôt — `vue-color`, `vue-multiselect`, `vuedraggable` ici — donne la
  vraie liste des blocages de la phase 4.
- **Ref** : [G-053](#g-053), [G-054](#g-054)

#### G-056 — Un `<template>` nu devient un vrai élément du DOM en `MODE: 3`, et cache tout ce qu'il contient

- **Contexte** : phase 3, passage de `MODE: 2` à `MODE: 3`
  ([ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md)).
- **Symptôme** : l'application est **entièrement blanche**. Le build passe,
  aucune erreur en console, le DOM est bien construit — et les 17 specs
  tombent sur `cy.click() failed because this element is not visible […] its
  parent <template> has CSS property: display: none`. C'est Cypress qui nomme
  la cause, pas Vue.
- **Cause** : `App.vue` enveloppait son `<router-view>` dans un `<template>`
  **sans directive** — ni `v-if`, ni `v-for`, ni `v-slot`. En Vue 2, un
  `<template>` est toujours un fragment, quoi qu'il porte. En Vue 3, un
  `<template>` qui ne porte aucune directive structurante est un **élément
  natif**, rendu tel quel dans le DOM — et le navigateur lui applique
  `display: none`. Le drapeau `COMPILER_NATIVE_TEMPLATE`, allumé par défaut en
  `MODE: 2`, rétablissait le comportement de Vue 2 ; il n'avait jamais été
  nommé par un lot, donc jamais regardé.
- **Solution** : supprimer l'enveloppe, qui ne servait à rien. Le recensement
  est un `awk` d'une ligne — un `<template>` nu ailleurs qu'à la ligne 1 d'un
  SFC : il n'y en avait qu'un.
- **À retenir** : les drapeaux qu'aucun lot n'a nommés ne sont pas
  « probablement sans objet », ils sont **non mesurés**. Une liste de drapeaux
  soldée décrit ce dont on s'est passé, pas ce dont on dépend encore ; c'est
  `MODE: 3` qui pose la question, et il faut s'attendre à ce qu'il trouve
  quelque chose. Ici il n'a trouvé qu'un fichier, mais ce fichier rendait la
  console inutilisable.
- **Ref** : [G-057](#g-057)

#### G-057 — Toutes les bibliothèques Vue 2 ne portent pas le marqueur `_compiled`

- **Contexte** : même lot. Corollaire direct de [G-053](#g-053).
- **Symptôme** : une fois `App.vue` corrigé, 15 tests sur 17 specs repassent —
  et la vue Chart reste vide. `[data-cy="timeSeries-chart"]` n'apparaît jamais,
  sans erreur ni avertissement.
- **Cause** : le `MODE: 3` global laisse les bibliothèques Vue 2 en `MODE: 2`
  par une fonction qui teste `_compiled`, le marqueur que `vue-loader` pose sur
  ce qu'il compile. `vue-apexcharts` 1.6.2 est écrit pour Vue 2 mais son
  `render(createElement)` est **écrit à la main** : il n'est jamais passé par
  `vue-loader`, ne porte pas le marqueur, et bascule en mode 3 avec le reste.
  `vuedraggable` 2.24.3 est dans le même cas.
- **Solution** : épingler ces composants à leur site d'appel —
  `VueApexCharts.compatConfig = { MODE: 2 }`. Le `compatConfig` posé sur
  l'objet composant prime sur le mode global.
- **À retenir** : « écrit pour Vue 2 » et « compilé par `vue-template-compiler` »
  ne sont pas la même chose, et c'est la seconde propriété qu'un marqueur peut
  détecter. Une heuristique sur `node_modules` doit être doublée d'un
  **recensement nominatif** des paquets Vue 2 : ici quatre, dont deux que
  l'heuristique ne voit pas. Le symptôme est, une fois de plus, un composant qui
  ne rend rien plutôt qu'une erreur.
- **Ref** : [G-053](#g-053), [G-056](#g-056)

#### G-058 — Un watcher non `deep` ne voit plus la mutation d'un tableau

- **Contexte** : phase 3, passage en `MODE: 3`, drapeau `WATCH_ARRAY`.
- **Symptôme** : le filtre par rôle de la liste des profils s'affiche comme
  actif — la pastille « Filters are being applied » apparaît — et **la liste
  n'est pas filtrée**. Un seul test rouge (`profiles.spec.js`), aucune erreur.
- **Cause** : `Filters.vue` mute `selectedRoles` sur place (`push` / `splice`)
  et s'en remet à `watch: { selectedRoles() {…} }` pour émettre
  `filters-updated`. En Vue 2, la réactivité par `Object.defineProperty`
  instrumentait les méthodes de tableau et notifiait la dépendance du tableau
  lui-même : un watcher non `deep` se déclenchait sur `push`. En Vue 3, le
  `Proxy` distingue les deux, et un watcher non `deep` ne réagit qu'au
  **changement de référence**.
- **Solution** : `deep: true` sur le watcher. C'est la traduction exacte de ce
  que Vue 2 faisait, et elle laisse le code du composant inchangé.
- **Pourquoi la pastille, elle, s'affichait** : `hasFilter` est une
  **computed**. Les computed lisent le tableau à travers le proxy et voient donc
  la mutation. Dans le même composant, la computed a suivi et le watcher non.
  C'est ce qui rend le symptôme trompeur : l'état a l'air à jour.
- **Recensement** : 6 watchers de tableau sans `deep` dans `src`, dont **4**
  portent sur un tableau muté sur place — `Profiles/Filters.selectedRoles`,
  `Roles/Filters.controllers`, `Column.selectedFields`,
  `TimeSeries.customNumberFields`. Les deux autres ne sont que réassignés et
  n'ont rien à corriger. Une seule des quatre était couverte par une spec.
- **À retenir** : chercher le `watch`, puis **chercher la mutation**. Le drapeau
  ne casse pas les watchers de tableau, il casse ceux dont la valeur change sans
  que la référence change — et c'est au site de mutation que ça se décide, pas
  au site du watcher.

#### G-059 — `this.$vnode` disparaît en `MODE: 3`, et la fusion de classes des primitives avec

- **Contexte** : phase 3, passage en `MODE: 3`, drapeau `PRIVATE_APIS`.
- **Symptôme** : `login.spec.js`, un test rouge — « Sorry, your session has
  expired » n'apparaît jamais. Sur la capture, la modale de création d'index est
  ouverte, **son champ vide**, avec « This field cannot be empty ». Rien ne
  désigne les classes CSS.
- **Cause** : le mixin `classMerge`, dont héritent les 60 primitives de `ui/`,
  lisait la classe du site d'appel par `this.$vnode.data.staticClass`. `$vnode`
  est une API privée de Vue 2 ; `PRIVATE_APIS` la maintenait en vie, et en
  `MODE: 3` elle vaut `undefined`. La classe du site d'appel cesse d'être passée
  à `cn`, donc d'être arbitrée par `tailwind-merge` : la variante et la
  surcharge restent toutes les deux dans l'attribut, et c'est l'ordre de la
  feuille de styles qui tranche.
- **Solution** : lire `this.$attrs.class`. En Vue 3 la classe du site d'appel
  est un attribut comme un autre — ce que Vue 2 justement ne faisait pas, et qui
  était toute la raison d'aller la chercher sur le vnode.
- **Comment il a été trouvé** : par **bisection des 42 drapeaux**, rallumés par
  paquets par-dessus `MODE: 3` jusqu'à ce que la spec repasse — six exécutions.
  Les quatre hypothèses formulées avant la bisection (piège de focus de
  `DialogContent`, `CUSTOM_DIR`, `INSTANCE_ATTRS_CLASS_STYLE`, la suppression du
  `<template>` de `App.vue`) étaient toutes fausses, et deux d'entre elles ont
  coûté une sonde chacune pour être écartées.
- **À retenir** : le symptôme était à quatre composants du coupable, et le
  chemin qui les relie ne se devine pas. **Bisecter les drapeaux est plus rapide
  que raisonner dessus** — chaque exécution coûte une minute et retire la
  moitié de l'espace, là où une hypothèse coûte autant et ne retire qu'elle-même.
  À noter aussi : `npm run test:types` signalait déjà `Property '$vnode' does
  not exist` sur ce fichier, dans les 54 erreurs tolérées. La réponse était dans
  la sortie d'un contrôle non bloquant.
- **Ref** : [G-056](#g-056)

### 5.2 Anticipés — à confirmer ou infirmer sur le terrain

Points de vigilance connus pour un passage Vue 2 → Vue 3, à valider contre ce
codebase précis. **Ce ne sont pas des faits constatés** : ils sont à déplacer en
5.1 une fois rencontrés, ou à supprimer s'ils ne se présentent jamais.

> **Bilan après la bascule** ([ADR-0027](adr/0027-bascule-vue-3-sous-compat.md)) :
> de cette liste, **aucun** n'a fait tomber une spec. Les dix problèmes
> rencontrés sont en 5.1, sous G-039 à G-048, et **pas un seul n'était
> anticipé ici**. Ce qui figure ci-dessous est ce que la documentation de Vue
> met en avant ; ce qui casse pour de vrai est ce que le code fait de
> particulier — un `appendChild` manuel, une classe morte sur le nœud de
> montage, un `name` de composant qui coïncide avec une balise, une méthode
> `onChange` qui coïncide avec l'écouteur du parent. La liste d'anticipation
> n'a pas été inutile, elle a été **hors sujet**, et ça vaut d'être noté avant
> la phase 4.
>
> Le cas de `$listeners` mérite d'être regardé de près, parce qu'il est le seul
> qui *semble* avoir été anticipé. La ligne ci-dessous dit « fusionné dans
> `$attrs` » ; c'est vrai en Vue 3 pur, et **faux sous `@vue/compat` en
> `MODE: 2`**, où `$attrs` ne contient aucun écouteur — mesuré en G-047. Le vrai
> problème était ailleurs (une collision de noms), et l'énoncé anticipé aurait
> envoyé chercher au mauvais endroit. Une ligne d'anticipation juste sur le
> papier peut coûter plus cher qu'une ligne absente.

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
- **`$listeners`** : fusionné dans `$attrs`. *Rencontré le 2026-09-23, et la
  ligne était deux fois insuffisante* — voir [G-049](#g-049). Elle dit ce qui
  arrive à `$listeners` ; ce qui casse, c'est ce qui arrive à **`$attrs`**, qui
  retombe sur la racine des composants intermédiaires. Elle n'aurait pas non
  plus fait chercher chez `DateTimeFormInput` ou `QuickFilter`, qui n'écrivent
  `$listeners` nulle part.
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
| 2026-09-21 | Supprimer le code non atteignable, et rendre le contrôle bloquant dans la CI | [ADR-0016](adr/0016-supprimer-le-code-non-atteignable.md) |
| 2026-09-21 | `Tabs` à la main, pilotée par valeur, panneau caché démonté | [ADR-0017](adr/0017-primitive-tabs-en-vue-2.md) |
| 2026-09-21 | Les panneaux flottants passent au-dessus de `Dialog` (1035) | [ADR-0018](adr/0018-panneaux-flottants-au-dessus-des-modales.md) |
| 2026-09-22 | `TagsInput` à la main, malgré un site d'appel unique | [ADR-0019](adr/0019-primitive-tags-input-en-vue-2.md) |
| 2026-09-22 | Notifications : un store, une zone unique, une API impérative assumée | [ADR-0020](adr/0020-systeme-de-toasts.md) |
| 2026-09-22 | Splitter maison, et onglets montés en permanence dans ApiAction | [ADR-0021](adr/0021-reprise-apiaction-splitter-et-onglets.md) |
| 2026-09-22 | Bootstrap sort et le preflight entre, dans le même geste | [ADR-0022](adr/0022-retrait-de-bootstrap-et-preflight.md) |
| 2026-09-22 | Retrait du préfixe `tw:`, et vérification par comparaison du CSS produit | [ADR-0023](adr/0023-retrait-du-prefixe-tw.md) |
| 2026-09-22 | Vider la couche `legacy` de ce qui ne style plus rien, et nommer ce qui reste | [ADR-0024](adr/0024-degraisser-la-couche-legacy.md) |
| 2026-09-22 | Réimplémenter `vue-form-generator` en un composant de la console | [ADR-0025](adr/0025-reimplementer-vue-form-generator.md) |
| 2026-09-22 | Remplacer `vuejs-logger` par un wrapper de 40 lignes | [ADR-0026](adr/0026-wrapper-de-log-maison.md) |
| 2026-09-22 | Basculer sur Vue 3 sous `@vue/compat`, en un seul lot | [ADR-0027](adr/0027-bascule-vue-3-sous-compat.md) |
| 2026-09-23 | Valider les specs de migration contre un build, jamais contre le serveur de dev | [ADR-0028](adr/0028-valider-les-specs-contre-un-build.md) |
| 2026-09-23 | Déclarer `emits` dès qu'un événement porte un nom d'événement du DOM | [ADR-0029](adr/0029-declarer-emits-sur-les-evenements-du-dom.md) |
| 2026-09-23 | Le chantier déménage sur `5-dev` et se déploie sur console-v5.kuzzle.io | [ADR-0030](adr/0030-branche-5-dev-et-deploiement-console-v5.md) |
| 2026-09-24 | `MODE: 3` global, et les bibliothèques Vue 2 épinglées en `MODE: 2` | [ADR-0031](adr/0031-mode-3-global-et-bibliotheques-vue-2-epinglees.md) |
| 2026-09-24 | `vue3-apexcharts` 1.7.0, et `apexcharts` reste en 3.53.0 | [ADR-0032](adr/0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md) |
