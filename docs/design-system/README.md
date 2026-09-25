# Design system Kuzzle — copie de référence

Ce dossier est une **copie figée** des tokens du design system produit Kuzzle,
prise le 2026-09-25 dans le projet Claude Design
[« Kuzzle Design System »](https://claude.ai/design/p/243f828d-6dce-4f59-8546-e00feeb60eb8?file=Kuzzle+Design+System.dc.html)
(`_ds/kuzzle-design-system-d0d03754…/tokens/`). Elle sert de pièce à conviction :
on peut relire d'où vient une valeur de `src/assets/tokens.css` sans avoir accès
au projet Design.

**Ce n'est pas du code de la console.** Rien ici n'est importé par le build.
La console consomme ses propres tokens, au vocabulaire shadcn-vue
([ADR-0003](../adr/0003-design-system-tailwind-shadcn-vue.md)) ; la
correspondance entre les deux vocabulaires est décrite dans
[`DESIGN.md`](../../DESIGN.md) et décidée par
[ADR-0043](../adr/0043-da-kuzzle-pour-la-console.md).

| Fichier | Contenu |
|---|---|
| `tokens/colors.css` | charte Kuzzle, jetons d'application, sémantique d'état |
| `tokens/typography.css` | Gobold / Montserrat / Ubuntu, échelle en px, interlignages, approches |
| `tokens/spacing.css` | espacements (base 4 px), rayons, élévations teintées, durées |
| `tokens/base.css` | styles de base des éléments (`body`, `a`, `h1`–`h4`) |

`fonts.css` n'est pas repris : il charge Google Fonts et Font Awesome 6.5.1
depuis des CDN, ce que la console ne fait pas (elle embarque ses polices et
`@fortawesome/fontawesome-free` 6.7.2).

Le design system décrit l'**application Kuzzle IoT** (actifs, appareils,
groupes, soft-tenants). La console n'en reprend que les fondations et les
composants génériques ; les pills de mesure, le KHero et les soft-tenants n'ont
pas d'équivalent ici.

**Mettre à jour cette copie** : relire le projet Design, remplacer les fichiers,
et dire dans la PR quelles valeurs ont bougé. Si une valeur change, `DESIGN.md`
et `src/assets/tokens.css` suivent dans la même PR.
