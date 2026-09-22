# ADR-0019 : primitive `TagsInput` écrite à la main pour le seul champ à étiquettes

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

`<b-form-tags>` n'apparaît **qu'une fois** dans la console :
`Security/Roles/Filters.vue`, où l'on tape des noms de contrôleurs pour filtrer
les rôles. C'est la même situation qu'ADR-0015, qui a refusé d'écrire
`Calendar` pour un champ unique — et pourtant la décision est inverse ici.
Quatre différences l'expliquent.

**1. Le coût n'est pas du même ordre.** `Calendar` demandait la grille du mois,
la navigation clavier à deux dimensions, les bornes et la locale. Un champ à
étiquettes, c'est un tableau de chaînes, un champ texte et un bouton par
étiquette : cinq petits fichiers, aucune dépendance, aucun calcul de
positionnement.

**2. Le champ est couvert par les specs.** `roles.spec.js` tape `document` puis
`security`, retire une étiquette et vérifie le filtrage. Le panneau du
sélecteur de date, lui, n'était couvert par rien (ADR-0015, point 3).

**3. Il n'y a pas d'équivalent natif.** Le champ date avait `type="date"`, que
le navigateur rend et que les specs pilotent. Rien de tel pour les étiquettes :
l'alternative serait un `<input>` avec des valeurs séparées par des virgules,
c'est-à-dire une régression fonctionnelle.

**4. L'hôte n'est pas condamné.** `DateTimeFormInput` vivait dans
`vue-form-generator`, qu'il faut réimplémenter. Ce filtre-là reste.

## Décision

**1. La primitive est écrite à la main**, avec l'API publique de shadcn-vue
(ADR-0009) : `TagsInput`, `TagsInputItem`, `TagsInputItemText`,
`TagsInputItemDelete`, `TagsInputInput`.

**2. La valeur est toujours un tableau de chaînes.** `b-form-tags` acceptait
aussi une chaîne à séparateur et devinait laquelle des deux on lui donnait.

**3. `Retour arrière` sur un champ vide retire la dernière étiquette.** C'est le
geste attendu d'un champ à étiquettes ; `b-form-tags` ne le faisait pas.

**4. La saisie devient une étiquette à `Entrée` ou à la perte du focus, pas à la
virgule ni à l'espace.** `b-form-tags` coupait sur ces deux caractères. Aucun
nom de contrôleur Kuzzle n'en contient, mais une valeur coupée en deux sans
qu'on l'ait demandé est un piège silencieux ; on ajoutera un séparateur le jour
où un site d'appel en aura besoin.

**5. Un doublon est ignoré en silence**, comme en amont. `b-form-tags`
affichait un message d'erreur sous le champ — que la console masquait.

**6. Retirer une étiquette est un `<button>`**, pas une icône cliquable :
atteignable au clavier, et son nom accessible dit ce qu'il retire.

## Conséquences

### Positives

- Le dernier `<b-form-tags>` de la console peut partir, et avec lui le dernier
  écran de Security.
- La commande Cypress `removeFormTag` reste le seul endroit qui connaît le DOM
  de l'étiquette : elle accepte les deux formes le temps de la cohabitation,
  comme `invalidFeedback` et `notificationBadge` avant elle.

### Négatives

- Une primitive de plus à maintenir pour un seul site d'appel. C'est assumé :
  cinq fichiers courts, sans dépendance.
- Pas d'autocomplétion dans le champ. `b-form-tags` n'en avait pas non plus ;
  le menu « Controllers » à côté joue ce rôle.

### Risques acceptés

- Si un deuxième site d'appel demande un séparateur, une limite de nombre ou
  une validation par étiquette, la primitive devra grandir. Ce sont les props
  que l'amont expose déjà (`addOnPaste`, `max`, `convertValue`) : le chemin est
  connu.

## Alternatives écartées

- **Un `<input>` à valeurs séparées par des virgules.** Le moins cher, et une
  régression : on perd la lecture des filtres actifs d'un coup d'œil et la
  suppression d'un seul terme.
- **`vue-multiselect` en mode `taggable`.** La dépendance est justement celle
  que la phase 2 cherche à sortir ; il n'en reste qu'un site d'appel.
- **Attendre la phase 3 et `reka-ui`.** C'est bloquer le dernier écran de
  Security sur un composant qui coûte cinq fichiers.
