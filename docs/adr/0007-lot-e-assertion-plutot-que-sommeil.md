# ADR-0007 : Borner la patience plutôt que dormir, y compris pour le réseau simulé

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky
- **Remplace** : la clause **E** de la décision de
  [ADR-0006](0006-attentes-sur-assertion-cypress.md). Les clauses A, B, C, D et F
  restent en vigueur.

## Contexte

[ADR-0006](0006-attentes-sur-assertion-cypress.md) classait trois `cy.wait()`
d'`environments.spec.js` en **lot E — réseau simulé**, et prévoyait pour eux la
même dérogation que pour F : « le sommeil reste, mais il est nommé », isolé
derrière une commande de `support/commands.js`. Le raisonnement était qu'une
bascule réseau simulée est un vrai délai et non un état atteignable par
assertion.

En reprenant les trois sites, cette prémisse s'est révélée fausse dans les trois
cas, pour deux raisons différentes.

**1. Un des trois n'appartenait pas au lot E.** Le `cy.wait(2000)` du test
« unreachable environment » n'est pas assis sur la bascule réseau : il est placé
entre une assertion déjà réessayée (`[data-cy="App-connectionError"]`) et un
`click()`, sans rien attendre de particulier. C'est du lot A1 mal classé — du
temps mort. Retiré : 3 exécutions vertes sur 3, test de 4,1 s à ~2,5 s.

**2. Les deux autres attendent un état parfaitement observable : le toast.**
`#offline-toast` apparaît quand le SDK a déduit la perte de la websocket, et
disparaît à la reconnexion. Une assertion `.should()` est réessayée ; elle
couvre donc ce délai sans qu'on ait à le connaître. Le détail qui rendait la
chose invisible : `defaultCommandTimeout` vaut **60 s** dans
`cypress.config.ts`, très au-dessus des ~5 s que prend réellement la détection.
Le sommeil de 5 s + 1 s ne protégeait rien — il s'ajoutait.

| | Avant | Après |
|---|---:|---:|
| test « toast » | 7,0 s | 5,0 s |
| test « unreachable » | 4,1 s | ~2,5 s |

Vérification du garde-fou d'ADR-0006 — le comportement est saboté, le test doit
échouer :

| Sabotage | Résultat |
|---|---|
| `$bvToast.show('offline-toast')` neutralisé | ❌ échec (`never found it`) |
| `$bvToast.hide('offline-toast')` neutralisé | ❌ échec (`continuously found`) |

Les deux assertions sont donc réelles, y compris la négative. **C'est la
distinction à retenir**, et elle n'était pas explicite dans ADR-0006 : ce qui
exige une fenêtre de temps, ce n'est pas « une assertion négative », c'est
**l'assertion d'un non-événement**. `cy.shouldStayOn()` affirme que rien ne se
produira — vrai à l'instant zéro, donc à protéger par une fenêtre.
`expectNoOfflineToast()` affirme qu'une **transition** a lieu : le toast est
présent quand on appelle la commande, il doit disparaître. Le réessai est ancré
sur un changement d'état, il ne peut pas être faussement vert.

## Décision

**Le lot E ne conserve aucun sommeil.** Les deux sites du toast passent par deux
commandes de `support/commands.js`, `cy.expectOfflineToast()` et
`cy.expectNoOfflineToast()`, qui assertionnent l'état observable ; le troisième
site est supprimé sèchement.

Ce que ces commandes nomment n'est pas une durée à attendre mais **un plafond de
patience** : `BACKEND_LOSS_DETECTION_TIMEOUT = 20 s`, soit quatre fois le délai
mesuré et trois fois moins que le `defaultCommandTimeout` global. La raison est
le coût d'un échec, pas celui d'un succès : avec `retries: { runMode: 2 }`, une
régression sur ce toast se signale en 1 min au lieu de 3.

**Une commande plutôt qu'un `.should()` en clair dans la spec** : le délai est
subi (il dépend du SDK), il mérite d'être expliqué une fois, et le plafond
d'être écrit une fois.

### Conséquence sur le mécanisme anti-récidive

La règle `no-restricted-syntax` est posée **sans bloc `overrides`** : les 57
appels sont traités avant qu'elle n'existe, la liste serait vide. Le compteur
d'avancement prévu par ADR-0006 n'a jamais eu lieu d'être — ce n'est pas un
raccourci, c'est l'ordre de reprise qui a fonctionné.

Le sélecteur ne vise que le **littéral numérique** (`cy.wait(2000)`).
`cy.wait('@alias')` reste autorisé, et une durée passée **par identifiant** l'est
aussi : c'est la forme réservée aux deux dérogations restantes, toutes deux dans
`support/commands.js` et toutes deux commentées — `waitOverlay`
(`antiGlitchOverlayTimeout`, lot F, un vrai timer applicatif) et `shouldStayOn`
(`NAVIGATION_GRACE_MS`, lot A2, un non-événement). Un nombre nu dans une spec ne
dit rien de ce qu'on attend ; une constante nommée dans `commands.js` est
relisible et se compte sur les doigts d'une main.

## Conséquences

### Positives
- **57 des 57 appels traités**, au lieu des 52 prévus. Il ne reste aucun
  `cy.wait()` dans les specs, et deux dans `commands.js`, tous deux nommés.
- 8 s de sommeil supplémentaires retirées, et un cas de moins à expliquer aux
  relecteurs : « pourquoi celui-là a-t-il le droit de dormir ? » n'a plus de
  réponse à donner que pour deux commandes documentées.
- La distinction *non-événement* / *transition* est écrite. C'est elle qui évite
  à la fois le faux vert (supprimer l'attente de `shouldStayOn`) et le sommeil
  inutile (en poser une sur le toast).

### Négatives
- Un plafond spécifique (20 s) coexiste avec le `defaultCommandTimeout` global de
  60 s. Deux échelles de patience dans la même suite, c'est une incohérence
  assumée : 60 s est trop pour tout le monde, mais le réduire globalement est une
  autre décision, à prendre sur mesures et pas dans une PR de lot E.

### Risques acceptés
- `#offline-toast` est un identifiant posé sur un `<b-toast>` : il survivra à la
  sortie de bootstrap-vue à condition qu'on le reporte. Même traitement que les
  autres ancrages de test, mais celui-ci n'est pas un `data-cy`.

## Alternatives écartées

- **Appliquer la clause E telle qu'écrite** (sommeil nommé dans `commands.js`).
  Conforme, mais paierait 6 s par exécution pour garantir moins qu'une assertion
  réessayée : la durée fixe reste fausse dans un sens ou dans l'autre, la nommer
  ne la rend pas juste. Une ADR qui se révèle fausse sur un point se remplace,
  elle ne s'applique pas par discipline.
- **`.should()` en clair dans la spec, sans commande ni plafond.** Fonctionne —
  c'est même ce qui a servi à la mesure — mais laisse la spec muette sur la
  raison du délai et fait payer 60 s × 3 tentatives à la moindre régression.
- **`cy.intercept()` sur le trafic websocket.** Couple le test au protocole du
  SDK pour observer ce que le DOM montre déjà. Écarté pour la même raison qu'en
  ADR-0006.
- **Réduire `defaultCommandTimeout` globalement.** Peut-être justifié, mais
  demande de mesurer l'attente réelle la plus longue de la suite. Hors périmètre.
