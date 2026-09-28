# ADR-0056 : Le thème sombre passe avant la fin de shadcn-vue

- **Statut** : Acceptée, modifie l'ordre d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

[ADR-0051](0051-criteres-de-sortie-de-la-v5.md) place le thème sombre
(critère 6) après shadcn-vue (critère 4), « parce que ses primitives apportent
leurs variantes sombres ». Le thème sombre est demandé plus tôt.

Ce que la mise en œuvre d'[ADR-0054](0054-vrai-shadcn-vue.md) a changé :

- **Les variantes `dark:` de l'amont ne sont pas gardées.** Sa décision 1
  remplace les classes du registre par celles des tokens : `dark:bg-input/30`
  et ses semblables disparaissent à chaque report de la DA. L'argument
  d'ADR-0051 ne tient plus.
- **Toutes les primitives lisent déjà leurs couleurs dans les tokens**, qu'elles
  soient reprises ou non. Brancher un jeu sombre dans `tokens.css` les couvre
  toutes ; les lots 5 à 9 d'ADR-0054 n'auront qu'à le vérifier.

Ce qui existe : un jeu `.dark` dans `tokens.css`, branché sur rien. Il garde
l'ancienne palette d'avant la DA, et il lui manque la moitié des tokens
(`label`, `subtle`, `success`, `warning`, `info`, `primary-hover`, ombres).
Le design system produit Kuzzle n'a pas de thème sombre
([ADR-0043](0043-da-kuzzle-pour-la-console.md)).

## Décision

**1. Le critère 6 passe après le lot 4 (`Dialog`) du critère 4**, et avant les
lots 5 à 9. Il est précédé de la barre de session
([ADR-0055](0055-barre-de-session.md)), qui accueille la bascule. Les lots 5 à
9 ajoutent à leur contrôle les captures dans les deux thèmes.

**2. Le jeu sombre est dérivé de la DA**, et non repris de l'ancienne palette :

- surfaces dans la famille Kuzzle Blue (`#002835`), du fond de page aux
  cartes, par paliers d'élévation ;
- le fuchsia reste la couleur primaire, éclairci jusqu'au contraste AA sur
  les surfaces sombres ;
- chaque token du jeu clair a son pendant sombre, et chaque paire employée
  (texte sur fond, bordure de champ, focus) est mesurée comme
  [ADR-0050](0050-contraste-aa-de-la-palette.md) l'a fait pour le clair ;
- la table de `DESIGN.md` gagne une colonne « sombre ».

**3. Une bascule à trois états** : système (par défaut), clair, sombre, dans
la barre de session. Le choix est retenu par navigateur (`kuz-ac-theme`), comme
l'état du rail. La classe `.dark` est posée sur `<html>` avant le montage de
l'application (`initTheme`, `src/composables/useTheme.ts`) ; en mode système,
elle suit `prefers-color-scheme` en direct.

**4. Ce qui ne lit pas les tokens est traité à part, et nommé :**

- Ace : `tomorrow_night`, le pendant sombre du `tomorrow` actuel, pour que la
  coloration du JSON garde son sens ; fond et gouttière pris aux surfaces ;
- ApexCharts : `theme.mode` suit le thème sur fond transparent, les séries
  gardent leurs couleurs ;
- Leaflet : les tuiles et les marqueurs restent tels quels, c'est du contenu ;
- le rail garde sa couleur de connexion, et son élément actif le fuchsia
  profond sous texte blanc (`--rail-active`, 5,8:1) : le `--primary-hover`
  sombre, éclairci, ne porte plus de blanc ;
- le logo Kuzzle des pages hors connexion : bleu Kuzzle sur fond sombre, il
  disparaît ; `KuzzleLogo` prend le logo blanc en sombre ;
- le voile des modales : `bg-foreground/50` s'éclaircirait en sombre, il
  devient un token (`--overlay`).

**5. Les captures se prennent dans les deux thèmes** : `CAPTURES_THEME=dark`
impose le thème de `captures.js`, dans un dossier à part
(`CAPTURES_VERSION=v5-dark`).

## Conséquences

- Le thème sombre arrive avant la sortie, et les lots 5 à 9 de shadcn-vue
  n'ont rien à reprendre pour lui : ils le vérifient.
- Chaque lot suivant se relit dans deux thèmes : les captures doublent.
- Le jeu `.dark` actuel est remplacé, pas corrigé.

## Alternatives écartées

- **Garder l'ordre d'ADR-0051** : son argument ne tient plus, et le besoin
  est là.
- **Suivre le système sans bascule** : on ne peut pas choisir le clair pour
  une démonstration ou une capture sur une machine en sombre.
- **Reprendre l'ancienne palette sombre** : elle est antérieure à la DA et
  incomplète.
