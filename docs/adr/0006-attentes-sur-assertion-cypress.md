# ADR-0006 : Remplacer les attentes à durée fixe par des attentes sur assertion

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

Les 17 specs Cypress sont le seul filet de sécurité du chantier : il n'y a aucun
test unitaire. Toute la phase 2 (réécriture écran par écran) repose sur leur
capacité à distinguer une régression d'un aléa.

Relevé au 2026-09-18 sur `test/e2e/cypress/` : **57 appels à `cy.wait(<durée
fixe>)`** répartis sur 12 fichiers, soit **63 s de sommeil inconditionnel** par
exécution complète de la suite.

| Fichier | Appels | | Fichier | Appels |
|---|---:|---|---|---:|
| `docs.spec.js` | 11 | | `profiles.spec.js` | 4 |
| `collections.spec.js` | 11 | | `api-actions.spec.js` | 4 |
| `environments.spec.js` | 8 | | `search.spec.js` | 3 |
| `users.spec.js` | 7 | | `login.spec.js` | 2 |
| `roles.spec.js` | 4 | | `treeview` / `watch` / `commands.js` | 1 chacun |

Une durée fixe est **toujours fausse dans un sens ou dans l'autre** : trop
longue, elle ralentit la suite sans rien garantir ; trop courte, elle casse dès
que la machine est chargée. Elle n'exprime pas ce qu'on attend, seulement combien
de temps on espère que ça suffira. C'est la cause identifiée en
[G-001](../MIGRATION.md#51-rencontrés) de l'instabilité des specs quand elles
s'enchaînent.

Le point décisif : **la majorité de ces attentes ne servent déjà à rien.**
Classement des 57 appels par ce qu'ils attendent réellement, en regardant la
commande qui suit immédiatement :

| | Catégorie | Appels | Sommeil |
|---|---|---:|---:|
| **A1** | La commande suivante est une assertion **positive** déjà réessayée par Cypress (`.should()`, `cy.contains()`, `cy.location()`, `cy.url()`) | 17 | 20,7 s |
| **A2** | La commande suivante est une assertion **négative** réessayée — « rien ne doit se produire » | 9 | 8,7 s |
| **A3** | Attente de l'indexation Elasticsearch avant un `cy.visit()` | 1 | 1,0 s |
| **B** | La commande suivante est une action non réessayée (`.type()`, `.click()`, écriture dans `sessionStorage`) | 16 | 12,2 s |
| **C** | Attente de l'initialisation de l'éditeur Ace | 5 | 6,5 s |
| **D** | Assertion sur l'état du backend via `cy.request()`, que Cypress ne réessaie pas | 5 | 6,0 s |
| **E** | Réseau simulé (`goOffline` / `goOnline`, toast de reconnexion) | 3 | 8,0 s |
| **F** | Timer applicatif réel (`antiGlitchOverlayTimeout`, dans `support/commands.js`) | 1 | variable |

Les 17 appels d'**A1** sont du **temps mort pur** : Cypress réessaie déjà
l'assertion qui suit pendant 4 s par défaut. Les supprimer ne change strictement
rien au comportement du test, seulement à sa durée.

**A2 est le piège de ce chantier, et il est contre-intuitif.** Ces neuf appels
précèdent une assertion qui vérifie que *rien* ne s'est passé — typiquement,
après la soumission d'un formulaire invalide :

```js
cy.get('[data-cy=RoleCreateOrUpdate-createBtn]').click()
cy.wait(1000)
cy.location().should(location => {
  expect(location.hash).to.equal('#/security/roles/create')  // on n'a PAS navigué
})
```

Le réessai ne protège rien ici : l'assertion est vraie **immédiatement**, avant
même que l'application ait eu le temps de naviguer à tort. Supprimer l'attente
rendrait le test vert quoi qu'il arrive — y compris le jour où le formulaire
laisserait passer une valeur invalide. C'est exactement le faux vert décrit plus
bas en conséquence négative, et il touche la catégorie qui paraissait la plus
sûre. Une durée fixe n'est pas la bonne réponse pour autant : elle ne fait que
rendre le faux vert moins probable, pas impossible.

## Décision

**`cy.wait(<durée fixe>)` est interdit dans les specs.** On attend un état
observable, jamais une durée.

### Remplacement par catégorie

- **A1 — suppression sèche.** L'assertion qui suit fait déjà le travail. Aucun
  filet à ajouter.
- **A2 — ancrer sur un signal positif quand il en existe un, sinon une fenêtre
  de temps nommée.** L'idéal est d'attendre la preuve observable que
  l'application a traité l'action et l'a rejetée (le message de validation qui
  apparaît, l'onglet qui se marque en erreur), *puis* de vérifier qu'on n'a pas
  navigué. À l'usage, **un seul des neuf sites** dispose d'un tel signal : les
  trois formulaires concernés n'affichent rien du tout quand le JSON est
  invalide (cf. conséquences). Pour les huit autres, une commande
  `cy.shouldStayOn(<chemin>)` vérifie le chemin, laisse s'écouler une fenêtre
  nommée, puis le revérifie. La durée fixe subsiste à l'intérieur de la
  commande — c'est la même dérogation que E et F : asserter un négatif demande
  du temps, Cypress n'ayant pas d'assertion de stabilité. Elle est nommée,
  bornée, écrite une seule fois, jamais en clair dans une spec.
- **A3 — `?refresh=wait_for` sur la requête d'écriture.** Quand le test crée une
  donnée par `cy.request()` puis charge une page qui doit l'afficher, c'est
  l'indexation Elasticsearch qu'on attend. Kuzzle sait la rendre synchrone : le
  besoin disparaît au lieu d'être temporisé. Réessayer côté DOM ne marcherait
  pas — la liste n'est chargée qu'une fois, au `cy.visit()`.
- **B — assertion d'abord, action ensuite.** On rend explicite la condition qui
  était implicite : `cy.get('[data-cy=…]').should('be.visible')` avant le
  `.type()` ou le `.click()`. Pour un menu, on assied l'attente sur l'élément
  qu'on va cliquer, pas sur le déclencheur.
- **C — une commande dédiée `cy.aceReady(<sélecteur>)`** dans
  `support/commands.js`, qui attend que l'éditeur ait monté sa zone de saisie
  *et* rendu sa première ligne. Ace est un composant tiers dont on ne contrôle
  pas le cycle de vie : la logique d'attente est écrite une fois, pas cinq.
- **D — une commande `cy.expectBackend(<requête>, <assertion>)`** qui rejoue la
  requête jusqu'à ce que l'assertion passe, avec un plafond. Dix lignes dans
  `support/commands.js`, **sans dépendance ajoutée** — même principe que la règle
  `no-restricted-syntax` posée pour les `.only`.
- **E et F — le sommeil reste, mais il est nommé.** Ces deux cas attendent un
  vrai délai (une temporisation applicative, un basculement réseau simulé) et non
  un état atteignable par assertion. Ils sont isolés dans `support/commands.js`,
  derrière une constante nommée et un commentaire qui dit *quel* délai est
  attendu. Un nombre nu dans une spec reste interdit.

### Mécanisme anti-récidive

La règle `no-restricted-syntax` de `test/e2e/cypress/.eslintrc.cjs` est étendue
pour rejeter `cy.wait()` appelé avec un littéral numérique. `cy.wait('@alias')`
reste autorisé. Le job `Lint` est déjà bloquant sur les trois workflows depuis
[#1020](https://github.com/kuzzleio/kuzzle-admin-console/issues/1020).

La règle est activée **immédiatement**, avec un `overrides` qui l'assouplit sur
la liste explicite des specs pas encore reprises. Cette liste ne peut que
rétrécir : chaque PR de la série en retire une entrée, et le diff rend
l'avancement visible sans qu'on ait à tenir un compteur à la main. Quand elle
est vide, le bloc `overrides` disparaît.

L'ordre de reprise suit le rapport valeur / risque : **A1** (17 appels,
suppression sans risque) et **A3** d'abord, puis **A2** qui demande de trouver
l'ancre positive cas par cas, puis **B**, puis **C** et **D** qui demandent
d'écrire les deux commandes.

## Conséquences

### Positives
- Jusqu'à **63 s** retirées de chaque exécution complète de la suite, et autant
  à chaque nouvelle tentative — `retries: { runMode: 2 }` fait payer ce sommeil
  jusqu'à trois fois sur un test instable.
- Les specs deviennent lisibles sur ce qu'elles attendent vraiment. Une attente
  sur assertion documente le comportement ; une durée fixe ne documente rien.
- Les tests s'ajustent à la charge au lieu de la subir. C'est la condition pour
  que la phase 2 puisse s'appuyer dessus : sur un écran réécrit, un échec devra
  signifier « régression », pas « la CI était lente ».

### Négatives
- 57 sites à reprendre sur 12 fichiers, dont la moitié demande de comprendre ce
  que le test attendait réellement. C'est du travail d'archéologie sur du code
  qu'on n'a pas écrit.
- Une assertion mal choisie peut rendre un test **faussement vert** : `.should(
  'be.visible')` sur un élément déjà présent avant l'action ne prouve rien. Le
  garde-fou est de vérifier, pour chaque remplacement, que le test échoue encore
  quand on casse volontairement le comportement visé. Ce garde-fou a servi dès
  le lot A2 : sur `roles.spec.js`, validation sabotée pour naviguer après
  300 ms, l'assertion instantanée laisse les 9 tests verts là où
  `cy.shouldStayOn()` échoue.
- **Constat produit, hors périmètre de ce chantier** : les formulaires de
  création de collection, de profil et de rôle n'affichent **aucun retour**
  lorsque le JSON saisi est invalide. L'utilisateur clique « Create » et rien ne
  se passe. C'est ce qui rend ces tests si difficiles à ancrer : il n'y a rien à
  observer. À traiter comme un correctif applicatif à part entière, pas dans une
  PR de tests.

### Risques acceptés
- La phase 2 va réécrire ces écrans et donc rebrasser une partie de ces
  attentes. Faire le travail maintenant reste le bon ordre : on ne peut pas
  s'appuyer sur un filet dont on ne sait pas distinguer les faux positifs, et
  c'est précisément ce filet qui doit tenir pendant la réécriture.
- `cy.aceReady()` dépend d'éléments internes à Ace (`.ace_text-input`,
  `.ace_line`). C'est un couplage à un tiers, assumé : il est concentré dans une
  commande, donc il y aura un seul endroit à reprendre — même traitement que les
  sélecteurs internes `bootstrap-vue`.

