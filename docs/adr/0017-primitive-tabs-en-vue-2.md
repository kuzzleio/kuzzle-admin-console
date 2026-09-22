# ADR-0017 : primitive `Tabs` écrite à la main, pilotée par valeur et non par rang

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

`<b-tabs>` apparaît dans **trois** fichiers, sur les deux derniers domaines à
reprendre : `Security/Users/CreateOrUpdate.vue` (Basic / Custom),
`Security/Users/Steps/CredentialsSelector.vue` (une entrée par stratégie
d'authentification, en vertical) et `Common/Filters/Filters.vue` (Quick / Basic
/ Raw). Le troisième est le plus regardé de la console : `search.spec.js`
clique `[data-cy="Filters-basicTab"]` **dix fois**.

Trois observations pèsent sur la décision.

**1. L'amont a la primitive, et elle est simple.** shadcn-vue expose
`Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`, sans dépendance à un
moteur de positionnement : pas de panneau flottant, pas de placement à calculer.
C'est la différence avec `Dialog` (ADR-0010), `DropdownMenu` (ADR-0012) et
`Select` (ADR-0014), qui ont chacun demandé du travail parce qu'ils flottent.
Ici, tout est dans le document.

**2. `b-tabs` pilote l'onglet courant par un rang.** `Security/Users/CreateOrUpdate.vue`
lui passait `:active="activeTab"` **avec une chaîne** (`'basic'`), plus une prop
`:object-tab-active` qui n'existe pas dans `bootstrap-vue` et un événement
`@tab-changed` qu'il n'émet pas. Autrement dit : le pilotage de cet écran ne
faisait rien du tout, et personne ne s'en était aperçu parce que l'onglet par
défaut est le bon.

**3. Le panneau caché reste monté.** `b-tabs` rend tous ses panneaux et masque
les inactifs. Sur le formulaire utilisateur, cela veut dire que les champs de
l'onglet « Custom » existent pendant qu'on remplit « Basic » — avec leurs `id`,
et dans le même formulaire.

## Décision

**1. La primitive est écrite à la main**, comme les trois précédentes, avec
l'API publique de shadcn-vue (ADR-0009) : `Tabs`, `TabsList`, `TabsTrigger`,
`TabsContent`.

**2. Un onglet est désigné par une valeur, pas par son rang.** `TabsTrigger` et
`TabsContent` prennent tous deux `value`. Un rang change dès qu'un onglet
apparaît sous condition — et la console en a : les stratégies
d'authentification sont une liste venue du backend.

**3. `TabsContent` ne rend que l'onglet courant** (`v-if`, pas `v-show`). Un
panneau masqué garde ses `id` et ses champs dans le formulaire ; c'est ce qui
fait qu'un `id` en double passe inaperçu jusqu'au jour où une spec le vise.

**4. La barre d'onglets est un seul arrêt de tabulation.** `tabindex="0"` sur
l'onglet courant, `-1` sur les autres, et les flèches déplacent la sélection —
le motif ARIA du *tablist*. `b-tabs` laissait les trois déclencheurs tabulables,
donc trois arrêts pour un seul choix. `Home` et `Fin` vont au premier et au
dernier.

**5. Les flèches des deux axes sont acceptées dans les deux orientations.**
Haut/bas et gauche/droite font la même chose. Le motif ARIA n'en demande qu'un
selon `aria-orientation` ; punir quelqu'un qui appuie sur la mauvaise flèche
n'apporte rien.

**6. Le slot `#empty` de `b-tabs` n'est pas repris.** Une barre d'onglets vide
n'est pas un cas particulier du composant, c'est un cas particulier de l'écran :
`CredentialsSelector` teste `strategies.length` et rend son message lui-même.

## Conséquences

### Positives

- Les trois derniers `<b-tabs>` de la console peuvent partir, dont celui des
  filtres — le composant le plus couvert par les specs.
- Le formulaire utilisateur perd `activeTabObject` et `setActiveTabObject`, deux
  membres qui ne servaient qu'à une prop inexistante.
- Un onglet annonce enfin son état : `role="tab"`, `aria-selected`,
  `aria-controls`, et le panneau `role="tabpanel"` avec `aria-labelledby`.

### Négatives

- Le contenu d'un onglet est **démonté** quand on en change. Un champ à demi
  rempli dans un onglet qu'on quitte perd son état local si le site d'appel ne
  le stocke pas lui-même. Les trois sites d'appel remontent déjà leur état au
  parent ; c'est une contrainte à connaître pour le quatrième.
- Une transition d'apparition n'est pas fournie. `b-tabs` n'en avait pas non
  plus.

### Risques acceptés

- Le repère visuel de l'onglet courant est une bordure posée par la primitive,
  pas encore un token dédié. Il bougera avec la refonte, comme le reste.

## Alternatives écartées

- **Garder `b-tabs` jusqu'à la phase 3.** C'est le dernier composant
  `bootstrap-vue` partagé entre Security et Common ; le garder, c'était bloquer
  deux domaines pour un composant sans panneau flottant, donc le moins cher de
  tous.
- **Rendre tous les panneaux et masquer les inactifs**, comme l'amont
  bootstrap. Refusé pour la raison donnée en 3 : un champ invisible qui
  participe au formulaire est un piège, pas une optimisation.
- **Piloter par rang pour rester compatible avec les sites d'appel.** Aucun des
  trois ne pilotait réellement par rang — l'un croyait le faire par nom, les
  deux autres ne pilotaient pas du tout.
