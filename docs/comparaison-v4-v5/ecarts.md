# Écarts v4 / v5 — tri de l'étape 3

> Étape 3 de la comparaison ([`README.md`](README.md)). Source : la planche du
> 2026-09-25 (`4-dev` d6134eaa, `5-dev` da6be679), le code des deux versions et
> les ADR. Les verdicts fonction par fonction sont dans la colonne *v5* de
> [`inventaire.md`](inventaire.md) ; ce fichier regroupe les écarts **par
> cause**, parce qu'une cause touche souvent dix fonctions et se corrige en un
> seul endroit.

**Lecture de la colonne *v5* de l'inventaire**

- ✅ identique ou équivalent · 🎯 écart voulu, avec son ADR · 🔴 régression ·
  ⛔ manquant · ❓ à trancher.
- `✅ · E-20` : la fonction est intacte, mais un écart transverse la touche
  visuellement. `🔴 E-06` : l'écart abîme la fonction elle-même (information
  perdue, écran illisible, action hors d'atteinte).

**Bilan** : 153 fonctions — 142 ✅ (dont 8 touchées par un écart
transverse), 11 🎯, 0 🔴, 0 ⛔, 0 ❓. Aucune fonction n'a disparu. Les
régressions viennent de 15 causes fonctionnelles (E-01 à E-15) et de 7 causes
visuelles (E-20 à E-26).

---

## Régressions fonctionnelles — à corriger avant la DA

Elles ne dépendent pas de la palette : la DA ne les corrigera pas, et elle les
rendrait plus difficiles à isoler.

<a id="e-01"></a>

### E-01 — Formulaire de profil : les boutons sortent de l'écran

- **Issue** : #1119
- **Fonctions** : PRF-06 (C103, C104).
- **Symptôme** : l'aide-mémoire des politiques ne défile plus ; la carte
  grandit, Cancel / Create / Update passent sous la ligne de flottaison.
- **Cause** : `Security/Profiles/CreateOrUpdate.vue:31` — la colonne
  `lg:w-5/12` n'est plus `flex flex-col` (v4 : `d-flex flex-column`), donc le
  `flex: 1 1 1px; overflow: auto` de `.ProfileCreateOrUpdate-cheatsheet` ne
  joue plus.
- **Corrigé** : la colonne redevient `flex flex-col`, et `CardContent` passe
  de `h-full` à `flex-1 min-h-0` : il prend la place que lui laisse le pied de
  carte, et non plus toute la hauteur de la carte.

<a id="e-02"></a>

### E-02 — Le plein écran des filtres recouvre toute l'application

- **Issue** : #1120
- **Fonctions** : FLT-10 (C61).
- **Symptôme** : le panneau couvre la barre de navigation et l'arbre, au lieu
  de la seule zone de contenu.
- **Cause** : `.full-screen` (`assets/styles/_layout.scss:22`) est en
  `position: absolute` ; son ancêtre positionné était le `b-overlay` de
  `Data/Layout.vue`, retiré sans rendre `ResizablePanel` `relative`.
- **Corrigé** : un `div.relative.h-full` remplace le `b-overlay` autour du
  `router-view` ([G-076](../MIGRATION.md)).

<a id="e-03"></a>

### E-03 — Le toast « Offline » est illisible

- **Issue** : #1121
- **Fonctions** : APP-05 (C22).
- **Symptôme** : fond presque transparent, le titre se superpose à la barre
  de navigation.
