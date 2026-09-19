# ADR-0010 : Écrire `Dialog` à la main, et abandonner l'API impérative des modales

- **Statut** : Acceptée
- **Date** : 2026-09-19
- **Décideurs** : Ricky

## Contexte

La phase 2 bute sur les modales : **19 composants** utilisent `b-modal`, et
`b-modal` n'est pas seulement une balise à remplacer. C'est un système complet
avec son registre global.

Faits relevés dans le code :

1. **L'API est impérative et s'adresse à un identifiant.** 52 appels à
   `this.$bvModal.show('modal-env-delete')` / `.hide(...)`, souvent depuis un
   composant qui n'est pas le parent de la modale — `App.vue` ouvre une modale
   que `Offline.vue` a demandée. L'état d'ouverture n'appartient à personne : il
   vit dans un registre global de `bootstrap-vue`, indexé par chaîne de
   caractères.

2. **L'amont est déclaratif.** shadcn-vue expose `Dialog` avec `open` et
   `update:open` : l'état appartient au composant qui affiche la modale, comme
   n'importe quelle autre donnée.

3. **Vue 2.7 n'a pas de `<Teleport>`.** Une modale rendue à sa place dans
   l'arbre est prisonnière du premier ancêtre qui porte un `transform`, un
   `filter` ou un `overflow: hidden` — le `position: fixed` s'y recale, et la
   modale s'affiche décalée ou tronquée.

4. **`reka-ui`, qui fournit `DialogRoot` en amont, demande Vue 3**
   ([ADR-0009](0009-contrat-des-primitives-ui.md)). Le piège d'accessibilité est
   donc à notre charge : sans piège de focus, la tabulation sort de la modale et
   continue derrière l'écran assombri, ce qui ne se voit pas à la souris.

## Décision

**1. `Dialog` est écrite à la main, déclarative, à l'API de shadcn-vue.**
`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`,
`DialogFooter`, `DialogClose`. L'ouverture est un booléen que le composant
appelant possède.

**2. On n'écrit pas de compatibilité pour `$bvModal`.** Il serait tentant de
fournir un registre maison pour migrer les 19 composants sans toucher aux 52
appels. Ce serait reconduire, après le départ de Bootstrap, le défaut qu'on
cherche à supprimer : un état d'ouverture qui n'appartient à personne. Chaque
écran repris convertit ses appels en booléen. C'est plus cher, une fois.

**3. La modale est déplacée dans `<body>` par la primitive**, à l'ouverture, et
retirée à la fermeture. C'est ce que fait déjà `bootstrap-vue`, et c'est ce que
`<Teleport>` fera en phase 4 — le jour venu, le remplacement se voit dans un
seul fichier.

**4. Le comportement d'accessibilité est dans la primitive, pas dans les sites
d'appel** : `role="dialog"`, `aria-modal`, libellé relié au titre, focus posé à
l'ouverture et rendu à l'élément déclencheur à la fermeture, piège de focus sur
`Tab`, fermeture sur `Échap`, défilement du fond bloqué. Un site d'appel ne doit
pas pouvoir produire une modale inaccessible par omission.

## Conséquences

### Positives
- L'état d'ouverture devient lisible : il est dans le composant, pas dans un
  registre global indexé par chaîne.
- Le remplacement par `reka-ui` en phase 4 est un changement d'import, comme
  pour les autres primitives.
- Les comportements d'accessibilité sont écrits une fois, au lieu d'être
  supposés hérités de `bootstrap-vue`.

### Négatives
- Chaque écran à modale coûte plus cher : il faut convertir ses appels
  impératifs. 19 composants, 52 appels.
- Le piège de focus et le blocage du défilement sont du code que nous
  maintenons, jusqu'à `reka-ui`.

### Risques acceptés
- Le déplacement du nœud dans `<body>` sort la modale de l'arbre que Vue gère
  visuellement. Vue continue d'en posséder le vnode ; la primitive doit retirer
  le nœud avant destruction, faute de quoi il reste orphelin dans le DOM. C'est
  le point à vérifier en revue sur toute évolution de `Dialog`.

## Alternatives écartées

- **Un registre maison compatible `$bvModal`.** Migre les 19 composants sans
  rien reprendre — et enterre le problème au lieu de le traiter. Le jour où
  `reka-ui` arrive, il faudrait tout refaire.
- **Garder `b-modal` jusqu'à la phase 4.** Reviendrait à garder `bootstrap-vue`
  pour 19 composants, donc à ne pas finir la phase 2 — ce qu'ADR-0002 refuse.
- **Rendre la modale à sa place dans l'arbre, sans déplacement.** Marche sur la
  plupart des écrans, casse sur ceux qui ont un ancêtre transformé. Un défaut
  qui ne se manifeste que sur certains écrans est pire qu'un défaut constant.
