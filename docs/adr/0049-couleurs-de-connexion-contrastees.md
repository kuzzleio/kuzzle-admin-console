# ADR-0049 : Les couleurs de connexion passent le contraste AA

- **Statut** : Acceptée
- **Date** : 2026-09-27
- **Décideurs** : Ricky

## Contexte

Depuis [ADR-0048](0048-rail-de-navigation.md), la couleur de la connexion est le
fond du rail de navigation, sous du texte blanc. La revue `/impeccable
critique` du rail (étape 3 d'[ADR-0043](0043-da-kuzzle-pour-la-console.md)) a
mesuré le contraste du blanc sur les huit couleurs de `_environment.scss` :

| Couleur | Avant | Contraste |
|---|---|---|
| green | `#689F38` | 3,18:1 |
| orange | `#DA740F` | 3,24:1 |
| red | `#E53935` | 4,23:1 |

Les trois échouent au seuil AA (4,5:1), et ce sont justement les couleurs qu'on
choisit pour signaler une production. La même revue a relevé que l'élément
actif, fuchsia `#E64472`, porte son texte blanc à 3,86:1, et se confond avec un
rail rouge ou magenta. ADR-0048 n'avait accepté ce risque que pour magenta.

Les valeurs étaient en dur, avec un commentaire qui les promettait aux tokens.

## Décision

**1. Les couleurs de connexion deviennent des tokens** (`--env-*`,
`tokens.css`) ; `_environment.scss` ne fait plus que les lire.

**2. Vert, orange et rouge sont assombris** jusqu'à 5:1 environ avec du blanc :
`#4E7A29`, `#A85A0B`, `#C62828`. Les cinq autres passent déjà et ne changent
pas. Les noms ne changent pas non plus : une connexion enregistrée en `red`
reste rouge, un peu plus sombre.

**3. L'élément actif du rail passe en fuchsia profond** (`--primary-hover`,
`#C93960`, 4,96:1) **avec un filet blanc de 3 px** à gauche. Le filet le
distingue d'un rail rouge ou magenta, où le fond seul ne suffit pas.

## Conséquences

- Le texte du rail est lisible sur toutes les couleurs de connexion.
- Les connexions vertes, orange et rouges changent légèrement de teinte, sur
  le rail et dans le sélecteur de couleur.
- L'élément actif n'est plus exactement le fuchsia de `DESIGN.md`, mais sa
  version foncée, que le DS utilise déjà au survol des boutons.

## Alternatives écartées

- **Texte foncé sur les couleurs claires** : le rail changerait de lecture
  d'une connexion à l'autre, et le bleu Kuzzle par défaut porte du blanc.
- **Garder les valeurs et accepter le risque** : c'est l'état qu'ADR-0048
  décrivait. La revue montre qu'il touche l'usage le plus sensible, repérer
  une production.
