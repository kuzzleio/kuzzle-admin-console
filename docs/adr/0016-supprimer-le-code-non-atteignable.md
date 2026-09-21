# ADR-0016 : le code non atteignable est supprimé, et un contrôle bloquant l'empêche de revenir

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

Six composants ont déjà été **supprimés plutôt que repris** pendant la phase 2,
chacun découvert par accident au moment où on allait le migrer (§ 1.3 de
`MIGRATION.md`). Le réflexe « on vérifie qu'un composant est atteint avant de le
reprendre » était acquis, mais l'outil ne l'était pas : la vérification se
faisait au `grep`, un fichier à la fois, juste avant de le toucher.

Le `grep` répond à la mauvaise question. Il dit « ce nom est écrit quelque
part », pas « ce fichier est dans le bundle ». Trois exemples relevés dans ce
dépôt :

- `Common/CrudlDocument.vue` est importé par `Common/CommonList.vue` — qui n'est
  lui-même importé par personne. Le `grep` trouve un import et conclut qu'il
  vit ;
- `Security/Roles/CrudlDocument.vue` et `Security/Profiles/CrudlDocument.vue`
  n'ont **aucun** importeur, mais le `grep` sur `CrudlDocument` retourne six
  lignes, dont deux `import CrudlDocument from './CrudlDocument.vue'` — qui
  résolvent vers d'autres répertoires ;
- `Error/KuzzleDisconnectedPage.vue` est importé par
  `routes/children/errors.ts`, un fichier de routes que `routes/index.ts`
  n'importe pas. Le composant a un importeur, une route, un nom — et aucune URL.

Le cas qui tranche : **`Security/Common/List.vue` importe
`./CrudlDocument.vue`, un fichier supprimé en juin 2017.** L'import est cassé
depuis neuf ans. Le build ne l'a jamais signalé, parce que Vite ne résout que ce
qu'on lui demande de résoudre, et personne ne demande ce fichier. Il a pourtant
continué d'être entretenu : passé à Pinia en octobre 2024, relinté en septembre
2024. Du travail dépensé sur du code qui ne peut pas s'exécuter.

Ce n'est pas un coût théorique. `Data/Documents/NoResultsEmptyState.vue` a été
**repris au lot [#1048](https://github.com/kuzzleio/kuzzle-admin-console/pull/1048)**
alors que, sur le commit qui précède, `git grep NoResultsEmptyState` ne
retournait que le fichier lui-même. Un composant lu, réécrit aux primitives,
relu en revue — et jamais affiché.

La question n'est donc pas de savoir si on supprime ce code — elle est de savoir
**comment on le trouve**, et comment on évite d'en refabriquer.

## Décision

**1. La fermeture transitive depuis les points d'entrée fait foi.** Un module de
`src/` qu'aucune chaîne d'imports ne relie à `main.ts` ou `App.vue` n'est pas
dans le bundle : il est supprimé. C'est la même règle que pour les tests
désactivés (§ 1 de `MIGRATION.md`) — un fichier qui ne peut pas s'exécuter n'est
pas une dette en attente, c'est une dette imaginaire, et git en garde la trace.

**2. Le calcul est un script, pas un rituel.**
`scripts/unreachable-modules.ts`, lancé par `npm run check:unreachable`. Il
résout `@/`, le relatif, les extensions implicites et les `index.*`, et il suit
les quatre formes d'import du projet — `from`, `import()`, `import` d'effet de
bord et `require()`. Sortie vide et code 0 quand tout est atteignable.

**3. Le contrôle est bloquant, dans l'action composite `lint`.** Elle est
partagée par les trois workflows : le poser là, c'est le poser une fois pour la
PR, `4-dev` et `master`. Même raisonnement que pour la règle ESLint qui interdit
`.only` — une règle non outillée est une règle qui se reperd, et c'est
exactement ce qui est arrivé ici pendant neuf ans.

**4. Le script dit « non atteint par un import statique », pas « mort ».** Un
import construit à l'exécution lui échapperait. Le projet n'en a aucun
aujourd'hui, et les deux composants enregistrés globalement dans `main.ts`
(`FieldJsonFormInput`, `FieldDateTimeFormInput`) sont importés explicitement,
donc vus. La vérification reste à faire **avant** de supprimer ce qu'il
signale ; ce n'est pas le script qui supprime.

**5. Le dénominateur de la phase 2 est recalculé.** 27 composants sortent de
l'inventaire, qui passe de 134 à **107**. Ce n'est pas de l'avancement : c'est
du travail qui n'avait pas lieu d'être compté.

## Conséquences

### Positives

- **3 328 lignes supprimées**, dont 27 composants — un cinquième du reste à
  migrer disparaît sans qu'une seule ligne soit réécrite.
- Cinq des six fichiers écrits pour **Materialize** partent avec : le framework
  qui précédait Bootstrap n'a plus que `Headline.vue` dans la console.
- `velocity-animate` n'avait plus aucun site d'appel une fois `Stepper.vue`
  parti : la dépendance est retirée (§ 3.3).
- `vue-multiselect` recule d'un cran : `MSelect.vue` et `MappingForm/FormLine.vue`
  supprimés, il ne reste que `Views/Column/Column.vue`.
- Les futures reprises ne perdront plus de temps à lire un composant pour
  découvrir à la fin qu'il ne sert à rien.

### Négatives

- Le contrôle ajoute une étape à un job déjà bloquant. Elle coûte moins d'une
  seconde, sans dépendance ajoutée — le script n'utilise que `node:fs` et
  `node:path`, et Node 24 exécute le TypeScript directement (ADR-0004).
- Un futur import dynamique légitime ferait échouer le job à tort. C'est
  volontaire : il vaut mieux une exception discutée qu'un angle mort silencieux.

### Risques acceptés

- **Une fonctionnalité pouvait être « prévue » dans ce code.** La page
  « Kuzzle disconnected » en est le meilleur exemple : elle existe, elle est
  jolie, et elle n'a pas de route. Mais le chemin vivant existe déjà —
  `ConnectionAwareContainer` monte `Common/Offline.vue` et
  `Error/KuzzleErrorPage.vue`. Garder les deux, c'était garder deux réponses au
  même besoin dont une seule s'affiche.

## Alternatives écartées

- **Laisser le code mort et le migrer quand même.** C'est le coût que la phase 2
  payait jusqu'ici, six fois par accident.
- **Se fier à `knip` ou `depcheck`.** Une dépendance de plus, sa configuration,
  et son lot de faux positifs sur les SFC Vue 2, pour une question à laquelle
  cinquante lignes répondent exactement.
- **Ne pas rendre le contrôle bloquant** et se contenter d'un rapport. La CI de
  ce dépôt a déjà montré ce que devient un job non bloquant : le job `Lint` est
  resté en `continue-on-error: true` assez longtemps pour laisser passer deux
  `.only` pendant quatre ans.
