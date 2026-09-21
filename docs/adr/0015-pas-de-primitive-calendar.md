# ADR-0015 : pas de primitive `Calendar` — les types natifs `date` et `time`

- **Statut** : Acceptée
- **Date** : 2026-09-21
- **Décideurs** : Ricky

## Contexte

`<b-form-datepicker>` et `<b-form-timepicker>` apparaissent **deux fois, dans un
seul fichier** : `Data/Documents/FormInputs/DateTimeFormInput.vue`. C'est le
champ date du formulaire de document, et c'est le seul de la console —
`grep -rn "datepicker\|timepicker" src` ne retourne rien d'autre.

Trois choses pèsent sur la décision.

**1. En amont, il n'y a pas de « champ date ».** shadcn-vue compose un *Date
Picker* à partir de `Popover` et de `Calendar`, et `Calendar` vient de `reka-ui`
et de `@internationalized/date` — deux dépendances Vue 3. Écrire `Calendar` à la
main, comme `Dialog` (ADR-0010) ou `Select` (ADR-0014), veut dire la grille du
mois, la navigation clavier (flèches, `PageUp`/`PageDown`, `Home`/`End`), les
bornes, le premier jour de semaine et la locale. Plusieurs centaines de lignes,
pour un champ.

**2. Le seul site d'appel est un champ personnalisé de `vue-form-generator`**,
une dépendance **abandonnée que la console doit réimplémenter** (§ 3.1 de
`MIGRATION.md`). Une primitive écrite pour lui serait écrite pour un hôte dont
la démolition est déjà au programme.

**3. Le panneau n'est couvert par aucune spec.** Les quatre appels de
`formView.spec.js` qui visent ce champ **écrivent dans les deux champs texte** ;
aucun n'ouvre le calendrier. Une primitive écrite ici le serait donc sans filet,
sur le seul morceau d'interface que les specs ne regardent pas.

Le champ actuel est du reste une paire : un `<b-form-input>` texte où l'on tape
`YYYY-MM-DD`, et à côté un bouton qui ouvre le panneau. Les deux écrivent dans
la même donnée.

## Décision

**1. Les deux champs passent aux types natifs `date` et `time`**, rendus par la
primitive `Input`. Le navigateur fournit le sélecteur ; la paire champ + bouton
devient un seul contrôle par valeur.

**2. Ce n'est pas l'alternative écartée par ADR-0014.** Le `<select>` natif
« habillé aux tokens » était refusé parce qu'il aurait donné une **API de
composant** divergente de l'amont (prop `options` contre composition
`Trigger`/`Content`/`Item`), donc une reprise des sites d'appel en phase 4. Ici,
aucun composant n'est créé : `type="date"` est un attribut HTML sur une primitive
qui existe déjà et qui accepte déjà `type="file"`. Le jour où un vrai *Date
Picker* arrive, c'est un fichier à reprendre, pas une API à défaire.

**3. Le format tapé est exactement celui que le composant parsait déjà.** Un
`input[type=date]` expose `YYYY-MM-DD` dans `value`, et un `input[type=time]`
avec `step="1"` expose `HH:mm:ss` — les deux constantes que le composant porte
depuis toujours. La valeur écrite dans le document reste le timestamp en
millisecondes, inchangée.

**4. Chaque champ reçoit un libellé visible** (« Date », « Time »). La seule
indication était jusqu'ici un `placeholder`, que les types natifs **ignorent** ;
et aucun des deux champs n'avait de nom accessible. Même constat que le champ
fichier de [#1054](https://github.com/kuzzleio/kuzzle-admin-console/pull/1054).

**5. Les gestionnaires lisent l'événement natif, pas la valeur émise par
`Input`.** `v-model` sur la primitive et un `@input` posé par le site d'appel
visent le même événement, et rien ne garantit lequel des deux est appliqué en
premier : `event.target.value` est vrai dans les deux cas. C'est pour cette même
raison que le composant passe `:model-value` plutôt que `v-model`.

## Conséquences

### Positives

- Deux balises `bootstrap-vue` de moins, zéro ligne de primitive, zéro
  dépendance ajoutée.
- Le champ a un nom accessible et un sélecteur que le navigateur rend
  utilisable au clavier — ce que le panneau de `bootstrap-vue` faisait mal.
- La saisie au clavier reste possible, et c'est ce que font les specs.

### Négatives

- **Le sélecteur n'est plus le nôtre.** Il ne suit pas les tokens, et son aspect
  change d'un navigateur à l'autre. Sur un champ, c'est le prix ; sur un écran
  entier, ça ne le serait pas.
- `locale="en-GB"` et `hour12="false"` ne sont plus imposés : c'est la locale du
  navigateur qui décide de l'**affichage**. La valeur stockée, elle, ne dépend
  pas de la locale.

### Risques acceptés

- Safari a longtemps rendu `input[type=date]` en champ texte nu sur macOS. C'est
  réglé depuis Safari 14.1, en deçà de ce que la console supporte.
- Le jour où un deuxième champ date apparaît avec un besoin réel — plage,
  bornes, raccourcis —, cette ADR est à reprendre par une nouvelle : ce sera le
  moment d'un vrai *Date Picker*, pas avant.

## Alternatives écartées

- **Écrire `Calendar` à la main**, comme `Dialog` et `Select`. Le coût est d'un
  autre ordre que les deux précédentes — et il serait payé pour un champ, sans
  spec pour le tenir, dans un formulaire que `vue-form-generator` emportera.
- **Garder le champ texte et supprimer le panneau.** Le moins cher, et c'est
  précisément ce que les specs verraient passer : elles ne tapent que du texte.
  Refusé parce que l'utilisateur, lui, perdrait le calendrier sans rien en
  échange.
- **Ajouter une bibliothèque de calendrier Vue 2** (`v-calendar`,
  `vue2-datepicker`). Une dépendance de plus à faire sortir en phase 3, pour un
  champ — exactement ce qu'ADR-0002 cherche à éviter.