- **Cause** : `ui/toast/Toast.vue:51`, `warning: 'bg-accent/20'` (20 %
  d'opacité) ; `danger` est à `bg-destructive/10`. Le `b-toast` v4 était opaque.
- **Corrigé** : les variantes teintées (`warning`, `danger`, `success`) mêlent
  leur couleur à `card` (`color-mix`) au lieu de la transparence ; mêmes
  proportions, le toast devient opaque. La palette reste celle du lot tokens.

<a id="e-04"></a>

### E-04 — Le menu des connexions reste ouvert par-dessus la modale

- **Issue** : #1122
- **Fonctions** : ENV-07 (C06).
- **Symptôme** : après le crayon ou la corbeille, la modale s'ouvre et le menu
  reste affiché devant elle.
- **Cause** : `Common/Environments/EnvironmentsSwitch.vue:65-83` — éditer et
  supprimer sont des `Button`, pas des `DropdownMenuItem`, et ne ferment pas
  le menu ; les panneaux (z-index 1035) passent devant `Dialog` (1030).
  Contredit [ADR-0018](../adr/0018-panneaux-flottants-au-dessus-des-modales.md) § 2.
- **Corrigé** : les deux boutons ferment le menu (`close()` de
  `DropdownMenu`) avant d'émettre ; `environments.spec` vérifie que le menu a
  disparu après le crayon et la corbeille.

<a id="e-05"></a>

### E-05 — Plus de croix de fermeture sur les modales

- **Issue** : #1123
- **Fonctions** : toutes les modales (ENV-09, ENV-10, AUTH-08, IDX-05, IDX-07,
  IDX-08, COL-04, COL-05, DOC-04, LST-04, CLM-04, USR-03, PRF-03, ROL-03,
  ROL-05, API-05).
- **Symptôme** : la fermeture ne passe plus que par Cancel, Échap ou le fond.
- **Cause** : `ui/dialog/` n'a pas de `DialogClose`, que
  [ADR-0010](../adr/0010-primitive-dialog-en-vue-2.md) annonce ;
  `DialogContent.vue` ne rend que son slot.
- **Corrigé** : primitive `DialogClose`, qui ferme par le même chemin qu'Échap
  (`update:open`) ; `DialogContent` rend la croix par défaut, après son slot
  (`showCloseButton`, comme shadcn-vue), sur les 19 modales.

<a id="e-06"></a>

### E-06 — Le sélecteur d'opérateur affiche la clé brute

- **Issue** : #1124
- **Fonctions** : FLT-03 (C57), USR-02 (C91).
- **Symptôme** : `contains` au lieu de « Contains » (et `not_equal`,
  `not_exists`…) tant que la liste n'a jamais été ouverte.
- **Cause** : `ui/select/SelectValue.vue:46-48` n'apprend les libellés qu'au
  montage des `SelectItem`, c'est-à-dire à l'ouverture.
  [ADR-0014](../adr/0014-primitive-select-en-vue-2.md) affirme que l'écart ne
  se voit pas : ici il se voit. `Common/Filters/BasicFilter.vue:60` n'utilise
  pas le slot de libellé, contrairement au tri (l. 173-179).
- **Corrigé** : l'opérateur passe son libellé dans le slot de `SelectValue`,
  comme le tri. C'était le seul `Select` de la console dont les valeurs
  diffèrent des libellés sans slot ; le commentaire de `SelectValue` le dit
  désormais. `search.spec` vérifie « Contains » avant toute ouverture.

<a id="e-07"></a>

### E-07 — Vue formulaire : un champ objet affiche `null` au lieu de `{}`

- **Issue** : #1125
- **Fonctions** : DOCF-03 (C71).
- **Cause** : `Data/Documents/FormInputs/JsonFormInput.vue:37`,
  `value: { default: null }` ; `JSON.stringify(null)` donne `"null"`, et le
  repli `|| '{}'` de la l. 7 ne joue plus. À vérifier : si l'éditeur émet
  `change` à l'initialisation, `null` finit dans le document enregistré.
- **Vérifié** : oui. Un document créé en vue formulaire sans toucher aux
  champs objet était enregistré avec `items: null` et `skill: null` ; la v4,
  qui a le même `JsonEditor`, enregistrait `{}`.
- **Corrigé** : `value` n'a plus de `default: null` ; un champ absent reste
  `undefined` et l'éditeur part de `{}` ([G-077](../MIGRATION.md)).
  `formView.spec` vérifie le `{}` enregistré.

<a id="e-08"></a>

### E-08 — Retours de formulaire appauvris

- **Issue** : #1126
- **Fonctions** : ENV-03 (C02), IDX-05 (C34).
- **Symptôme** : les champs valides ne sont plus marqués (bordure verte,
  coche), les champs en erreur perdent leur icône ; dans la modale de
  création d'index, la règle de nommage (liste des caractères interdits)
  disparaît dès qu'une erreur s'affiche — au moment précis où on en a besoin.
- **Cause** : `CreateEnvironment.vue:9-38` ne pose qu'`aria-invalid` ;
  `Data/Indexes/CreateIndexModal.vue:18-19`, `FormMessage v-if` /
  `FormDescription v-else`.
- **Corrigé** : la règle de nommage reste affichée sous l'erreur ; l'icône
  d'erreur revient, dans `FormMessage`, donc pour tous les formulaires.
- **Reporté à [E-21](#e-21)** : le marquage des champs valides (bordure verte,
  coche) demande une couleur « succès » que la palette n'a pas.

<a id="e-09"></a>

### E-09 — Toasts : lien, infobulle et choix obligatoire perdus

- **Issue** : #1127
- **Fonctions** : AUTH-10 (C16), AUTH-11 (C17).
- **Symptôme** : « that you create one » n'est plus un lien vers
  `#/signup`, « Ok, got it » a perdu son `title` ; le bandeau de télémétrie a
  une croix qui permet de le fermer sans choisir (la v4 avait
  `no-close-button`).
- **Cause** : `Home.vue:134-141` (message en chaîne, action sans `title`) ;
  `Common/Toaster.vue:26` rend `ToastClose` sur tous les toasts, sans option.
- **Corrigé** : les toasts du store gagnent `link` (rendu dans la phrase du
  message), `title` sur les actions et `dismissible` ; « that you create one. »
  pointe à nouveau vers `#/signup`, « Ok, got it » a son infobulle, le bandeau
  de télémétrie n'a plus de croix. `login.spec` couvre les trois.

<a id="e-10"></a>

### E-10 — Pagination masquée quand tout tient sur une page

- **Issue** : #1128
- **Fonctions** : USR-05, PRF-04, ROL-04 (C90, C100, C110) ; aussi
  `Data/Documents/Page.vue:201`.
- **Cause** : `v-show="totalDocuments > paginationSize"` dans
  `Security/{Users,Profiles,Roles}/List.vue`, ajouté au commit 3ead0a5a. La v4
  l'affichait toujours sur les listes Security.
- **Tranché** : comportement v5 conservé et généralisé,
  [ADR-0045](../adr/0045-pagination-masquee-sur-une-page.md).

<a id="e-11"></a>

### E-11 — Import de connexions : les erreurs ne se ferment plus

- **Issue** : #1129
- **Fonctions** : ENV-11 (C07).
- **Cause** : `Common/Environments/ModalImport.vue:30-37`, `Alert` sans croix
  (v4 : `b-alert dismissible`).
- **Corrigé** : chaque erreur a sa croix, écrite dans le site d'appel comme
  pour l'erreur de connexion (`Login/Form.vue`). Fermer une erreur la masque
  sans la retirer de `errors` : sinon « Uploaded file is valid » apparaîtrait
  pour un fichier refusé.

<a id="e-12"></a>

### E-12 — Menus : cases décochées invisibles, déclencheurs sans chevron

- **Issue** : #1130
- **Fonctions** : PRF-02 (C101), DOC-06 (C54), AUTH-02 (C10), filtre
  « Controllers » des rôles (C111).
- **Symptôme** : un élément décoché n'a plus de case, l'état « Auto-Sync
  désactivé » ne se voit plus (l'icône Refresh n'est plus grisée non plus) ;
  « Login with » et les filtres n'ont plus de triangle, rien n'indique un menu.
- **Cause** : `ui/dropdown-menu/DropdownMenuCheckboxItem.vue` n'affiche que la
  coche ; `DropdownMenuTrigger` n'ajoute pas de chevron (seul
  `EnvironmentsSwitch.vue:32` le pose à la main). `item-classes.ts` impose
  `font-sans`, qui écrase la classe `code` des noms de rôles.
