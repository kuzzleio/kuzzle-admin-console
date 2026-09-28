# ADR-0055 : Une barre de session, en haut à droite

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

[ADR-0048](0048-rail-de-navigation.md) a rangé l'utilisateur connecté au pied
du rail (« Signed in as »), avec la déconnexion. Rail replié, ce bloc est
masqué : il ne reste que l'icône de déconnexion.

Or l'utilisateur connecté est une information de travail, pas de compte : il
dit avec quels droits on agit sur l'instance. Sur la v4, il était en haut à
droite, visible en permanence. Rail replié, la v5 ne le montre plus nulle part,
et c'est le mode que choisissent ceux qui passent la journée dans la console.

Deux emplacements ont été comparés : une barre en haut à droite, comme en v4,
et le rail replié, avec un avatar aux initiales et le nom tronqué. Un nom de
compte comme `admin-kuzzle-saintjeandeluz` se tronque en « admin-k… », qui ne
dit plus rien.

## Décision

**1. Une barre de session, en haut de la zone de contenu, alignée à droite.**
Elle porte le nom complet de l'utilisateur (« Anonymous » pour une session
anonyme). Elle ne dépend pas de l'état du rail, et reste visible sous `md`.

**2. Le nom ouvre un menu** (`DropdownMenu`) : les profils de l'utilisateur,
puisque ce sont eux qui disent les droits, puis « Log out ». La déconnexion
quitte le pied du rail, qui ne garde que la connexion et le repli.

**3. La barre accueille la bascule de thème** d'[ADR-0056](0056-theme-sombre-avance.md).
Elle ne porte rien d'autre : la navigation reste dans le rail, le titre dans
la page.

**4. Hauteur : celle d'une ligne de boutons** (`h-12`), fond de page, sans
filet : elle ne doit pas se lire comme un second en-tête.

**5. Les specs se déconnectent par `cy.logout()`**, qui ouvre le menu puis
clique « Log out » : le sélecteur est isolé dans `support/commands.js`.

## Conséquences

- L'utilisateur connecté se lit à tout moment, rail ouvert ou replié.
- Le pied du rail s'allège ; le rail replié n'y perd rien.
- Chaque page perd 48 px de hauteur. Les vues qui calculent leur hauteur
  (`Data`, `API Action`) sont à revérifier, au même titre que la mise en page
  sous 400 px (G-081).
- Les trois specs qui cliquaient la déconnexion du rail passent par
  `cy.logout()`.

## Alternatives écartées

- **L'utilisateur dans le rail replié** : pas de place pour un nom complet,
  et une infobulle n'est pas « visible à tout moment ».
- **Garder le rail tel quel et afficher le nom au survol** : même défaut.
- **Une barre pleine largeur au-dessus du rail** : elle déplace la marque et la
  couleur de connexion qu'ADR-0048 a mises dans le rail.
