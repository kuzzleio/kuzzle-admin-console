# ADR-0024 : vider la couche `legacy` de ce qui ne style plus rien, et nommer ce qui reste

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

La couche `legacy` d'[ADR-0008](0008-cohabitation-tailwind-bootstrap.md) est le
dernier des trois réglages de cohabitation encore debout : le preflight est
entré avec [ADR-0022](0022-retrait-de-bootstrap-et-preflight.md), le préfixe
`tw:` est sorti avec [ADR-0023](0023-retrait-du-prefixe-tw.md).

Elle contenait neuf feuilles SCSS, soit **781 lignes** écrites pour une console
qui n'existe plus : Materialize (`.input-field`, `.preloader-wrapper`), puis
Bootstrap 4 (`.row`, `.btn-flat`, `.flex-grow`), puis les deux écrans refaits en
phase 2. Personne ne savait laquelle servait encore.

La question n'est pas « peut-on supprimer la couche ? » — non, `vfg.css` y est,
et n'en sortira qu'avec `vue-form-generator`. Elle est : **que reste-t-il
dedans qui style réellement quelque chose ?**

## Décision

**1. Ce qui ne style plus rien part.** Quatre feuilles disparaissent en entier —
`_variables.scss`, `_animations.scss`, `_pages.scss`, `_utility.scss` — et les
règles mortes des cinq autres avec elles.

| Feuille | Sort | Reste |
|---|---|---|
| `_animations.scss` (445 l.) | 14 `@keyframes` et 6 classes `slideIn*`/`slideOut*`, dont **aucune n'était référencée ailleurs que par elle-même** | la règle `input:-webkit-autofill`, qui rejoint `_layout.scss` |
| `_pages.scss` (41 l.) | tout : `.signup`, `.message-warning`, `.divider`, `.preloader-wrapper`, `.input-field` | — |
| `_utility.scss` (31 l.) | tout : `.error`, `.empty-set`, `.text-stroked`, et `.pointer` dont l'unique site passe à `cursor-pointer` | — |
| `_variables.scss` (72 l.) | tout — ses trois dernières variables vivantes étaient des doublons de tokens | — |
| `_environment.scss` | le bloc `.environment` : ses descendants (`.row`, `.input-field`, `.color-picker`, `.btn-flat`) ont disparu avec la reprise de `CreateEnvironment` | la palette `EnvColor--*` |
| `_realtime.scss` | les cinq `message-*` et leurs variables de couleur | `.realtime-highlight` et ses cinq états |
| `_override.scss` | `.light-shadow`, `.vertical-align`, `.flex-grow`, `.text-small` | la règle `json-formatter-row` |
| `_layout.scss`, `_fonts.scss` | — | `html`/`body`, `.full-screen`, `.code` |

**2. Ce qui reste porte sa raison d'être en tête de fichier.** Une feuille
legacy sans justification écrite redevient indéchiffrable au lot suivant : on
ne sait pas si elle est vivante ou si personne n'a osé y toucher.

**3. Les règles mortes des `<style>` de composants partent dans le même geste.**
Elles ne sont pas dans la couche `legacy`, mais elles sont la même dette, et
elles sont **pires** : un `<style>` de composant est hors couche, donc il bat
les utilitaires Tailwind, quelle que soit la spécificité.

| Fichier | Règles retirées | Bibliothèque partie |
|---|---|---|
| `ApiAction.vue` | `.Custom-resizer-vertical`, `.DataLayout-*-vertical`, `.tabsHeight`, `.card-title`, `.titleItem`, `.tab-pane`, `.tabs` | `vue-multipane` ([ADR-0021](0021-reprise-apiaction-splitter-et-onglets.md)), `b-tabs` ([ADR-0017](0017-primitive-tabs-en-vue-2.md)) |
| `QueryCard.vue` | le bloc entier : `.QueryLayout-*-vertical`, `.Query-Custom-resizer-vertical`, `.multipaneRow` | `vue-multipane` |
| `QueryList.vue` | `.list-item` | — |
| `Column.vue` | `.inlineDisplay`, `.dropdownScroll`, `.columnClass`, `.valueDisplayer`, `.dropdown-text`, `.max-w-24rem` | `b-dropdown-text` |

**4. Les trois dernières variables SCSS deviennent des tokens.**
`$light-grey-color` valait `#f5f5f5`, c'est-à-dire `--muted` ; `$sidebar-width`
valait `252px`, c'est-à-dire `--sidebar-width`, que `Data/Layout` et
`Security/Layout` utilisaient **déjà** sous sa forme token. `ApiAction` était le
seul à lire encore la forme SCSS. Deux définitions de la même valeur, dont une
seule est celle qu'on changera en refondant la charte.