- **Corrigé** : `DropdownMenuCheckboxItem` dessine la case dans les deux états
  (`far fa-square` / `fa-check-square`, les icônes de la v4) ; l'icône Refresh
  est grisée quand Auto-Sync est coupé ; « Login with », le filtre des profils
  et « Controllers » ont leur `fa-caret-down`, comme `EnvironmentsSwitch` ; la
  classe `code` des noms de rôles passe sur le texte, où `font-sans` ne l'atteint
  pas.

<a id="e-13"></a>

### E-13 — API Action : barre de défilement parasite dans les onglets

- **Issue** : #1131
- **Fonctions** : API-01 (C120, C122, C123).
- **Cause probable** : `ApiAction.vue:27`, `overflow-x-auto` sur `TabsList`
  force `overflow-y: auto`, et l'onglet actif déborde d'1 px (`-mb-px`,
  `ui/tabs/TabsTrigger.vue:84`).
- **Corrigé** : cause confirmée. `TabsList` prend `pb-px`, qui loge le pixel
  du repère dans la barre, et `overflow-y-hidden`.

<a id="e-14"></a>

### E-14 — API Action : l'aide s'ouvre au clic, plus au survol

- **Issue** : #1132
- **Fonctions** : API-08.
- **Cause** : `ApiAction/QueryCard.vue:80-107` remplace le popover par un
  `DropdownMenu` ; le commentaire cite ADR-0012, qui ne le décide pas.
- **Tranché** : comportement v5 conservé,
  [ADR-0046](../adr/0046-aide-api-action-au-clic.md).

