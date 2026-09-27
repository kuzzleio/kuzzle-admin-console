# ADR-0047 : Les polices de la DA sont embarquées, Gobold comprise

- **Statut** : Acceptée
- **Date** : 2026-09-26
- **Décideurs** : Ricky

## Contexte

[ADR-0043](0043-da-kuzzle-pour-la-console.md) fait du design system produit
Kuzzle la DA de la console, et place les polices au début du lot « tokens +
primitives ». `DESIGN.md` prévoit quatre familles : Gobold (titres de marque),
Montserrat 800 (titres de page et de section), Ubuntu 400 / 500 / 700 (texte et
interface), et une pile mono système pour les données.

État avant ce lot :

- `--font-sans` déclare Ubuntu, que rien ne charge : la console s'affiche dans
  la police sans-serif du système, différente d'un poste à l'autre.
- La classe `.code` charge Cousine depuis Google Fonts (`styles/_fonts.scss`) :
  seule dépendance réseau de la console à l'exécution. ADR-0043 prévoyait de la
  « rapatrier ou [la] remplace[r] par la pile mono du DS ».
- `src/assets/fonts/` contient Gobold (depuis la v4, sans `@font-face`), Roboto
  et Anonymous Pro, qu'aucun fichier ne charge.
- ADR-0043, *Risques acceptés* : « la licence de Gobold n'est pas documentée ;
  le lot 2 ne la chargera qu'après confirmation ».

## Décision

**1. Toutes les polices sont servies par la console**, aucune par un CDN : la
console tourne en image Docker, parfois hors ligne sur un poste de dev.
`src/assets/fonts.css`, importé par `tailwind.css`, les déclare.

**2. Ubuntu et Montserrat viennent de `@fontsource`** (`@fontsource/ubuntu`,
licence UFL ; `@fontsource/montserrat`, OFL), en version exacte. Seules les
graisses de `DESIGN.md` sont importées : Ubuntu 400, 500, 700 ; Montserrat 800.

**3. Gobold est chargée.** Ricky a confirmé la licence le 2026-09-26, ce qui
lève le risque qu'ADR-0043 avait accepté. Seul le `.woff` est gardé, déclaré en
700 : c'est la seule graisse du fichier et celle que demande `DESIGN.md`, et le
navigateur ne synthétise pas de faux gras par-dessus.

**4. Pas de police mono embarquée.** `--font-mono` reprend la pile système du DS
(`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`) ; `.code` la lit. Cousine
et l'appel à Google Fonts disparaissent.

**5. Oswald n'est pas embarquée.** Elle reste dans `--font-display` comme repli
nommé, mais n'aurait d'effet que si le fichier de Gobold, servi par la console
elle-même, manquait.

**6. Roboto et Anonymous Pro sont supprimées**, ainsi que les formats `.eot` et
`.svg` de Gobold : aucun navigateur visé ne les demande.

Les familles sont posées dans `tokens.css` (`--font-sans`, `--font-heading`,
`--font-display`, `--font-mono`). L'échelle typographique (tailles,
interlignages, capitales des libellés) n'est pas dans ce lot : elle vient avec
les primitives.

## Conséquences

### Positives

- La console s'affiche partout dans la même police, et en Ubuntu comme le DS.
- Plus aucune requête vers un tiers au chargement.
- Les données (IDs, noms de rôles) passent à la pile mono du DS, que la ligne
  « The Mono For Data Rule » de `DESIGN.md` demande.

### Négatives

- `dist/` gagne environ 1,2 Mo de fichiers de polices : `@fontsource` fournit
  tous les sous-ensembles (latin, cyrillique, grec…) en `woff2` et `woff`. Le
  navigateur n'en télécharge que ce que la page affiche (`unicode-range`), mais
  l'image Docker les porte tous.
- Les identifiants changent d'apparence : Cousine laisse place à la mono du
  système, qui varie d'un OS à l'autre (SF Mono, Menlo, Consolas).

### Risques acceptés

- La confirmation de licence de Gobold est orale ; le document de licence n'est
  pas dans le dépôt.

## Alternatives écartées

- **Charger Ubuntu et Montserrat depuis Google Fonts**, comme le fait le DS :
  écarté par ADR-0043 (image Docker, postes hors ligne).
- **Copier les fichiers de polices dans `src/assets/fonts/`** : c'est
  reprendre à la main ce que `@fontsource` maintient, avec ses `@font-face` et
  ses `unicode-range`, sans mise à jour possible par `npm`.
- **Rapatrier Cousine** : le DS ne la prévoit pas, et elle serait la seule
  police de la console hors de `DESIGN.md`.
- **Embarquer Oswald** : un fichier de plus pour un repli qui ne joue que si la
  console ne sert pas ses propres fichiers.
