# ADR-0025 : réimplémenter `vue-form-generator` en un composant de la console

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

`vue-form-generator` 2.3.4 est la **dernière** dépendance sans chemin de
migration vers Vue 3 (§ 3.1 de `MIGRATION.md`). Le projet est abandonné : pas de
version Vue 3, pas de successeur, pas de fork maintenu. Tant qu'il est là,
`@vue/compat` est hors d'atteinte, et la phase 3 ne peut pas commencer.

Il est également ce qui retenait `vfg.css` dans la couche `legacy`.

Ce qu'il rendait, mesuré plutôt que supposé : la console l'utilise sur **un**
écran, `Data/Documents/Common/CreateOrUpdate.vue`, et n'appelle **aucune** de
ses fonctions signature — ni validation, ni groupes, ni champs conditionnels,
ni `<field-*>` autres que ceux listés ici. Le schéma que `formSchema.ts` lui
passait n'emploie que cinq types de champ :

| Type du schéma | Origine dans le mapping | Rendu |
|---|---|---|
| `input` (`inputType: 'text'`) | `keyword`, `wildcard`, `constant_keyword`, `binary`, `ip` | `<input>` |
| `input` (`inputType: 'number'`) | `integer`, `long`, `short`, `byte`, `double`, `float`, `half_float`, `scaled_float` | `<input type="number">` |
| `textArea` | `text`, `search_as_you_type` | `<textarea>` |
| `checkbox` | `boolean` | `<input type="checkbox">` |
| `DateTimeFormInput`, `JsonFormInput` | `date` ; les 18 types objet/géo/intervalle | composants de la console |

Les deux derniers sont **déjà les nôtres**. La bibliothèque n'apportait donc,
en propre, que trois contrôles HTML et une boucle sur des champs — pour 174 ko
de JavaScript.

## Décision

**1. `DocumentForm.vue` remplace `<vue-form-generator>`.** Un composant de
~110 lignes, dans `Data/Documents/Common/`, qui boucle sur `schema.fields` et
rend, par champ, un `Label` et le contrôle correspondant. Les contrôles sont les
primitives existantes — `Input`, `Checkbox` — plus une primitive `Textarea`
ajoutée ici, qui n'existait pas encore parce qu'aucun écran repris en phase 2
n'en avait eu besoin.

**2. `formSchema.ts` ne change pas.** C'est lui qui décrit le formulaire, et il
le décrivait déjà sans rien devoir à la bibliothèque : la table des
correspondances de types est notre logique métier — la lecture d'un mapping
Elasticsearch — pas de la configuration de `vue-form-generator`. `DocumentForm`
lit le même schéma, `attributes.input` compris : l'ancrage
`data-cy="FormField-<champ>"` des specs n'est toujours nommé qu'à un endroit.

**3. Le formulaire ne mute plus le modèle.** `vue-form-generator` écrivait dans
l'objet reçu en prop — le site d'appel le signalait en `TODO` depuis des
années. `DocumentForm` n'a pas d'état : chaque champ émet `field-change`, et
`CreateOrUpdate` en dérive le document suivant.

**4. `rawDocument` devient la seule source de vérité des deux vues.** La vue
formulaire lit désormais `documentState`, le document parsé depuis le JSON, et
y réécrit ; la vue JSON faisait déjà cela. Les deux vues ne se synchronisent
plus en repassant par le composant parent, et `submit` n'a plus à choisir sa
source selon la vue active.

**5. Les deux champs personnalisés perdent le mixin `abstractField`.** Ils
reçoivent `schema` et `value` en props et remontent par `input` — le contrat
`v-model` de Vue 2, que Vue 3 comprend aussi. C'était leur seule attache à la
bibliothèque.

## Conséquences

### Positives

- **La phase 3 n'est plus bloquée.** Plus aucune dépendance incompatible avec
  `@vue/compat` : le tableau § 3.1 ne contient plus que `vuejs-logger`, qui a un
  chemin de migration (un wrapper maison, écrit dans la foulée par
  [ADR-0026](0026-wrapper-de-log-maison.md)).
- **−174 ko de JavaScript** (947 → 773 ko, −53,8 ko gzip) et **−5,6 ko de CSS**
  (122,5 → 116,9 ko, −2,5 ko gzip) sur le chunk `vue`. La bibliothèque
  embarquait ses 20 types de champ et `fecha` pour les trois contrôles utilisés.
- **`vfg.css` sort du bundle.** La couche `legacy` ne contient plus que les cinq
  feuilles SCSS nommées par [ADR-0024](0024-degraisser-la-couche-legacy.md) et
  FontAwesome.
- Le formulaire est habillé par les tokens comme le reste de la console, au lieu
  de l'être par la feuille d'une bibliothèque tierce.

### Négatives

- ~110 lignes à maintenir, plus une primitive `Textarea`. C'est le prix de la
  sortie, et il est connu : la bibliothèque faisait 174 ko pour rendre trois
  contrôles.
- Un mapping introduisant un type qui demanderait un contrôle inédit se traite
  maintenant chez nous. En pratique, c'était déjà le cas : les 19 types non
  scalaires passaient tous par `JsonFormInput`.

### Risques acceptés

- **La saisie numérique.** `vue-form-generator` produisait `NaN` sur un champ
  vidé, que `JSON.stringify` rendait en `null`. `DocumentForm` produit `null`
  directement. Le résultat envoyé au backend est le même ; ce qui transite dans
  le modèle ne l'est pas, et la spec `formView` couvre le cas (`age` relu à
  `43`, pas à `'43'`).
- **Le champ date reste lu une seule fois, au montage** — comportement inchangé.
  Éditer un document dans la vue JSON puis basculer en vue formulaire n'a jamais
  rafraîchi les deux sélecteurs. Ce n'est pas une régression de ce lot, et le
  corriger demande de décider ce qu'on fait d'une saisie en cours.

## Alternatives écartées

- **Chercher un successeur.** `FormKit`, `vee-validate`, `vue-json-schema-form`
  sont tous des bibliothèques Vue 3 : les adopter demanderait la migration
  qu'on cherche justement à débloquer, et ajouterait une dépendance là où trois
  `<input>` suffisent.
- **Forker `vue-form-generator` pour le rendre compatible Vue 3.** Le fork
  porterait 20 types de champ dont la console en utilise trois, un système de
  validation qu'elle n'utilise pas, et sa propre feuille de styles à raccorder
  aux tokens. Plus de code à maintenir que la réimplémentation, pour la même
  fonctionnalité.
- **Supprimer la vue formulaire.** Elle est le mode d'édition par défaut de
  l'écran le plus utilisé de la console pour qui ne veut pas écrire du JSON à la
  main. Supprimer une fonctionnalité pour retirer une dépendance n'est pas une
  migration.
- **Attendre la phase 3 et traiter la sortie sous `@vue/compat`.** C'est
  l'ordre inverse : `vue-form-generator` est précisément ce qui empêche
  `@vue/compat` de démarrer ([ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md)
  vaut ici aussi — on retire, puis on migre).
