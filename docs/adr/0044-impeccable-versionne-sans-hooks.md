# ADR-0044 : Impeccable versionné dans le repo, sans ses hooks

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

Les 17 specs Cypress vérifient le comportement, pas le rendu. Aucune revue
visuelle n'a accompagné la sortie de Bootstrap, et une bonne part des gotchas
étaient justement des régressions visuelles silencieuses (puces de liste, fonds
de boutons, z-index). La DA Kuzzle ([ADR-0043](0043-da-kuzzle-pour-la-console.md))
va maintenant changer l'apparence de chaque écran.

Ricky a demandé d'ajouter au projet [Impeccable](https://impeccable.style/docs/)
(`pbakaus/impeccable`, Apache 2.0) : un skill de design pour agents, avec 24
commandes (`critique`, `audit`, `polish`, `layout`, `typeset`…). Il lit deux
fichiers à la racine du projet : `PRODUCT.md` (le produit, ses utilisateurs,
ses contraintes) et `DESIGN.md` (le système visuel).

Ce qu'installe `npx impeccable install --scope=project` pour Claude Code, mesuré
sur le commit `9d715cc` (2026-09-24) :

- `.claude/skills/impeccable/` : le skill (Markdown), un lanceur shell
  `scripts/impeccable` et quelques scripts pour le mode live — 2,2 Mo ;
- `.claude/settings.json` : trois **hooks** (`SessionStart`, `PostToolUse` sur
  `Edit|Write`, `Stop`) qui lancent `scripts/impeccable hook`.

Le lanceur n'est pas autonome : il télécharge au premier appel un binaire
(`engine-v0.1.6`) depuis les releases GitHub du projet, dans
`~/.impeccable/bin/`, et vérifie sa somme SHA-256 contre un fichier `.sha256`
publié au même endroit. Avec les hooks, ce binaire s'exécuterait à chaque
ouverture de session, à chaque modification de fichier et à chaque fin de tour,
pour toute personne qui ouvre le repo dans Claude Code.

## Décision

- **Le skill est versionné** dans `.claude/skills/impeccable/`, copié depuis le
  commit `9d715cc` de `pbakaus/impeccable`, avec sa `LICENSE` et son
  `NOTICE.md`. Il n'est pas modifié : une mise à jour remplace le dossier
  entier et nomme le nouveau commit dans la PR.
- **Les hooks ne sont pas installés.** Le détecteur ne tourne que quand
  quelqu'un appelle `/impeccable`, c'est-à-dire sur une action explicite. Il
  télécharge alors le binaire, comme décrit plus haut.
- **`PRODUCT.md` et `DESIGN.md` vivent à la racine**, en anglais : ce sont les
  chemins et les titres de section que le skill lit (format DESIGN.md de
  Google Labs), et la langue de l'interface qu'ils décrivent. Le reste de la
  documentation du chantier reste en français.
- Usage attendu : `/impeccable critique` et `/impeccable audit` sur chaque
  écran repris au lot de mise en page (ADR-0043, étape 3), et sur le tri des
  écarts v4 / v5.

## Conséquences

### Positives

- Un vocabulaire commun pour la revue visuelle, adossé au contexte produit et à
  la DA du projet, là où il n'y avait rien.
- Le contenu du skill est relu en PR comme le reste ; il ne change pas sous nos
  pieds.
- Personne n'exécute de binaire tiers sans l'avoir demandé.

### Négatives

- Le détecteur ne signale rien de lui-même : il faut penser à le lancer.
- 2,2 Mo de fichiers tiers dans le repo, dont un script de 536 Ko pour le mode
  live.
- Les mises à jour sont manuelles.

### Risques acceptés

- Le binaire téléchargé au premier `/impeccable` n'est vérifié que par une
  somme publiée par la même source : c'est une protection contre la
  corruption, pas contre une release compromise. Acceptable pour un outil de
  poste de dev appelé à la main ; ce ne le serait pas dans un hook.

## Alternatives écartées

- **Skill + hooks versionnés** (`npx impeccable install --scope=project`) : le
  détecteur tournerait après chaque modification d'UI, au prix d'un binaire
  tiers exécuté en continu chez toute l'équipe, sans qu'elle l'ait choisi.
- **Plugin installé poste par poste** (`/plugin marketplace add pbakaus/impeccable`)
  : rien dans le repo, mais chacun a sa version, et la revue d'une PR ne peut
  pas dire avec quel skill elle a été faite.
- **Sous-module Git** : même contenu qu'une copie, avec les frictions d'un
  sous-module (clones, CI, Netlify) pour un dossier qu'on met à jour rarement.
