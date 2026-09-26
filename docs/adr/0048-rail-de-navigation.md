# ADR-0048 : Le rail de navigation porte la couleur de la connexion

- **Statut** : Acceptée
- **Date** : 2026-09-27
- **Décideurs** : Ricky

## Contexte

[ADR-0043](0043-da-kuzzle-pour-la-console.md) place la mise en page en étape 3
de la DA, et `DESIGN.md` en fixe la cible : un rail de navigation à gauche, en
bleu Kuzzle, avec Data, Security et API Action ; survol teinté de fuchsia avec
un filet de 3 px, élément actif en fuchsia plein. La barre de navigation du
haut devait rester « jusqu'au lot de mise en page ».

Deux choses que la console a et que le DS n'a pas :

- **La couleur de connexion.** Chaque connexion choisit une couleur, que
  `MainMenu` applique en fond de la barre (`EnvColor--*`) : c'est ce qui
  distingue d'un coup d'œil la production de la recette (ENV-02 de
  l'inventaire). `environments.spec` le vérifie sur le premier `nav` de la
  page.
- **Le sélecteur de connexion et la déconnexion** vivent dans la barre, à côté
  du nom de l'utilisateur.

Le DS prévoit aussi un rail qui s'ouvre au survol, après 350 ms, en 700 ms.

## Décision

**1. La barre du haut devient un rail vertical à gauche**, à partir de la
largeur `md`. En dessous, il reste une barre horizontale avec son bouton de
menu : un rail de 224 px ne tient pas sur un téléphone.

**2. Le rail porte la couleur de la connexion.** La couleur par défaut d'une
connexion, `darkblue`, vaut `#002835` : c'est le bleu Kuzzle du rail du DS.
Une connexion sans choix particulier a donc exactement le rail du DS, et une
connexion colorée garde le repère que la v4 lui donnait. La couleur ne passe
ni en filet ni en pastille : réduite, elle cesserait de faire son travail.

**3. Les éléments suivent `DESIGN.md`** : icône Font Awesome et libellé en
Ubuntu 500 blanc ; survol en fuchsia à 20 % avec un filet de 3 px à gauche ;
élément actif en fuchsia plein, texte gras. Le sélecteur de connexion, le nom
de l'utilisateur et la déconnexion descendent en pied de rail.

**4. Le rail se replie par un bouton, pas au survol.** Il contient deux menus
déroulants (Feedback, connexions) : un rail qui se referme quand le pointeur
le quitte fermerait aussi le menu qu'on est en train d'ouvrir. Replié, il ne
montre que les icônes, en 64 px ; l'état est retenu par navigateur. Déplié
par défaut.

Les largeurs sont des tokens (`--rail-width`, `--rail-collapsed-width`).

## Conséquences

### Positives

- La console a la silhouette de l'application IoT Kuzzle, sans perdre la
  couleur de connexion.
- La zone de contenu gagne la hauteur de la barre (66 px).
- `environments.spec` reste inchangée : la couleur est toujours sur le `nav`.

### Négatives

- La zone de contenu perd 224 px de largeur (64 px replié). Data garde son
  arbre des index à côté du rail : deux colonnes à gauche sur les écrans
  étroits.
- Sur une connexion colorée en fuchsia (`magenta`), l'élément actif se
  distingue moins bien du fond. Le texte gras et l'icône le portent encore.

### Risques acceptés

- Le repli ne suit pas le DS à la lettre (bouton au lieu du survol), pour la
  raison du point 4.

## Alternatives écartées

- **Rail toujours bleu Kuzzle, couleur de connexion en filet** : fidèle au DS,
  mais la couleur, réduite à un trait, ne sert plus à reconnaître une
  connexion de loin.
- **Garder la barre du haut** : c'est l'état actuel, et `DESIGN.md` la
  désigne comme provisoire.
- **Rail qui s'ouvre au survol** : voir le point 4.