<a id="e-15"></a>

### E-15 — Champ fichier natif, dans la langue du navigateur

- **Issue** : #1133
- **Fonctions** : COLF-03, USR-13, ENV-11 (C07, C44, C96).
- **Symptôme** : « Choisir un fichier / Aucun fichier choisi » dans une
  interface en anglais.
- **Cause** : `<input type="file">` natif à la place de `b-form-file` ;
  décidé dans `MIGRATION.md` (§ 3, « champ fichier »), sans ADR.
- **Corrigé** : primitive `ui/file-input` — l'input natif reste le contrôle,
  masqué ; le cadre affiche le texte de la console (« No file chosen »,
  « Browse », le placeholder de la v4) et accepte toujours le dépôt d'un
  fichier.

---

## Écarts visuels — à traiter avec le lot tokens + primitives

La DA ([ADR-0043](../adr/0043-da-kuzzle-pour-la-console.md)) va redéfinir la
palette et les primitives : corriger ces écarts vers la v4 maintenant serait
du travail jeté. Ils servent de **cahier des charges** au lot : chaque sens que
la v4 portait par la couleur (succès, erreur, information, texte secondaire)
doit exister dans la nouvelle palette.

<a id="e-20"></a>

### E-20 — `text-secondary` est bleu, les destructifs sont roses

- **Issue** : #1134
- **Fonctions** : ENV-02, AUTH-03, TREE-01, IDX-01, IDX-03, IDX-04, COL-01,
  COL-07, COLF-02, FLT-01, FLT-03, FLT-08, FLT-09, USR-01, USR-07, USR-08,
  USR-13.
- **Symptôme** : tout ce qui était gris secondaire est bleu `#3498db` (textes
  d'aide, compteurs, icônes, états vides) ; sur COLF-02 et USR-13, le lien de
  l'aide ne se distingue plus du texte. Les boutons destructifs sont roses
  `#e94e77` au lieu de rouges ; la variante `link` des boutons est bleue.
- **Cause** : `assets/tokens.css:33` a repris `$secondary-color` et
  `$red-color` de `_variables.scss`. La v4 ne surchargeait que `primary` : elle
  rendait les couleurs Bootstrap par défaut (secondary `#6c757d`, danger
  `#dc3545`, info `#17a2b8`). 45 occurrences de `text-secondary` dans 23
  fichiers ; `ui/button/Button.vue:75` pour `link`.
- **Corrigé** avec la palette de la DA : `--secondary` devient le fond pâle
  des tags, et les 45 `text-secondary` passent à `text-muted-foreground` (texte
  secondaire) ou `text-primary` (liens, dont ceux de l'aide de COLF-02 et
  USR-13) ; la variante `link` des boutons est fuchsia ; `--destructive` est le
  rouge `#DC3545` du DS.

<a id="e-21"></a>

### E-21 — Plus de variante « info » ni « success »

- **Issue** : #1134
- **Fonctions** : AUTH-05, AUTH-06, AUTH-10, AUTH-11, RT-02, RT-06, FLT-02,
  DOC-07, API-04, ENV-03 ; encadré Notice de Security (C103, C104, C114).
- **Symptôme** : alertes et toasts cyan devenus jaunes ou blancs, badges
  turquoise gris. Sur API-04, le statut 200 est bleu au lieu de vert et une
  erreur n'est plus rouge — la couleur y portait le sens. RUN n'est plus vert ;
  la pastille « new documents » promet toujours de « turn green ».
- **Cause** : `Alert`, `Toast`, `Badge` et `Button` n'ont pas de variante
  `info` ; `ApiAction/ResponseCard.vue:59-63` renvoie encore `secondary` /
  `danger`, que `ui/alert/Alert.vue` ne connaît pas.
- **Corrigé** avec la palette de la DA : tokens `--success`, `--warning` et
  `--info`, variantes `info` et `success` sur `Alert`, `Toast`, `Badge` et
  `Button`. Les alertes et toasts cyan de la v4 repassent en `info`, les
  pastilles « Filters are being applied » et « controller : action » aussi ;
  `ResponseCard` renvoie `success` / `destructive` ; la pastille « new
  documents » devient verte, comme son infobulle le promet. **Voulu** : RUN
  reste fuchsia, c'est l'action principale de l'écran (« The One Accent Rule »).
- **Reste** : le marquage des champs valides de la v4 (bordure verte et coche
  sur ENV-03, C02), reporté d'[E-08](#e-08). La couleur existe désormais
  (`--success`) ; il viendra avec les primitives de formulaire.

<a id="e-22"></a>

### E-22 — Titres d'états vides réduits, fonds gris perdus

- **Issue** : #1134
- **Fonctions** : IDX-03, IDX-04, COL-07, DOC-10, CHT-04, MAP-04, RT-04,
  FLT-08, FLT-09, USR-07.
- **Cause** : les `<h4>` restés bruts tombent à la taille du texte (preflight),
  les autres passent de `h2`/`h3` à `text-lg`/`text-xl` ; `bg-variant="light"`
  n'est pas repris. [ADR-0022](../adr/0022-retrait-de-bootstrap-et-preflight.md)
  § 3 veut qu'un titre porte sa taille, sans décider de la réduire.
  `Common/Filters/{FavoriteFilters,HistoryFilter}.vue` portent encore des
  classes Bootstrap (`list-group`, `h4`).
- **Tranché par la DA** : les titres d'états vides prennent l'échelle du DS,
  « Headline » (Montserrat 800, 26 px) pour les grands états à icône,
  « Title » (Ubuntu 700, 16 px) pour les états en ligne (tableaux, filtres).
  Le fond gris de la v4 n'est pas repris : les cartes blanches se détachent
  désormais du fond de page (Page Mist).

<a id="e-23"></a>

### E-23 — Libellés au-dessus des champs

- **Issue** : #1134
- **Fonctions** : ENV-01, AUTH-01, COLF-01, DOCF-01, USR-08, et tous les
  formulaires en `label-cols` (C01, C05, C10, C13, C14, C15, C44, C70, C94).
- **À trancher par la DA** : disposition décidée par personne ; les champs
  désactivés ont aussi perdu leur fond gris (C45).
- **Tranché par la DA** : les libellés restent au-dessus des champs, en
  capitales, style « Label » du DS (Ubuntu 700, 11 px, +0,07em, Label Slate).
  Les libellés d'option (case « Use SSL », « Remove anonymous user
  credentials ») restent en casse normale. **Reste** : le fond des champs
  désactivés, avec les primitives de formulaire.

