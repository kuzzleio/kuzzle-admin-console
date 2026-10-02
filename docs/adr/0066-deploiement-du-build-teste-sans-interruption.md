# ADR-0066 : Déployer le build que les specs ont testé, sans interruption de service

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *livraison* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md), lot 1 ; complète [ADR-0037](0037-serialiser-les-deploiements.md)

## Contexte

Relevé le 2026-10-02 dans `.github/actions/deploy-to-s3/action.yml` et les
deux workflows de déploiement (`push_5_dev`, `push_master`), qui partent tous
deux de `5-dev` : c'est la version de `push_master` portée par `5-dev` qui
déploiera console.kuzzle.io à la bascule.

| Constat | Conséquence |
|---|---|
| L'action relance `npm ci && npm run build` | Le build mis en ligne n'est pas celui que les specs ont validé ([ADR-0028](0028-valider-les-specs-contre-un-build.md)) : chacun des 17 jobs de spec construit le sien, le déploiement un dix-huitième. Un `npm ci` qui résout autrement, ou un défaut non déterministe, part en ligne sans avoir été testé. |
| `aws s3 rm --recursive`, puis `aws s3 sync` | Le bucket est vide pendant toute la copie. Une requête pendant ce temps reçoit une 404, que la distribution **met en cache cinq minutes** (`error_caching_min_ttl = 300`). Un `index.html` copié avant ses assets les référence alors qu'ils n'existent pas encore. |
| Les fichiers de l'ancien build sont supprimés d'emblée | Le bundle n'a aucun `import()` dynamique, mais un onglet ouvert sur l'ancien build charge encore à la demande le worker JSON d'Ace (`assets/worker-json-*.js`, depuis [ADR-0065](0065-csp-et-en-tetes-de-securite.md)) et les polices : l'éditeur JSON perd sa validation jusqu'au rechargement. |
| Aucun `Cache-Control` sur les objets | Le navigateur et CloudFront appliquent leurs heuristiques. Les assets, dont le nom porte un hash, sont revalidés comme s'ils pouvaient changer ; `index.html` peut rester servi depuis le cache du navigateur après un déploiement, ce que l'invalidation CloudFront n'atteint pas. |
| Le job de déploiement ne dépend que de `e2e-tests` | Un job `Lint` rouge (types, ESLint, `check:*`) laisse partir le déploiement. |
| `GA_ID` passé à l'action par `push_master` | L'action ne le déclare pas : un reste sans effet. |

## Décision

1. **Un seul build par run.** Un job `build` construit `dist/` et le publie en
   artefact ; les jobs de spec et le job de déploiement le téléchargent. L'action
   ne construit plus rien. Le workflow des pull requests suit le même schéma :
   c'est lui qui exerce le chemin artefact → specs avant toute fusion.
2. **Le déploiement attend `lint` et `e2e-tests`.**
3. **La copie se fait en trois temps** (`.github/actions/deploy-to-s3/deploy.sh`) :
   1. `assets/` d'abord, en `Cache-Control: public, max-age=31536000, immutable`.
      Aucun nom n'y écrase un fichier servi : tant qu'`index.html` n'a pas
      changé, le site sert l'ancien build en entier.
   2. Le reste — `index.html`, favicons, `images/` — en `Cache-Control: no-cache`.
      C'est la bascule, et elle n'a lieu qu'une fois les assets en place.
   3. Le ménage. Hors `assets/`, ce que le build ne contient plus est supprimé.
      Dans `assets/`, un fichier absent du build n'est supprimé que s'il n'a pas
      été copié depuis **7 jours** (`RETENTION_DAYS`). Chaque déploiement recopie
      tous les assets du build : leur `LastModified` est celui du dernier
      déploiement qui les contenait.
4. **Un build vide est refusé** : sans `index.html` ni `assets/`, le script
   s'arrête avant de copier quoi que ce soit — sans ce garde-fou, l'étape 3
   viderait le bucket.
5. **L'invalidation reste `/*`**, dans une étape distincte : les favicons et
   `images/` n'ont pas de hash, et les objets copiés avant cette ADR n'ont pas
   de `Cache-Control`.

Validé contre un S3 local (LocalStack) : ancien build puis nouveau, rétention
à 7 jours (l'ancien asset reste, l'ancien fichier hors `assets/` part), à 0 (il
part), build vide (refusé, bucket intact), vrai `dist/` (90 objets, en-têtes et
types MIME posés).

## Conséquences

### Positives

- Ce qui part en ligne est, octet pour octet, ce que les 17 specs ont testé.
- Plus de fenêtre sans site, plus de 404 mise en cache par un déploiement.
- Un déploiement coupé en vol laisse un site cohérent : l'ancien build si la
  coupure tombe pendant l'étape 1, le nouveau après.
- Les assets ne sont plus revalidés ; `index.html` l'est à chaque chargement.
- Un build par run au lieu de 18 (17 sur une pull request).

### Négatives

- Le bucket garde jusqu'à 7 jours d'assets périmés : quelques Mo par
  déploiement.
- Un script shell de plus à maintenir, que seule la CI exécute pour de vrai.

### Risques acceptés

- Le premier déploiement sur console.kuzzle.io, à la bascule, part d'un bucket
  rempli à la main : ses objets sans hash hors du build (l'ancien
  `manifest.json`, par exemple) seront supprimés, ses anciens assets conservés
  7 jours. C'est le comportement voulu.
- La distribution de production, créée à la main, n'est pas décrite par
  Terraform : si son TTL minimal n'est pas 0, elle ignore le `no-cache`
  d'`index.html`. L'invalidation `/*` couvre ce cas ; la revue d'`infra/`
  (lot 4) le relèvera.
- Un onglet resté ouvert plus de 7 jours sans rechargement peut perdre le
  worker d'Ace ou une police.

## Alternatives écartées

- **`aws s3 sync --delete` en une passe** : supprime les anciens assets dès le
  déploiement, et l'ordre de copie au sein d'un `sync` n'est pas garanti —
  `index.html` peut partir avant ses assets.
- **Ne jamais supprimer les assets** : le plus simple, mais le bucket grossit à
  chaque push sur `5-dev` sans limite.
- **Garder les assets des N derniers déploiements par manifeste** : exact, mais
  il faut écrire, lire et purger un manifeste dans le bucket. L'âge de copie
  donne le même résultat sans état.
- **Une règle de cycle de vie S3** : elle expire par âge sans savoir si un
  objet appartient au build courant : sept jours sans déploiement, et les
  assets du build en ligne disparaîtraient.
- **Garder le build dans l'action, mais l'épingler** (`npm ci` sur le même
  lockfile) : réduit l'écart sans le supprimer, et laisse 17 builds par run.
