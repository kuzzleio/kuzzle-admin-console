# ADR-0043 : la DA de la console est celle du design system produit Kuzzle

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

Depuis la phase 1, les tokens de `src/assets/tokens.css` reprennent la palette
de la v4 (`styles/_variables.scss`) : ADR-0003 a posé la plomberie en disant
explicitement que « l'apparence n'est pas décidée ». Le tableau de bord le
répète en § 1.2, et le thème sombre est défini sans être branché.

Le 2026-09-25, Ricky a fourni le design system produit Kuzzle, tenu dans un
projet Claude Design
([« Kuzzle Design System »](https://claude.ai/design/p/243f828d-6dce-4f59-8546-e00feeb60eb8?file=Kuzzle+Design+System.dc.html)).
Il a été écrit pour l'**application Kuzzle IoT** (actifs, appareils, groupes,
soft-tenants), en 18 sections : logo, couleurs, typographie, espacements,
rayons, élévations, boutons, badges, pills, cartes, champs, tables, onglets,
tooltip de mesure, icônes, navigation, pages de détail, soft-tenants,
navigation hiérarchique.

Constats en le confrontant à la console :

- Il inverse les rôles de couleur de la v4 : l'accent devient le **fuchsia**
  `#E64472` (la v4 avait `--primary` en bleu Kuzzle `#002835`), et le bleu
  Kuzzle passe au rail de navigation, aux tooltips et au texte fort. Le rose
  destructif de la v4 (`#E94E77`) est presque le nouvel accent ; le DS met
  l'erreur en `#DC3545`.
- Il est rédigé en français ; la console est en anglais, sans i18n.
- Il prévoit Gobold en titre et note qu'elle « n'est pas disponible sur le
  web », avec Oswald en repli. La console embarque déjà
  `src/assets/fonts/gobold/Gobold.ttf.woff`, sans `@font-face` qui la charge.
  Même chose pour Ubuntu, déclarée dans `--font-sans` mais chargée nulle part :
  la console s'affiche aujourd'hui dans la police sans-serif du système.
- Il charge ses polices et Font Awesome 6.5.1 depuis des CDN. La console
  embarque `@fortawesome/fontawesome-free` 6.7.2, que § 3.3 classait « à
  réévaluer avec le nouveau design system ».

## Décision

**Le design system produit Kuzzle est la direction artistique de la console.**
Il est transposé dans [`DESIGN.md`](../../DESIGN.md), à la racine, dans le
format que lit l'outil de revue design ([ADR-0044](0044-impeccable-versionne-sans-hooks.md)).
Une copie figée de ses tokens vit dans [`docs/design-system/`](../design-system/).

Périmètre :

- **On reprend** les fondations (couleurs, typographie, espacements, rayons,
  élévations teintées, durées) et les composants génériques : boutons, badges
  et tags, cartes (dont la carte signature à filet fuchsia), champs, tables,
  onglets et contrôle segmenté, tooltip sombre, rail de navigation.
- **On ne reprend pas** le vocabulaire IoT : pills de mesure, KHero
  Actif/Appareil/Groupe, tags de soft-tenant, ossature des pages de détail.
  La console n'a pas ces objets.
- **La langue reste l'anglais.** Les règles de casse et de ton du DS
  s'appliquent (labels en capitales par CSS, sentence case, données en
  monospace), pas sa langue.
- **Le vocabulaire des tokens reste celui de shadcn-vue** (ADR-0003) : le DS
  fournit les valeurs, `DESIGN.md` donne la correspondance
  (`--primary` ← `--primary`, `--muted` ← `--panel`, `--border` ← `--grey-bright`…).
- **Font Awesome reste** le système d'icônes : le DS l'impose. La ligne de § 3.3
  passe en ➖.

Séquence (décidée le 2026-09-25) :

1. **D'abord la comparaison v4 / v5** sur la palette actuelle : inventaire
   fonctionnel, captures des mêmes écrans sur les deux versions, tri des
   écarts. Appliquer la DA avant rendrait chaque écran différent de la v4, et
   les régressions de la sortie de Bootstrap se noieraient dans les écarts
   voulus.
2. **Ensuite un lot « tokens + primitives »** : valeurs de `tokens.css`,
   chargement des polices embarquées, ombres et rayons, et les 20 primitives de
   `src/components/ui/`. Les captures v5 de l'étape 1 servent de « avant ».
3. **Puis la mise en page, écran par écran** : rail de navigation, en-têtes de
   page, cartes. Chaque écran est un lot, revu avec `/impeccable critique` et
   `audit`.

## Conséquences

### Positives

- La console cesse d'être la seule interface Kuzzle sans identité : elle parle
  le même langage visuel que l'application IoT.
- La question ouverte depuis ADR-0003 (« l'apparence n'est pas décidée ») a une
  réponse, avec une source qu'on peut citer.
- Le lot 2 ne touche qu'un fichier de tokens et des primitives : c'est
  exactement ce qu'ADR-0003 promettait d'acheter.

### Négatives

- Le changement de rôle de `--primary` et de `--destructive` touche tous les
  sites d'appel qui s'en servaient pour leur couleur plutôt que pour leur sens.
  Il faudra les relire un par un au lot 2.
- Le DS n'a pas de thème sombre. Le jeu `.dark` de `tokens.css` reste
  débranché ; s'il est un jour activé, il faudra le dériver, pas le reprendre.
- Deux sources à tenir alignées : le projet Design et `DESIGN.md`. La copie de
  `docs/design-system/` rend l'écart visible en revue.

### Risques acceptés

- **La licence de Gobold n'est pas documentée** dans le repo. Elle y est depuis
  la v4 ; le lot 2 ne la chargera qu'après confirmation, et Oswald sert de
  repli en attendant.
- Le DS évoluera (il annonce une « phase 2 » pour les variantes de pills). On
  suivra ses fondations ; les écarts propres à la console se décident ici, par
  ADR.

## Alternatives écartées

- **Garder la palette v4 et seulement la « nettoyer ».** La demande de refonte
  UI/UX est explicite depuis ADR-0003, et une DA produit existe désormais.
- **Reprendre le DS en entier, KHero compris.** Il faudrait inventer des
  équivalents IoT pour des objets qui n'en ont pas (index, collection, rôle) :
  on copierait une forme sans son sens.
- **Adopter aussi la langue française.** C'est un chantier d'i18n, pas de DA,
  et les specs lisent les libellés anglais.
- **Charger polices et icônes depuis les CDN du DS.** La console est servie en
  image Docker et parfois hors ligne sur un poste de dev ; elle embarque déjà
  Font Awesome et Gobold. Seule exception aujourd'hui : Cousine, la police mono
  de l'éditeur, chargée depuis Google Fonts (`styles/_fonts.scss`) — le lot 2
  la rapatrie ou la remplace par la pile mono du DS.
- **Appliquer la DA avant la comparaison v4 / v5.** Voir *Séquence* : on
  perdrait la seule occasion de voir les régressions visuelles de la phase 2.