## Alternatives écartées

- **S'en tenir aux retries.** `retries: { runMode: 2 }` est déjà en place. C'est
  un garde-fou qui retire le bruit du signal CI, pas un correctif : l'instabilité
  reste, et chaque tentative repaie les 63 s. Surtout, un test qui ne passe qu'à
  la troisième tentative n'est plus un filet de sécurité — il ne dit plus rien
  de fiable le jour où l'écran sous-jacent est réécrit.
- **Tout basculer sur `cy.intercept()` + `cy.wait('@alias')`.** Attendre la
  réponse HTTP est précis, mais couple chaque test aux routes appelées par
  l'application. En phase 2 ces appels vont bouger, et on paierait une deuxième
  migration des specs. Réservé aux cas où l'état attendu n'est **pas** observable
  dans le DOM, ce qui ne se présente pas ici : la catégorie D s'assertionne mieux
  côté backend via `cy.expectBackend()`.
- **Ajouter `cypress-wait-until`.** Sans objet : le paquet est **déjà une
  dépendance du projet** (`package.json`) et déjà importé dans
  `support/commands.js`, sans être utilisé nulle part. `cy.waitUntil` est donc
  disponible sans rien ajouter, et c'est l'outil naturel pour la catégorie D.
  Reste que `.should()` couvre nativement A, B et C : on n'y recourt pas.
- **Augmenter `defaultCommandTimeout` et ne rien changer d'autre.** Ne traite pas
  le problème : les `cy.wait()` fixes ne sont pas des timeouts, ils s'ajoutent au
  temps d'exécution que l'application soit prête ou non.