<a id="e-24"></a>

### E-24 — Bandeaux gris perdus : jumbotron, en-têtes et pieds de carte

- **Issue** : #1134
- **Fonctions** : ENV-01, ENV-06 (C01, C03), FLT-01, USR-02 (C50, C90).
- **Symptôme** : l'en-tête des pages de connexion n'est plus dans son bloc gris
  (alors que `Signup.vue` et `KuzzleErrorPage.vue` l'ont gardé) ; les
  `card-header` / `card-footer` gris disparaissent ; la carte de recherche
  rapide garde une bande vide sous la barre.
- **Cause** : `CreateEnvironmentPage.vue:4-18`, `SelectEnvironmentPage.vue` ;
  `ui/card/Card.vue` impose `py-6`, que `Common/Filters/Filters.vue:2`
  n'annule pas.

<a id="e-25"></a>

### E-25 — Tableaux : ni lignes alternées, ni bordures de cellules

- **Issue** : #1134
- **Fonctions** : IDX-01, COL-01 (C32, C40), CLM-02 (C64).
- **Cause** : `striped` et `bordered` de `b-table` ne sont pas repris ;
  [ADR-0011](../adr/0011-table-sans-data-table.md) ne décide pas de les
  retirer. En-têtes réduits à 12 px gris.

<a id="e-26"></a>

### E-26 — Variantes de boutons converties sans décision

- **Issue** : #1134
- **Partout** : `secondary` plein (Cancel, Export Mapping, Generate Raw JSON)
  → `outline` ; `outline-danger` → `destructive` plein, rose même désactivé ;
  `light` → `outline` ; « Delete index / collection » passent en rouge.
- **À trancher par la DA.**

---

## Hors écarts

- **Police** : la v5 s'affiche en Ubuntu sur la machine de capture parce que la
  police y est installée ; aucune des deux versions ne la charge. Le lot tokens
  la chargera.
- **Corrections de la v5** : le tri des index fonctionne (il ne faisait rien en
  v4, G-022) ; le bouton « Quick Search » aussi ; l'historique des filtres
  n'enregistre plus une entrée par caractère. Reste un doublon : un Entrée
  enregistre deux entrées (`QuickFilter.vue`, `submitNow`).
- **Non vérifiable sur la planche** : PRF-07 et ROL-05 (la session de capture
  est anonyme : l'avertissement « applies to yourself » et la modale Revoke ne
  s'atteignent pas) — vérifiés dans le code.
