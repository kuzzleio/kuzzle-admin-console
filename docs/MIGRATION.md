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

### Prérequis bloquant

- [ ] **Auditer les sélecteurs Cypress** ([#1017](https://github.com/kuzzleio/kuzzle-admin-console/issues/1017)). Les 17 specs sont le filet de sécurité
      de tout le chantier. Si elles ciblent des classes Bootstrap, elles
      casseront à chaque écran migré et le filet disparaît. À faire **avant** la
      phase 2 : basculer les sélecteurs fragiles sur des attributs `data-cy`.

---

## 2. Toolchain (phase 0)

Versions relevées le 2026-09-18. Node 20 « Iron » est **EOL depuis mars 2026**.

| Élément | Actuel | Cible | Statut |
|---|---|---|---|
| Node | 20 (EOL) / 22 dans le Dockerfile | 24 LTS « Krypton » | ⬜ |
| `.nvmrc` / `engines` / CI / Dockerfile | 3 valeurs différentes | alignés, `.nvmrc` fait foi | ⬜ |
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
| `kuzzle-sdk` v6 **et** v7 en parallèle | double SDK embarqué ; évaluer l'abandon de v6 | ⬜ |
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

*(vide pour l'instant — à alimenter dès la phase 0)*

<!--
Gabarit à copier :

#### G-00X — <symptôme en une ligne>
- **Contexte** : phase / composant concerné
- **Symptôme** : ce qu'on observe réellement (message d'erreur exact si court)
- **Cause** : ce qui se passe vraiment
- **Solution** : ce qu'on a fait
- **Ref** : PR / issue
-->

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
