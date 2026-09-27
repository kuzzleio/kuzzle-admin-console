# ADR-0050 : La palette de la DA est ajustée au contraste AA

- **Statut** : Acceptée
- **Date** : 2026-09-27
- **Décideurs** : Ricky

## Contexte

L'audit `/impeccable audit` des écrans principaux (étape 3
d'[ADR-0043](0043-da-kuzzle-pour-la-console.md)) a mesuré les paires de tokens
réellement employées. Trois valeurs du DS, reprises telles quelles dans
`tokens.css`, échouent aux seuils WCAG AA :

| Token | Valeur du DS | Usage | Contraste |
|---|---|---|---|
| `--primary` | `#E64472` | fond des boutons principaux, texte blanc | 3,86:1 |
| `--primary` | `#E64472` | texte des liens, sur blanc / fond de page | 3,86 / 3,61:1 |
| `--muted-foreground` | `#6C757D` | texte secondaire, sur fond de page / Panel Grey | 4,38 / 4,14:1 |
| `--input` | `#D0DDE1` | bordure des champs, sur blanc | 1,39:1 (seuil 3:1, 1.4.11) |

Les boutons principaux (Login, Create, Quick Search, RUN) et tous les liens
fuchsia sont concernés, ainsi que 108 usages du texte secondaire.
[ADR-0049](0049-couleurs-de-connexion-contrastees.md) avait déjà assombri
l'élément actif du rail pour la même raison.

## Décision

**La console s'écarte du DS d'un cran sur ces trois valeurs**, et s'y tient
partout ailleurs :

- `--primary` : `#C93960` (le « Fuchsia Deep » du DS, 4,96:1 avec du blanc,
  4,63:1 comme lien sur le fond de page) ; `--primary-hover` : `#B8325A`
  (5,77:1).
- `--muted-foreground` : `#5C6670` (5,46:1 sur le fond de page, 5,16:1 sur
  Panel Grey, 5,85:1 sur blanc).
- `--input` : `#7B939B` (3,24:1). `--border` garde le Hairline `#D0DDE1` pour
  les filets et séparateurs, qui ne portent pas d'information.

`DESIGN.md` note l'écart dans sa table de correspondance.

## Conséquences

- Les boutons, liens et textes secondaires passent AA partout où l'audit les a
  mesurés.
- Le fuchsia de la console est celui que le DS emploie au survol : un cran plus
  sombre que la charte. Le repère de marque reste, la couleur est moins vive.
- Les champs ont une bordure nettement visible, plus contrastée que le
  Hairline du DS.

## Alternatives écartées

- **Garder le fuchsia du DS pour les fonds et assombrir le seul texte** : la
  paire blanc sur `#E64472` échoue dans les boutons eux-mêmes, qui sont le
  premier usage du fuchsia.
- **Texte foncé sur les boutons fuchsia** : contraire au DS, qui met du blanc
  sur le fuchsia, et moins lisible qu'un fuchsia assombri.
- **Ne rien changer** : la console est un outil de travail quotidien ; un texte
  secondaire à 4,1:1 sur 108 écrans n'est pas un détail.
