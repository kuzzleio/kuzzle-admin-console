# ADR-0021 : splitter écrit à la main, et onglets montés en permanence dans ApiAction

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky

## Contexte

`ApiAction` est le dernier écran de la phase 2, et le seul qui restait bloqué
sur une décision : `vue-multipane` 0.9.5, **abandonné**, tient le
redimensionnement à trois endroits — `Data/Layout.vue` (la barre latérale de
Data), `ApiAction.vue` (la liste des requêtes sauvegardées) et
`ApiAction/QueryCard.vue` (l'éditeur face à la réponse).

Ce que la bibliothèque fait réellement, une fois lu : elle écoute un
`mousedown` sur une poignée, suit la souris, et **écrit `width` sur le nœud DOM
qui précède la poignée**. Elle émet `paneResizeStop` avec ce nœud ; `Data/Layout`
en relit `scrollWidth` pour le persister. C'est tout.

Deux conséquences, visibles dans le code existant :

- la poignée est un `<div>` sans rôle ni `tabindex` : **le redimensionnement
  n'existe pas au clavier**, et rien ne l'annonce ;
- le style de la poignée ne peut pas être posé en utilitaires, puisque le nœud
  vient de la bibliothèque : `Data/Layout.vue` gardait un `<style scoped>` de
  30 lignes pour l'habiller (§ 1.3).

Le second sujet est apparu en migrant les onglets d'ApiAction. `b-tabs` gardait
tous ses panneaux montés ; ADR-0017 a décidé l'inverse, et la spec
« Should persist query by tabs » l'a immédiatement mis en défaut : on tape
`tab0` dans l'éditeur, on change d'onglet, on revient — le texte a disparu.

La cause n'est pas le démontage en lui-même : `QueryCard` ne remonte au parent
que les saisies qui sont **un JSON valide** (`editedQuery` n'est mis à jour que
si `isQueryValid`). `tab0` n'en est pas un. Avec `b-tabs`, le panneau restait
monté et la saisie survivait par accident.

## Décision

**1. Le splitter est écrit à la main**, avec l'API publique de shadcn-vue
(ADR-0009) : `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`.
`vue-multipane` est retiré des dépendances.

**2. Le groupe ne touche pas au style des panneaux.** Il émet `resize` avec la
nouvelle taille en pixels ; le site d'appel en fait ce qu'il veut — la persister
pour Data, la garder en mémoire pour ApiAction. C'est la différence de fond avec
`vue-multipane`, qui écrivait dans le DOM : un composant qui modifie un nœud
qu'il ne rend pas est un composant dont on ne peut pas prévoir l'effet.

**3. La poignée est un `<button role="separator">`**, déplaçable aux flèches du
clavier par pas de 16 px. Le redimensionnement cesse d'être réservé à la souris.

**4. Un seul séparateur par groupe.** La console n'a que des découpes à deux
panneaux, aux trois endroits. Le jour où il en faudra trois, ce sera une reprise
de la primitive, pas une rustine au site d'appel.

**5. `TabsContent` reçoit `force-mount`, et ApiAction s'en sert.** C'est
l'échappatoire que l'amont prévoit, et elle ne contredit pas ADR-0017 : la règle
reste le démontage, l'exception est nommée au site d'appel et justifiée —
**un panneau qui porte un état que son hôte ne sait pas restaurer**.

**6. La saisie invalide n'est pas remontée au parent pour autant.** Ce serait
l'autre correctif possible : émettre le texte brut en plus de l'objet. Il change
le contrat entre `QueryCard` et `ApiAction` — donc le format des requêtes
sauvegardées — pour un gain que `force-mount` obtient sans rien casser. Si la
persistance d'un brouillon invalide devient un besoin produit, c'est une
décision à prendre pour elle-même.

## Conséquences

### Positives

- **`vue-multipane` sort**, et avec lui l'une des quatre dépendances sans chemin
  de migration vers Vue 3 (§ 3.1). Il n'en reste que `vue-form-generator`.
- Le `<style scoped>` de 30 lignes de `Data/Layout.vue` disparaît : la poignée
  est notre nœud, elle prend des utilitaires.
- Le redimensionnement est utilisable au clavier et annoncé comme un séparateur.
- **Les 58 dernières balises `<b-*>` de la console partent avec ce lot.**

### Négatives

- `force-mount` monte les quatre éditeurs Ace d'ApiAction en même temps. C'était
  déjà le cas avec `b-tabs` ; ce n'est pas une régression, mais ce n'est pas un
  progrès non plus, et ça restera à revoir si le nombre d'onglets grandit.
- La primitive ne gère ni les tailles minimales par panneau, ni le repli
  (`collapsible`), que l'amont expose. Aucun des trois sites d'appel ne s'en
  sert ; `min-width` suffit là où il en faut une.

### Risques acceptés

- Le pas clavier (16 px) est une constante de la primitive, pas un token. C'est
  une vitesse d'interaction, pas une valeur de design.

## Alternatives écartées

- **Garder `vue-multipane` jusqu'à la phase 3.** C'était le plan (§ 3.1) ; il
  supposait qu'on ne toucherait pas aux trois écrans concernés. Ils sont
  justement les trois derniers de la phase 2.
- **Reprendre `splitpanes`, ce qu'utilise shadcn-vue en amont.** Une dépendance
  de plus, pour un composant qui tient en trois fichiers courts, et dont la
  version Vue 2 n'est plus maintenue non plus.
- **Un `<div>` avec `resize: horizontal` en CSS.** Le navigateur sait le faire,
  mais seulement depuis le coin du bloc, sans persistance et sans clavier.
