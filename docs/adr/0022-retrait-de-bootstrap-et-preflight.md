# ADR-0022 : Bootstrap sort, le preflight entre — les deux dans le même geste

- **Statut** : Acceptée
- **Date** : 2026-09-22
- **Décideurs** : Ricky
- **Clôt** : la phase 2 ouverte par [ADR-0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md), et deux des trois réglages d'[ADR-0008](0008-cohabitation-tailwind-bootstrap.md)

## Contexte

`grep -rn "<b-" src` ne retourne plus que des mentions en commentaire, et
`$bvToast` / `$bvModal` n'ont plus un seul appel. Les deux paquets peuvent
sortir.

ADR-0008 avait posé trois réglages de cohabitation en annonçant qu'ils
« se retirent mécaniquement avec Bootstrap ». **C'était faux pour l'un d'eux et
vrai pour aucun des deux autres** — ce que la première capture d'écran a montré
en une seconde.

Une fois `bootstrap.scss` retiré, la console perd **le *reboot* de Bootstrap** :
la police de base, les liens sans soulignement, les marges et tailles des
titres. Le résultat n'est pas « Bootstrap en moins », c'est « les styles par
défaut du navigateur » — titres en serif, liens soulignés, sur tous les écrans.
Le retrait du paquet et le chargement du preflight ne sont donc pas deux étapes :
c'est un seul geste, sous peine de livrer un état intermédiaire cassé.

## Décision

**1. `bootstrap` et `bootstrap-vue` sont retirés** des dépendances, de
`main.ts`, de `style.scss` et du découpage de bundle de `vite.config.ts`.

**2. Le preflight de Tailwind est chargé dans le même changement.** C'est lui
qui pose désormais la base : police, `line-height`, liens, marges. Il rend aussi
inutiles — sans les rendre fausses — les précautions prises par les primitives
contre son absence (G-021 pour `<button>`, G-030 pour `<ul>`).

**3. Un titre porte sa taille.** Le preflight remet `h1`–`h6` à la taille du
texte courant. Les primitives le faisaient déjà (`CardTitle`, `DialogTitle`) ;
les neuf titres bruts restants reçoivent la leur. C'est le prix, et c'est le
bon : une taille de titre est une décision de design, pas un défaut de
navigateur.

**4. La couche `legacy` reste.** Elle ne contient plus Bootstrap, mais toujours
nos feuilles SCSS historiques, FontAwesome et `vfg.css`. Tant qu'elles sont là,
la règle qui les fait perdre face aux utilitaires a la même utilité qu'avant.

**5. Le préfixe `tw:` reste aussi.** Le retirer est une réécriture mécanique de
plusieurs milliers de classes dans 140 fichiers. Ça n'a rien à faire dans le
même diff que le retrait d'un framework : ce sera une PR à soi, dont le diff
doit être lisible comme « uniquement un renommage ».

## Conséquences

### Positives

- **Le bundle perd un morceau de 1 042 ko** (244 ko gzip) et la feuille CSS de
  Bootstrap. Le découpage `manualChunks` perd son entrée `bootstrap`.
- Les deux dépendances les plus bloquantes pour Vue 3 (§ 3.1 de `MIGRATION.md`)
  disparaissent. Il ne reste que `vue-form-generator`.
- **La phase 3 devient possible** : c'était la condition posée par ADR-0002.
- `$theme-colors` et la règle `.navbar .navbar-nav .nav-link` de
  `_override.scss` partent avec ce qu'elles habillaient.

### Négatives

- **Le rendu change partout, un peu.** Le preflight n'est pas le *reboot* :
  les marges par défaut, la hauteur de ligne et la taille des contrôles de
  formulaire ne sont pas identiques au pixel près. Les 17 specs valident le
  comportement ; l'apparence a été regardée sur les écrans principaux, pas sur
  les 107.
- `vfg.css` reste, et son rendu dépendait en partie de Bootstrap. Le formulaire
  de document a été regardé et tient ; il sera de toute façon réécrit avec
  `vue-form-generator`.

### Risques acceptés

- Un écran peu fréquenté peut avoir un espacement inattendu. Le coût de
  découvrir cela en usage est plus faible que celui de garder 1 Mo de CSS mort
  pour s'en prémunir.

## Alternatives écartées

- **Retirer les paquets et garder le preflight désactivé.** Testé en premier, et
  réfuté par la capture : la console se retrouve en Times New Roman.
- **Écrire notre propre feuille de base** au lieu du preflight. Réinventer un
  reset que Tailwind maintient déjà, pour le seul plaisir de ne pas dépendre de
  lui.
- **Tout faire d'un coup — paquets, preflight et préfixe.** Le retrait du
  préfixe touche 140 fichiers sans changer un seul comportement : mélangé au
  reste, plus personne ne peut relire ni l'un ni l'autre.
