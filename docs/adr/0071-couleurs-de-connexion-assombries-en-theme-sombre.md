# ADR-0071 : En thème sombre, les couleurs de connexion sont assombries

- **Statut** : Acceptée
- **Date** : 2026-10-03
- **Décideurs** : Ricky
- **Précise** : [ADR-0056](0056-theme-sombre-avance.md) (« le rail garde sa couleur de connexion ») et [ADR-0049](0049-couleurs-de-connexion-contrastees.md) (valeurs des `--env-*`)

## Contexte

Retour de QA sur console-v5, 2026-10-03 : en thème sombre, le rail d'une
connexion `lightblue` est « trop agressif ». Les couleurs de connexion ont été
choisies pour porter du texte blanc sur un fond clair ; posées à côté d'une
page `#06161C`, elles deviennent la surface la plus claire et la plus saturée
de l'écran, plus forte que le contenu.

| Couleur | Luminance OKLCH | Contraste avec la page sombre |
|---|---|---|
| darkblue `#002835` | 0,26 | 1,2:1 |
| lightblue `#0277BD` | 0,55 | 3,6:1 |
| magenta `#D81B60` | 0,57 | 3,6:1 |

Seul `darkblue`, la couleur par défaut, s'intègre au thème sombre.

## Décision

**Sous `.dark`, les sept autres couleurs de connexion sont redéfinies** : même
teinte, luminance OKLCH bornée à 0,40, chroma réduite d'un quart.

| Couleur | Clair | Sombre | Blanc dessus |
|---|---|---|---|
| lightblue | `#0277BD` | `#004B7C` | 9,1:1 |
| purple | `#8E24AA` | `#68207C` | 10,1:1 |
| green | `#4E7A29` | `#335219` | 8,9:1 |
| orange | `#A85A0B` | `#6D3700` | 9,6:1 |
| red | `#C62828` | `#851617` | 9,9:1 |
| grey | `#546E7A` | `#394B53` | 9,1:1 |
| magenta | `#D81B60` | `#880037` | 10,0:1 |

`darkblue` ne change pas. L'élément actif garde `--rail-active` et son filet
blanc : sur un rail rouge ou magenta assombri, c'est encore le filet qui le
distingue, comme en clair (ADR-0049).

## Conséquences

- Le rail garde la teinte de sa connexion, qui reste reconnaissable — une
  production rouge reste rouge — sans dominer la page.
- Le contraste du texte blanc monte (8,9:1 au moins, contre 5:1 en clair).
- Les pastilles du sélecteur de couleur suivent le thème, comme le rail.

## Alternatives écartées

- **Rail en `darkblue` en sombre, couleur de connexion sur un liseré** : on
  perd le signal le plus visible d'une production, qui est la raison d'être
  de la couleur (ADR-0048).
- **Mélange avec la page par `color-mix()`** : un réglage unique, mais des
  valeurs que la table de contraste de `DESIGN.md` ne peut pas citer.
