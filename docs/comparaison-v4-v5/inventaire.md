# Inventaire fonctionnel de la v4 — liste de contrôle

> Étape 1 de la comparaison v4 / v5 ([ADR-0043](../adr/0043-da-kuzzle-pour-la-console.md),
> *Séquence*). Méthode et suite : [`README.md`](README.md).

**Source** : `4-dev` au commit `d6134eaa` (2026-09-25), celui que déploie
next-console.kuzzle.io. L'inventaire part du routeur (`src/routes/`) et descend
dans chaque composant rendu, jusqu'aux modales et aux états vides. Les
composants de la v4 que la v5 a supprimés parce qu'ils n'étaient pas
atteignables ([ADR-0016](../adr/0016-supprimer-le-code-non-atteignable.md),
§ 4 de `MIGRATION.md`) n'y figurent pas : ils n'étaient pas des fonctions.

**Lecture des colonnes**

- **Id** : identifiant stable de la fonction, repris par l'étape 3.
- **Capture** : l'état d'écran qui la montre (`C01`…). C'est la liste que le
  script de l'étape 2 photographie sur les deux versions. Une fonction sans
  capture est un comportement (tri, persistance) : elle se vérifie par la spec
  ou à la main.
- **Spec** : le fichier de `test/e2e/cypress/integration/single-backend/` qui
  l'exerce, ou `—` si aucune spec ne la couvre. Une fonction sans spec est
  celle qui a le plus de chances d'avoir régressé en silence.
- **v5** : rempli à l'étape 3 — ✅ identique · 🎯 écart voulu (avec son ADR) ·
  🔴 régression · ⛔ manquant.

---

## 1. Connexions (environnements)

