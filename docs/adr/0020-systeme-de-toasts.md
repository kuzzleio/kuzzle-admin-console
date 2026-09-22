# ADR-0020 : les notifications passent par un store et une zone unique, et gardent une API impérative

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

`bootstrap-vue` fournissait deux choses sous le même nom :

- **une API impérative**, `this.$bvToast.toast(message, { title, variant, … })`,
  appelée **48 fois dans 28 fichiers** ;
- **des toasts déclaratifs**, `<b-toast id="…">`, affichés et masqués depuis
  n'importe où par `this.$bvToast.show('leur-id')`. Il y en avait quatre.

Le relevé des 48 appels est net : **tous** visent `b-toaster-bottom-right`, tous
sauf deux ajoutent à la pile, et les variantes se répartissent en `warning` (35),
`danger` (9), `success` (2) et `info` (2). Trente-cinq portent
`noAutoHide: true` et `dismissible: true` ; les treize autres disparaissent au
bout de cinq secondes.

Deux détails ont été mis au jour en lisant les quatre toasts déclaratifs :

- **`discarded-toast` (« Request Discarded ») n'était affiché par personne** :
  `grep -rn "discarded-toast" src` ne retourne que sa propre déclaration ;
- **`no-admin-warning` ne s'affiche pas** — vérifié en mesurant le DOM avant et
  après cette reprise, sur le même scénario : le toast est absent des deux
  côtés. Son état dépend de `adminAlreadyExists`, et la reprise n'y touche pas.

Enfin, `useToasterStore` existait déjà, avec un état `toast: {}` et un type
hérité de l'époque Materialize (`text`, `duration`, `cssClass`, `cb`). Ses seuls
clients étaient les fichiers morts supprimés par
[ADR-0016](0016-supprimer-le-code-non-atteignable.md) ; **il ne restait qu'une
coquille**, que le contrôle d'atteignabilité ne voit pas puisque `stores/index.ts`
la ré-exporte.

## Décision

**1. Un store Pinia tient la liste des notifications.** `useToasterStore` est
réécrit : `toasts[]`, `push()`, `dismiss()`, `clear()`. C'est l'état partagé, et
il est lisible par les tests comme par n'importe quel composant.

**2. Une seule zone de rendu, montée explicitement.** `Common/Toaster.vue` est
posé une fois dans `App.vue`. `bootstrap-vue` fabriquait un conteneur par nom de
*toaster* au premier appel ; c'est commode et c'est ce qui rend l'empilement
imprévisible quand deux zones se retrouvent au même endroit.

**3. L'API impérative est conservée**, sous le nom de l'amont : `this.$toast.danger(titre, message)`.
C'est la seule dérogation à [ADR-0010](0010-primitive-dialog-en-vue-2.md), qui
bannit les API impératives — et elle est assumée : **un toast est déclenché par
un événement, pas rendu par un état**. C'est aussi la forme de *sonner*, que
shadcn-vue a adopté en amont. Le plugin ne fait que déléguer au store ; en
phase 4, un composant en Composition API appellera `useToasterStore()` et le
plugin partira.

**4. Un message d'erreur reste affiché jusqu'à ce qu'on le ferme ; le reste
disparaît au bout de cinq secondes.** La règle est portée par le store
(`danger` et `warning` persistent), au lieu des trois options répétées à chaque
site d'appel. **Cela change le comportement des neuf toasts `danger` qui
s'effaçaient tout seuls** — dans le sens qui convient : un message d'erreur qui
disparaît avant d'être lu est un message perdu.

**5. Les deux bandeaux persistants deviennent des toasts du store, avec leurs
boutons.** Un toast peut porter des `actions`. C'est ce qui permet de n'avoir
qu'une zone en bas à droite : le bandeau de télémétrie et l'avertissement
« pas d'administrateur » y prennent leur place au lieu de se superposer à elle.

**6. Le toast hors-ligne garde son `id` et sa zone à lui**, en haut au centre.
Il n'est pas une notification parmi d'autres : il dit l'état de la connexion, il
est unique, et deux commandes Cypress s'y accrochent (`#offline-toast`).

**7. `discarded-toast` est supprimé.** Un composant que rien n'affiche n'est pas
une fonctionnalité en attente.

## Conséquences

### Positives

- Les trois derniers `<b-toast>` de la console partent, et avec eux la dernière
  dépendance de `bootstrap-vue` hors d'`ApiAction`.
- Les sites d'appel passent de six lignes d'options à une :
  `this.$toast.danger('Ooops! …', 'The complete error has been printed to the console.')`.
- Le `z-index` de la zone (1045) est au-dessus de `Dialog` (1030) et des
  panneaux flottants (1035, [ADR-0018](0018-panneaux-flottants-au-dessus-des-modales.md)) :
  un toast déclenché depuis une modale reste lisible.
- `role="alert"` et `aria-live` sont portés par la primitive. `b-toast` les
  posait aussi, mais sans distinguer l'erreur du reste : `assertive` pour une
  erreur, `polite` sinon.

### Négatives

- `this.$toast` est une propriété globale de plus sur le prototype, avec sa
  déclaration de types (`shims-toast.d.ts`), comme `$log`. C'est le prix de ne
  pas réécrire 28 fichiers en Composition API maintenant.
- Les minuteries vivent dans le composant `Toaster`, pas dans le store : un
  store n'a pas à connaître `setTimeout`, mais cela veut dire qu'un toast poussé
  alors que la zone n'est pas montée ne disparaîtra pas tout seul. La zone est
  dans `App.vue`, donc toujours montée.

### Risques acceptés

- Les neuf toasts `danger` qui disparaissaient tout seuls restent désormais à
  l'écran. Si l'un d'eux s'avérait bavard, il passera `autoHideAfter`
  explicitement — l'option existe.

## Alternatives écartées

- **Garder une API déclarative partout**, comme `Dialog`. Il faudrait un état
  par message dans 28 composants, pour des messages qui n'ont pas d'état : ils
  apparaissent, on les lit, ils partent.
- **Ajouter `vue-toastification` ou équivalent.** Une dépendance Vue 2 de plus à
  faire sortir en phase 3, pour un composant qui tient en cinq fichiers.
- **Laisser les bandeaux persistants rendre leur propre zone.** C'est ce qui a
  été écrit d'abord, et la capture d'écran l'a réfuté : deux zones fixes au même
  coin se superposent. `bootstrap-vue` ne le faisait pas, parce que son
  conteneur était partagé.