**5. La couche `legacy` reste déclarée.** `vfg.css` et FontAwesome y sont
toujours. La retirer demande de sortir `vue-form-generator` : c'est la phase 3.

## Conséquences

### Un audit d'usage qui lit les attributs `class` ment — dans les deux sens

C'est le point à retenir, et il a failli coûter trois suppressions fausses.

**Une classe absente des templates peut être bien vivante.** Trois mécanismes
la posent sans qu'aucun attribut `class` ne la contienne :

- **construite à l'exécution** — `` :class="`EnvColor--${color}`" `` dans
  `MainMenu` et `CreateEnvironment`. Un grep sur `EnvColor--darkblue` ne
  retourne rien ;
- **posée en JavaScript** — `this.$el.classList.add(getBadgeText(n.action))`
  dans `DocumentListItem`, `HighlightableRow` et `TableCell`. Les cinq états de
  `.realtime-highlight` (`updated`, `replaced`, `changed`, `deleted`,
  `created`) ne sont écrits nulle part comme des classes ;
- **rendue par une bibliothèque** — `ace_*`, `multiselect__*`,
  `json-formatter-row`. Ces classes n'apparaîtront jamais dans notre code, et
  les règles qui les visent sont précisément celles qu'on ne peut pas remplacer
  par un utilitaire.

**Et une règle présente dans la feuille ne prouve pas qu'on l'utilise** —
c'est la conséquence symétrique, déjà relevée en ADR-0023 : le scanner de
Tailwind v4 émet des utilitaires pour des mots qu'il prend pour des classes.

La méthode retenue est donc en trois temps, et le troisième n'est pas
négociable : croiser les classes définies avec **toutes** les chaînes du code
(pas seulement les attributs `class`), écarter à la main ce qui est rendu par
une bibliothèque, puis **exécuter les specs**. Le détail est en G-037.

### Positives

- **781 lignes de SCSS → 122**, et **−9,1 ko de CSS** dans le bundle
  (135,3 ko → 126,2 ko), après les −1 042 ko d'ADR-0022.
- Ce qui reste est lisible : cinq feuilles courtes, chacune avec sa raison
  écrite. Le prochain lot saura quoi ne pas toucher.
- Plus aucune règle ne vise `vue-multipane`, `b-tabs` ou `b-dropdown-text` :
  les bibliothèques et leurs styles sont partis ensemble, ce qui n'était pas le
  cas depuis ADR-0017 et ADR-0021.
- Une seule définition pour `--sidebar-width` et `--muted`.

### Négatives

- La couche `legacy` reste, avec son coût de compréhension. Elle ne part qu'en
  phase 3.
- `_environment.scss` garde des couleurs en dur, contraire à la règle « pas de
  valeur de design dans un composant ». Elles rejoindront les tokens quand la
  charte des connexions sera reprise ; les déplacer aujourd'hui aurait mêlé une
  décision de design à un ménage.

### Risques acceptés

- **Une règle vivante a pu être supprimée sans que rien ne le signale.** Les 17
  specs couvrent les parcours, pas l'apparence : une couleur perdue ou une
  marge changée passe. Le risque est borné par le fait que chaque suppression a
  été vérifiée classe par classe, que les cas dynamiques ont été cherchés
  explicitement, et par une passe de captures avant / après sur les cinq écrans
  touchés — MainMenu, CreateEnvironment, ApiAction, vue Colonne, Users. Il
  n'est pas nul pour autant : il se déclarera à l'œil, pas au test.

Un mot sur cette passe, parce qu'elle a produit un faux positif convaincant :
la première capture d'ApiAction montrait un panneau **vide**, et la
comparaison avec la référence semblait établir une régression. Elle n'en était
pas une — la capture était prise dès que la barre latérale était visible, alors
que la carte de requête se monte après. Mesure faite, l'élément était
simplement `ABSENT` du DOM à cet instant, puis rendu (1084×532) une fraction de
seconde plus tard. **Une capture prise trop tôt est indiscernable d'une mise en
page cassée** : une capture de contrôle doit s'ancrer sur l'élément qu'elle
prétend montrer, jamais sur un voisin déjà présent.

## Alternatives écartées

- **Tout supprimer et voir ce qui casse.** La suite e2e ne teste pas
  l'apparence : elle aurait laissé passer la palette des connexions et la
  surbrillance temps réel, toutes deux posées dynamiquement.
- **Ne rien toucher avant la sortie de `vue-form-generator`.** La couche serait
  restée, mais 659 lignes mortes avec elle — relues, contournées et
  soupçonnées à chaque lot. Le coût de les garder est payé à chaque passage.
- **Déplacer les couleurs de `EnvColor--*` dans les tokens maintenant.** C'est
  une décision de charte, pas un ménage : elle demande de choisir ce que
  deviennent huit couleurs d'environnement dans le thème sombre, qui n'est
  branché sur rien.