Routes : `/create-connection`, `/edit-connection/:id`, `/select-connection`,
plus le sélecteur de la barre de navigation. Composants :
`Common/Environments/*`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| ENV-01 | Page « Create a Connection » : nom, hôte, port, SSL, version de Kuzzle (1 / 2) | C01 | environments | ✅ · [E-23](ecarts.md#e-23) [E-24](ecarts.md#e-24) |
| ENV-02 | Sélecteur de couleur de la connexion, appliquée à la barre de navigation ; erreur si aucune couleur | C01 | environments | ✅ · [E-20](ecarts.md#e-20) |
| ENV-03 | Validation du formulaire (champs requis, nom déjà pris) avec retour visuel | C02 | environments | ✅ · [E-21](ecarts.md#e-21) |
| ENV-04 | Lien « Import connections » depuis la page de création | C01 | environments | ✅ |
| ENV-05 | Page « Edit a Connection », ouverte d'office si la connexion courante est malformée | — | environments | ✅ |
| ENV-06 | Page « Select Kuzzle » : liste des connexions, « Connect to » | C03 | — | ✅ · [E-24](ecarts.md#e-24) |
| ENV-07 | Sélecteur de connexion dans la barre : liste, édition, suppression, « Create new connection » | C04 | environments | ✅ |
| ENV-08 | « Export all » (téléchargement JSON) et « Import » depuis le sélecteur | C04 | environments | ✅ |
| ENV-09 | Modale de création / édition depuis le sélecteur | C05 | environments | ✅ |
| ENV-10 | Modale de suppression : confirmation par saisie du nom | C06 | environments | ✅ |
| ENV-11 | Modale d'import : fichier, validation (« Found N connections »), erreur d'extension | C07 | environments | ✅ |
| ENV-12 | Titre d'onglet du navigateur propre à la connexion | — | environments | ✅ |
| ENV-13 | Mauvaise version de backend : erreur, puis correction possible | — | environments | ✅ |

## 2. Authentification et session

Routes : `/login`, `/signup`, `/reset-password/:token`. Composants :
`Login.vue`, `Signup.vue`, `ResetPassword.vue`, `Common/Login/*`, `Home.vue`,
`TelemetryBanner.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| AUTH-01 | Login : identifiant, mot de passe, « Connected to <connexion> » | C10 | login | ✅ · [E-23](ecarts.md#e-23) |
| AUTH-02 | Login par stratégie (un bouton par stratégie d'authentification) | C10 | — | ✅ |
| AUTH-03 | « Login as Anonymous » | C10 | login | ✅ · [E-20](ecarts.md#e-20) |
| AUTH-04 | Échec de connexion : « Login failed: … » | C11 | — | ✅ |
| AUTH-05 | Bandeau « no administrator user » sur le login, avec lien vers la création | C12 | — | ✅ · [E-21](ecarts.md#e-21) |
| AUTH-06 | Signup du premier admin : identifiant, mot de passe ×2, case « Remove anonymous user credentials », « Go to Login Page », « Login as Anonymous » | C13 | login | ✅ · [E-21](ecarts.md#e-21) |
| AUTH-07 | Réinitialisation du mot de passe : nouveau ×2, alerte « You must update your password », validation | C14 | resetpassword | ✅ |
| AUTH-08 | Session expirée : modale de reconnexion sans perdre le contexte | C15 | login | ✅ |
| AUTH-09 | Redirection vers le login sans session | — | login | ✅ |
| AUTH-10 | Toast « no administrator user » après connexion, avec « Don't show this toast again » | C16 | — | ✅ · [E-21](ecarts.md#e-21) |
| AUTH-11 | Bandeau de télémétrie : « Accept » / « Disable telemetry », choix retenu | C17 | login | ✅ · [E-21](ecarts.md#e-21) |
| AUTH-12 | Logout (barre de navigation) | C20 | login | ✅ |

## 3. Cadre de l'application

Composants : `Common/MainMenu.vue`, `ConnectionAwareContainer.vue`,
`Common/Offline.vue`, `Error/KuzzleErrorPage.vue`, `404.vue`, `Data/Data404.vue`,
`Common/PageNotAllowed.vue`, `Common/ListNotAllowed.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| APP-01 | Barre de navigation : logo, Data, Security, API Action, onglet actif | C20 | — | ✅ |
| APP-02 | Couleur de la barre = couleur de la connexion | C20 | environments | ✅ |
| APP-03 | Menu « Feedback » : liens externes (Discord…) | C21 | — | ✅ |
| APP-04 | Nom de l'utilisateur connecté, tronqué avec infobulle | C20 | — | ✅ |
| APP-05 | Surcouche « Kuzzle unreachable » quand le backend tombe, disparition au retour | C22 | environments | ✅ |
| APP-06 | Page « Connecting to Kuzzle at … » au démarrage | — | — | ✅ |
| APP-07 | Page d'erreur de connexion (« Something went wrong while connecting ») | — | — | ✅ |
| APP-08 | Page 404 générale, lien retour | C23 | 404 | ✅ |
| APP-09 | 404 d'index ou de collection inexistants (`Data404`) | C24 | 404 | ✅ |
| APP-10 | Pages et listes « not allowed » (droits insuffisants), lien vers le guide | — | — | ✅ |
| APP-11 | Spinner principal pendant les chargements | — | — | ✅ |

## 4. Data — arbre latéral

Composants : `Data/Layout.vue`, `Data/Leftnav/Treeview.vue`,
`Data/Leftnav/IndexBranch.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| TREE-01 | Arbre index → collections, compteur de collections par index, « All indexes » | C30 | treeview | ✅ · [E-20](ecarts.md#e-20) |
| TREE-02 | Filtre « Search index & collection » avec mise en surbrillance, « Show only results » | C31 | treeview | ✅ |
| TREE-03 | Icône par type de collection (volatile / persistée) | C30 | — | ✅ |
| TREE-04 | Dépliage d'un index, « Show More » au-delà d'un seuil, « no collections » | C30 | treeview | ✅ |
| TREE-05 | Barre latérale redimensionnable | — | treeview | ✅ |
| TREE-06 | « You are not allowed to list indexes » | — | — | ✅ |

## 5. Data — index

Route `/data` → `Data/Indexes/Page.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| IDX-01 | Titre « Indexes », tableau des index avec nombre de collections | C32 | indexes | ✅ · [E-20](ecarts.md#e-20) [E-25](ecarts.md#e-25) |
| IDX-02 | Tri par nom et par nombre de collections | — | indexes | 🎯 [ADR-0011](../adr/0011-table-sans-data-table.md) |
| IDX-03 | Filtre de la liste, état « no index matching your filter » | C33 | — | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |
| IDX-04 | État vide « There is no index » | — | — | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |
| IDX-05 | Création : modale, règle de nommage, alerte, doublon refusé | C34 | indexes | ✅ |
| IDX-06 | Actions de ligne : parcourir, créer une collection dans l'index, supprimer | C32 | indexes | ✅ |
| IDX-07 | Suppression : modale, confirmation par saisie du nom | C35 | indexes | ✅ |
| IDX-08 | Sélection (cases, « Toggle all ») et suppression groupée : modale « DELETE » | C36 | indexes | ✅ |
| IDX-09 | Création refusée par les droits : bouton désactivé avec infobulle | — | — | ✅ |

## 6. Data — collections d'un index

Route `/data/:indexName` → `Data/Collections/CollectionList.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| COL-01 | Tableau des collections : type (Realtime / Stored), nom, actions | C40 | collections | ✅ · [E-20](ecarts.md#e-20) [E-25](ecarts.md#e-25) |
| COL-02 | Tri par nom, filtre sur le nom seul, champ de recherche au focus | — | collections | 🎯 [ADR-0011](../adr/0011-table-sans-data-table.md) |
| COL-03 | « Create a collection » | C40 | collections | ✅ |
| COL-04 | Actions de ligne : parcourir, éditer, supprimer (modale avec saisie du nom) | C41 | collections | ✅ |
| COL-05 | Sélection et suppression groupée (modale « DELETE ») ; désactivée pour Kuzzle v1 | C42 | collections | ✅ |
| COL-06 | Menu de l'index : « Delete index » | C43 | collections | ✅ |
| COL-07 | États vides : « no collections », « no collection matching your filter » | — | — | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |

## 7. Data — création et édition d'une collection

Routes `/data/:indexName/create`, `/data/:indexName/:collectionName/edit` →
`Data/Collections/CreateOrUpdate.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| COLF-01 | Nom de la collection : requis, validé, non modifiable en édition | C44 | collections | ✅ |
| COLF-02 | Éditeur JSON du mapping, avec l'exemple et les liens de doc (mappings, dynamic policy) | C44 | collections | 🔴 [E-20](ecarts.md#e-20) |
| COLF-03 | Import du mapping depuis un fichier JSON | C44 | — | ✅ |
| COLF-04 | « Export Mapping » | C45 | collections | ✅ |
| COLF-05 | Erreur JSON signalée dans l'éditeur | — | JSONEditor | ✅ |

## 8. Data — documents d'une collection

Route `/data/:indexName/:collectionName` → `Data/Documents/Page.vue`, ses vues
(`Views/*`) et les filtres (`Common/Filters/*`).

### 8.1 En-tête et actions

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| DOC-01 | Nom de la collection en titre | C50 | — | ✅ |
| DOC-02 | Menu « View » : List, Column, Chart, Map, Realtime ; vues indisponibles grisées avec raison | C51 | docs, chartView, collections | 🎯 [ADR-0012](../adr/0012-primitive-dropdown-menu-en-vue-2.md) |
| DOC-03 | Menu d'actions : « Edit collection », « Delete collection », « Clear documents » (droits en infobulle) | C52 | collections | ✅ |
| DOC-04 | Modale « Clear » : confirmation par saisie du nom | C53 | collections | ✅ |
| DOC-05 | « Create New Document » | C50 | docs | ✅ |
| DOC-06 | « Refresh » et bascule « Auto-Sync » (retenue au rechargement) | C54 | docs | ✅ |
| DOC-07 | Pastille « nouveaux documents » : grise, verte quand il y en a, clic = rafraîchir | C50 | docs | 🔴 [E-21](ecarts.md#e-21) |
| DOC-08 | Pagination, sélecteur « Show N of M total items » | C50 | search | ✅ |
| DOC-09 | Message au-delà de 10 000 documents (limite Elasticsearch) | — | docs | ✅ |
| DOC-10 | État vide : « No documents matching your filters », « There are new documents » | C55 | — | ✅ · [E-22](ecarts.md#e-22) |

### 8.2 Filtres

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| FLT-01 | Quick Search, persistée dans l'URL et d'une collection à l'autre | C56 | search | ✅ · [E-20](ecarts.md#e-20) [E-24](ecarts.md#e-24) |
| FLT-02 | Pastille « Filters are being applied », « Reset » | C56 | search | ✅ · [E-21](ecarts.md#e-21) |
| FLT-03 | Filtre avancé : groupes OR de conditions AND, attribut (autocomplétion), opérateur, valeur | C57 | search | ✅ · [E-20](ecarts.md#e-20) |
| FLT-04 | Opérateur « range » à deux valeurs | C57 | search | ✅ |
| FLT-05 | Tri (attribut, ordre) ; refus du tri sur un champ `text` | C57 | search | ✅ |
| FLT-06 | « Generate Raw JSON » : passage du filtre avancé au JSON | — | search | ✅ |
| FLT-07 | Onglet « Raw JSON » : éditeur, erreur de JSON, tri | C58 | search | ✅ |
| FLT-08 | Onglet « History » : liste, réutiliser, supprimer, ajouter aux favoris, état vide | C59 | search | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |
| FLT-09 | Onglet « Saved » : favoris, renommer, utiliser, supprimer, état vide | C60 | search | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |
| FLT-10 | Plein écran des filtres, fermeture | C61 | search | ✅ |

### 8.3 Vue liste

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| LST-01 | Une ligne par document : `_id`, dépliage du contenu JSON | C62 | docs | ✅ |
| LST-02 | Case par ligne, « Toggle all », « Delete » groupé | C62 | docs | ✅ |
| LST-03 | Éditer / supprimer par ligne, droits en infobulle | C62 | docs | ✅ |
| LST-04 | Modale de suppression d'un ou plusieurs documents | C63 | docs | ✅ |

### 8.4 Vue colonnes

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| CLM-01 | Sélecteur de champs (multiselect) avec ajout d'un champ libre, « Reset » | C64 | docs | 🎯 [ADR-0034](../adr/0034-vue-multiselect-3-plutot-qu-un-combobox.md) |
| CLM-02 | Tableau : une colonne par champ, `null` / `undefined` / `array` / `object` signalés | C64 | docs | ✅ · [E-25](ecarts.md#e-25) |
| CLM-03 | Sélection, édition, suppression par ligne ; « Toggle all », « Delete » | C64 | docs | ✅ |
| CLM-04 | Export CSV : préparation puis lien de téléchargement | C65 | — | ✅ |
| CLM-05 | Réglages de colonnes retenus d'une collection à l'autre | — | docs | ✅ |

### 8.5 Vue graphique

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| CHT-01 | Choix du champ date | C66 | chartView | ✅ |
| CHT-02 | Ajout de champs numériques, plusieurs à la fois, suppression | C66 | chartView | ✅ |
| CHT-03 | Couleur de chaque série (sélecteur de couleur) | C66 | chartView | 🎯 [ADR-0035](../adr/0035-selecteur-de-couleur-natif.md) |
| CHT-04 | États : « You must select at least one field », « No data », mapping sans date ni nombre | C67 | chartView | ✅ · [E-22](ecarts.md#e-22) |

### 8.6 Vue carte

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| MAP-01 | Choix du champ `geo_point` ou `geo_shape` | C68 | docs | ✅ |
| MAP-02 | Marqueurs et formes sur la carte | C68 | docs | ✅ |
| MAP-03 | Carte du document sélectionné : `_id`, éditer, supprimer, fermer | C69 | docs | ✅ |
| MAP-04 | États « No document selected », « does not contain geo_point field » | — | docs | ✅ · [E-22](ecarts.md#e-22) |

## 9. Data — création et édition d'un document

Routes `/data/:i/:c/create`, `/data/:i/:c/update/:id` →
`Data/Documents/Create.vue`, `Update.vue`, `Common/CreateOrUpdate.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| DOCF-01 | « Document ID » (optionnel à la création) | C70 | docs | ✅ · [E-23](ecarts.md#e-23) |
| DOCF-02 | Éditeur JSON du document et panneau « Mapping » | C70 | docs | ✅ |
| DOCF-03 | Bascule « Form view », synchronisée avec le JSON | C71 | formView | ✅ |
| DOCF-04 | Avertissement « fields are not supported in the form view » | C71 | formView | ✅ |
| DOCF-05 | Champs date / heure du formulaire | C71 | formView | 🎯 [ADR-0015](../adr/0015-pas-de-primitive-calendar.md) |
| DOCF-06 | « Create », « Update », « Replace », « Cancel » | C70 | docs, formView | ✅ |
| DOCF-07 | Avertissement d'édition concurrente (« edited while you were editing it ») | — | — | ✅ |

## 10. Data — temps réel (Watch)

Route `/data/:i/:c/watch` → `Data/Collections/Watch.vue`,
`Data/Realtime/Notification.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| RT-01 | En-tête : nom de la collection, suppression de la collection | C80 | — | ✅ |
| RT-02 | Filtres (mêmes onglets que § 8.2), affichage / masquage, pastille « applied » ou « contains errors » | C81 | watch | ✅ · [E-21](ecarts.md#e-21) |
| RT-03 | « Subscribe » / « Unsubscribe », « Reset filters » (réinitialise et désabonne) | C80 | watch | ✅ |
| RT-04 | Alertes : « You did not subscribe yet », « Waiting for notifications… » | C80 | watch | ✅ · [E-22](ecarts.md#e-22) |
| RT-05 | Liste des notifications : en-tête (controller : action, heure), dépliage du contenu | C82 | watch | ✅ |
| RT-06 | « Received N notifications », « Clear all notifications », « Latest notification (…) » | C82 | watch | ✅ · [E-21](ecarts.md#e-21) |
| RT-07 | Nombre de notifications affichées limité | — | watch | ✅ |
| RT-08 | Couleur de la notification selon sa famille (publish, document, subscribe, delete) | C82 | — | ✅ |
| RT-09 | « You are not allowed to watch realtime messages » | — | — | ✅ |

## 11. Security — utilisateurs

Routes `/security/users`, `/security/users/create`, `/security/users/:id`,
`/security/users/custom-mapping`. Composants : `Security/Layout.vue`,
`Security/Users/*`, `Common/Breadcrumb.vue`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| SEC-01 | Onglets Users / Profiles / Roles, fil d'Ariane | C90 | users | ✅ |
| USR-01 | Liste : KUID, nom d'utilisateur de la stratégie `local`, profils, dépliage du contenu | C90 | users | ✅ · [E-20](ecarts.md#e-20) |
| USR-02 | Quick search, recherche avancée, recherche JSON | C91 | users | ✅ · [E-24](ecarts.md#e-24) |
| USR-03 | Sélection, « Toggle all », « Delete selected », modale de suppression | C92 | users | ✅ |
| USR-04 | Éditer / supprimer par ligne, droits en infobulle | C90 | users | ✅ |
| USR-05 | Pagination, paramètre `from` erroné toléré | — | users | 🎯 [ADR-0045](../adr/0045-pagination-masquee-sur-une-page.md) |
| USR-06 | « Create User », menu « Edit user content mapping » | C90 | users | ✅ |
| USR-07 | États vides : « No user is defined », « no result matching your query » | — | users | ✅ · [E-20](ecarts.md#e-20) [E-22](ecarts.md#e-22) |
| USR-08 | Formulaire, onglet Basic : KUID (vide = auto-généré), profils (sélection, pastilles, retrait), « Please add at least one profile » | C93 | users | ✅ · [E-20](ecarts.md#e-20) [E-23](ecarts.md#e-23) |
| USR-09 | Onglet Credentials : champs par stratégie, « No strategies found » | C94 | users | ✅ |
| USR-10 | Onglet Custom : contenu JSON et mapping | C95 | users | ✅ |
| USR-11 | Icône d'erreur sur l'onglet fautif, « Save » / « Create » / « Cancel » | C93 | users | ✅ |
| USR-12 | Utilisateur avec beaucoup de profils | — | users | ✅ |
| USR-13 | Mapping personnalisé : éditeur, import de fichier, export, « Save » | C96 | users | 🔴 [E-20](ecarts.md#e-20) |

## 12. Security — profils

Routes `/security/profiles`, `/security/profiles/create`,
`/security/profiles/:id`. Composants : `Security/Profiles/*`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| PRF-01 | Liste des profils, dépliage des politiques | C100 | profiles | ✅ |
| PRF-02 | Filtre par rôles (multiselect), pastille « applied », « Reset » | C101 | profiles | ✅ |
| PRF-03 | Sélection, « Toggle all », « Delete selected », modale | C102 | profiles | ✅ |
| PRF-04 | Éditer / supprimer par ligne, pagination | C100 | profiles | 🎯 [ADR-0045](../adr/0045-pagination-masquee-sur-une-page.md) |
| PRF-05 | « Create Profile », état « No profile is defined » | C100 | profiles | ✅ |
| PRF-06 | Formulaire : « Profile ID », éditeur JSON, aide-mémoire (policies, restrictedTo), validation | C103 | profiles | ✅ |
| PRF-07 | Avertissement « you are editing a profile that applies to yourself » | C104 | — | ✅ |

## 13. Security — rôles

Routes `/security/roles`, `/security/roles/create`, `/security/roles/:id`.
Composants : `Security/Roles/*`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| ROL-01 | Liste des rôles, dépliage des contrôleurs | C110 | roles | ✅ |
| ROL-02 | Filtre par contrôleur, « Reset », « Unable to retrieve controller list » | C111 | roles | ✅ |
| ROL-03 | Sélection, « Delete selected », modale | C112 | roles | ✅ |
| ROL-04 | Éditer / supprimer par ligne, pagination | C110 | roles | 🎯 [ADR-0045](../adr/0045-pagination-masquee-sur-une-page.md) |
| ROL-05 | « Revoke anonymous rights » : bouton (désactivé avec raison si impossible) et modale | C113 | roles | ✅ |
| ROL-06 | « Create Role », état « No role is defined » | C110 | roles | ✅ |
| ROL-07 | Formulaire : « Role ID », éditeur JSON, aide-mémoire (controllers / actions), validation | C114 | roles | ✅ |
| ROL-08 | Avertissement « you are editing a role that applies to yourself » | — | — | ✅ |

## 14. API Action

Route `/api-action` → `ApiAction.vue`, `ApiAction/*`.

| Id | Fonction | Capture | Spec | v5 |
|---|---|---|---|---|
| API-01 | Onglets de requêtes, « + » pour en ouvrir un, requête retenue par onglet | C120 | api-actions | 🔴 [E-13](ecarts.md#e-13) |
| API-02 | Contrôleur et action : saisie libre et autocomplétion (`<datalist>` natif, invisible sur une capture) ; pas d'options sans droits | — | api-actions | ✅ |
| API-03 | Éditeur JSON de la requête, « The query is invalid » | C120 | api-actions | ✅ |
| API-04 | « RUN » ; carte « Response » avec statut et JSON | C122 | api-actions | 🔴 [E-21](ecarts.md#e-21) |
| API-05 | « SAVE » : modale « Choose a name for this query » | C123 | api-actions | ✅ |
| API-06 | Liste des requêtes enregistrées : ouvrir, lancer, éditer ; état vide ; par connexion | C120 | api-actions | ✅ |
| API-07 | Panneaux redimensionnables (liste / requête / réponse) | — | — | 🎯 [ADR-0021](../adr/0021-reprise-apiaction-splitter-et-onglets.md) |
| API-08 | Texte d'accueil avec lien vers la documentation de l'API | C120 | — | 🎯 [ADR-0046](../adr/0046-aide-api-action-au-clic.md) |

---

## Chiffres

- **14 domaines, 153 fonctions**, dont **30 sans spec** (colonne *Spec* à
  `—`) : c'est là que l'étape 3 regardera en premier.
- **78 états d'écran** à capturer sur chaque version (`C01` à `C123`, numérotés
  par domaine avec des trous pour en ajouter) ; 29 fonctions n'ont pas de
  capture et se vérifient par leur spec ou à la main.
- **1 écart voulu déjà connu** (CHT-03, [ADR-0035](../adr/0035-selecteur-de-couleur-natif.md)).
  Les autres écarts voulus attendus : le système de toasts
  ([ADR-0020](../adr/0020-systeme-de-toasts.md)) touche AUTH-10, APP-05 et les
  retours de chaque action ; la sortie de Bootstrap
  ([ADR-0022](../adr/0022-retrait-de-bootstrap-et-preflight.md)) touche tout.
