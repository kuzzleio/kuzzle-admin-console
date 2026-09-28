# ADR-0051 : Les critères de sortie de la v5

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

[ADR-0030](0030-branche-5-dev-et-deploiement-console-v5.md) a fixé la
destination du chantier (`master`, via une branche de maintenance pour la v4)
sans dire à quel moment on y va. Au 2026-09-28 :

- les phases 0, 2 et 3 sont closes, `@vue/compat` est retiré
  ([ADR-0036](0036-retrait-de-vue-compat.md)), l'inventaire v4 / v5 compte
  141 ✅, 12 🎯 et 0 🔴 ;
- la phase 1 n'a plus qu'une ligne ouverte : le reste de l'audit `/impeccable`
  (mise en page sous 400 px, onglets d'API Action, cibles tactiles, raccourcis
  clavier) ;
- la phase 4 garde deux lignes : un vrai shadcn-vue à la place des 20
  primitives écrites à la main, et la Composition API (189 SFC, aucun en
  `<script setup>`) ;
- la dette de §3.3 compte quatre paquets : `bluebird` (2 fichiers), `moment`
  (4), `json-formatter-js` (3), `apexcharts` 3.53 ;
- le jeu de tokens sombre est défini, mais rien ne le branche ;
- `5-dev` a 213 commits d'avance sur `master`, qui porte toujours la 4.4.0 et
  déploie console.kuzzle.io ;
- la PR #1092 corrige sur `master` l'affichage des erreurs de JSON dans trois
  formulaires `CreateOrUpdate`, que `5-dev` a réécrits.

Sans critère écrit, « la migration est finie » se rediscute à chaque étape.

## Décision

**La v5 sort quand toutes les conditions suivantes sont remplies**, dans cet
ordre :

1. **Audit DA terminé** : les quatre points ouverts de l'étape 3
   d'[ADR-0043](0043-da-kuzzle-pour-la-console.md).
2. **Dette de §3.3 soldée** : `bluebird`, `moment` et `json-formatter-js`
   partent, un lot par paquet.
3. **#1092 vérifiée sur `5-dev`** : si le défaut existe, on porte le correctif
   à la main. Un merge est hors de question, les deux arbres ont divergé
   (ADR-0030).
4. **Vrai shadcn-vue** : les primitives de `src/components/ui/` sont
   remplacées par celles de shadcn-vue, dont elles suivent déjà l'API
   ([ADR-0003](0003-design-system-tailwind-shadcn-vue.md)).
5. **`apexcharts` 5** : cela demande de remplacer `vue3-apexcharts`, qui la
   bloque en 3.53 ([ADR-0032](0032-remplacer-vue-apexcharts-sans-monter-apexcharts.md)).
6. **Thème sombre branché** : une bascule, et le contraste AA vérifié dans les
   deux thèmes, comme [ADR-0050](0050-contraste-aa-de-la-palette.md) l'a fait
   pour le clair.
7. **Composition API** : tous les SFC en `<script setup lang="ts">`.
8. **Revue de sortie**, en trois volets :
   - *technique* : la dette laissée par le chantier lui-même (code mort,
     contournements temporaires, commentaires `TODO`, types lâches) ;
   - *sécurité* : dépendances (`npm audit`), en-têtes et CSP servis par
     CloudFront, stockage des jetons, surfaces d'injection (éditeurs JSON,
     rendu HTML) ;
   - *livraison* : `Dockerfile`, `infra/` (Terraform de `console`,
     `console-v5` et `next-console`), workflows de déploiement, gestion de la
     course de déploiement sur `5-dev`.
9. **Bascule** : `master` part en `4-stable`, sur le modèle de `2-stable` et
   `3-stable`, **sans hébergement** ; `5-dev` est versée dans `master`, qui
   redéploie console.kuzzle.io en v5.

L'ordre compte. shadcn-vue passe avant le thème sombre, parce que ses
primitives apportent leurs variantes sombres. Il passe aussi avant la
Composition API, pour ne pas réécrire deux fois les sites d'appel. Et la revue
arrive en dernier, pour porter sur le code qui sort vraiment.

Chaque étape reste un lot par PR, validé par les 17 specs contre un build et
une stack neuve ([ADR-0028](0028-valider-les-specs-contre-un-build.md)).

## Conséquences

### Positives

- « Fini » a une définition, et §1.6 de `MIGRATION.md` la suit ligne par ligne.
- La phase 4 est close à la sortie : il n'y a pas de v5 « à moitié Vue 3 ».
- La revue de sortie couvre ce qu'aucune spec ne voit : l'infra et la sécurité.

### Négatives

- La sortie arrive plus tard. La Composition API sur 189 SFC est le plus gros
  poste restant, et elle ne change rien pour l'utilisateur.
- Il n'y aura plus de v4 en ligne après la bascule. Un utilisateur qui en a
  besoin la construit depuis `4-stable`.

### Risques acceptés

- Chaque étape réécrit des composants que les specs couvrent inégalement :
  l'inventaire en compte 30 sans spec. On accepte ce risque sur les étapes 4
  et 7, qui touchent tout.
- next-console.kuzzle.io perd sa raison d'être à la bascule. Son sort
  (redéploiement de la v5 ou arrêt) sera traité par la revue de livraison.

## Alternatives écartées

- **Sortir dès la fin de l'audit DA et de la dette**, en laissant shadcn-vue,
  le thème sombre et la Composition API pour après : c'est le plus rapide, mais
  la v5 sortirait avec des primitives maison et une phase 4 ouverte. Écarté par
  le décideur.
- **Garder la v4 en ligne sur une URL dédiée** pendant une transition : c'est
  un hébergement de plus à maintenir pour une version qui ne reçoit plus de
  correctifs.
- **Ne pas écrire de critères** et décider au moment venu : c'est ce qui a
  laissé ADR-0030 ouverte sur ce point.
