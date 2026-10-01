# ADR-0061 : `noImplicitAny` reste à `false` ; types de `lodash` et composants sans `any` implicite

- **Statut** : Acceptée
- **Date** : 2026-10-01
- **Décideurs** : Ricky
- **Précise** : le volet *technique* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)
  (« types lâches »)

## Contexte

`tsconfig.json` est en `strict: true` mais garde `noImplicitAny: false`,
hérité de la v4. Le passer à `true` sur `5-dev`, au 2026-10-01 :

| Mesure | Erreurs |
|---|---|
| Avant le lot 1 de la revue technique | 208 |
| Après le lot 1 (code mort retiré, dont 40 erreurs dans `collectionHelper.ts`) | 165 |

Sur les 165 :

- **31 TS7016** : des modules sans types. 30 sont des imports de `lodash`, que
  `@types/lodash` règle à lui seul ; le dernier est `kuzzle-sdk-v6`, que la
  console garde pour les backends v1 ([ADR-0005](0005-conserver-les-deux-sdk-kuzzle.md))
  et qui ne publie pas de types ;
- **12 dans des composants** (`.vue`) : des paramètres de rappel et des
  `new Filter()` sur une fonction constructeur de `filterManager.ts` ;
- **le reste dans `services/`, `stores/` et `routes/`** : `filterManager.ts`
  (44), `kuzzleWrapper-v1.ts` (32, l'adaptateur du SDK v6), `stores/auth.ts`
  (11), `kuzzleWrapper-v2.ts` (8), `validators.ts`, les routes. Du code d'avant
  le chantier, écrit en JavaScript puis renommé en `.ts`.

Les props, elles, sont déjà toutes typées : les 162 `defineProps` du dépôt
passent un type (`defineProps<…>()`), conséquence d'[ADR-0060](0060-composition-api-par-domaine.md).

Ce que `noImplicitAny` attrape vraiment, le lot 1 l'a montré : la seule erreur
qui n'était pas un `any` implicite (TS2551, une clé `'input:textarea'` qui
n'existe pas) dormait dans `config/schemaMapping.ts`, du code mort.

## Décision

**`noImplicitAny` reste à `false`.** La revue technique s'arrête à deux
choses :

1. **`@types/lodash`** en `devDependencies`. Les 30 imports de `lodash` cessent
   d'être des `any` silencieux, avec ou sans `noImplicitAny` : c'est le gain le
   plus large pour la plus petite intervention.
2. **Les composants sans `any` implicite** : les 12 erreurs des `.vue` se
   corrigent par le type juste — ce qui demande de faire de `Filter` une
   `class` — jamais par un `any` ni un `as`, comme pour ADR-0060.

Les services, stores et routes gardent leurs `any` implicites. Le compte
restant (≈ 120 après ces deux points) est relevé dans `MIGRATION.md` au moment
du lot, pour qu'une reprise future parte d'un chiffre et non d'une impression.

## Conséquences

### Positives

- `lodash` est typé partout, y compris dans le code qu'on ne touche pas.
- La couche que les specs exercent le plus — les composants, leurs props, leurs
  templates — est au niveau de `strict` complet.
- Pas de réécriture des services avant la bascule : ce sont les fichiers que les
  specs couvrent indirectement, et une erreur de type corrigée de travers y
  change un comportement sans que rien ne le signale.

### Négatives

- Le `tsconfig.json` de la v5 n'est pas « strict complet ». Un `any` implicite
  nouveau, dans un composant comme dans un service, passe `test:types` sans
  bruit : rien ne verrouille la décision.
- `filterManager.ts` et `kuzzleWrapper-v1.ts` restent les fichiers les moins
  typés de la console.

### Risques acceptés

- Les composants peuvent régresser, faute de verrou. On l'accepte : le code
  nouveau suit déjà la convention « pas de `any` sans justification » de
  `CLAUDE.md`, et la revue de PR la fait respecter.

## Alternatives écartées

- **`noImplicitAny: true`**, les 165 erreurs corrigées : c'est réécrire les
  signatures de `filterManager`, des stores et de l'adaptateur du SDK v6 juste
  avant la bascule, sur du code que les specs ne couvrent qu'en passant. Le
  bénéfice — des erreurs à la compilation dans des fichiers qui ne bougent plus
  — ne paie pas ce risque maintenant.
- **`noImplicitAny: true` avec des `// @ts-expect-error`** sur l'existant :
  165 commentaires qui disent « non typé » au lieu d'un réglage qui le dit une
  fois.
- **Un cliquet** (un script qui lance `vue-tsc` avec `noImplicitAny` et échoue
  si le compte monte) : il double la durée de `test:types` dans le job `Lint`
  pour surveiller une dette qu'on a décidé de garder.
