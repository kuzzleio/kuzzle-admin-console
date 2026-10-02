# ADR-0065 : Une CSP et des en-têtes de sécurité servis par CloudFront, validés par les specs

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *sécurité* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md) ; le « lot S2, à venir » d'[ADR-0064](0064-jetons-dans-le-localstorage.md)

## Contexte

ADR-0051 range « en-têtes et CSP servis par CloudFront » dans le volet sécurité
de la revue de sortie. Les lots 1 à 3 ne l'ont pas couvert, et ADR-0064 s'appuie
dessus : le JWT reste dans le `localStorage`, et la défense contre son vol est
l'absence d'injection **et la CSP**.

Relevé le 2026-10-02 sur console-v5.kuzzle.io : **aucun** en-tête de sécurité.
Ni CSP, ni HSTS, ni `X-Content-Type-Options`, ni protection contre
l'inclusion dans un cadre. S3 n'en envoie pas, et la distribution n'a pas de
politique d'en-têtes de réponse.

Ce que la console charge, relevé dans `src/` et dans le build :

| Besoin | D'où | Conséquence pour la politique |
|---|---|---|
| Scripts | `/assets/*.js`, un seul `<script type="module">` dans `index.html`, aucun `eval` ni `new Function` dans le bundle | `script-src 'self'` suffit |
| Worker JSON d'Ace | **`cdn.jsdelivr.net`**, par un `Blob` qui l'importe (`loadWorkerFromBlob`, par défaut) | un script tiers à autoriser, et `blob:` en `worker-src` |
| Styles | Feuilles du build, `<style>` d'`index.html`, `<style>` injectés par Ace et ApexCharts, attributs `style` d'`index.html` | `'unsafe-inline'` en `style-src` |
| Images | Build, `data:` (logo de chargement, icônes), `blob:` (export d'ApexCharts), **tuiles OSM en `http://{s}.tile.osm.org`** | des tuiles en clair dans une page HTTPS |
| Polices | Embarquées ([ADR-0047](0047-polices-embarquees.md)) | `'self'` et `data:` |
| Connexions | Le backend Kuzzle **que l'utilisateur choisit** : n'importe quel hôte, en `ws`/`wss` ou `http`/`https` ; la télémétrie (`kepler.app.kuzzle.io`, HTTPS) | `connect-src` ne peut pas lister d'hôtes |

Une CSP écrite une fois dans Terraform aurait un défaut que le chantier connaît
bien : rien ne la teste. Un style ou un worker bloqué ne se voit pas, sauf si une
spec tombe dessus. Les specs tournent contre `vite preview`
([ADR-0028](0028-valider-les-specs-contre-un-build.md)), qui ne sert aucun
en-tête, et Cypress retire par défaut la CSP de l'application testée.

## Décision

1. **Une seule source pour la politique : `infra/csp.json`**, une directive par
   clé. Terraform la lit (`jsondecode(file(...))`) pour la
   `aws_cloudfront_response_headers_policy` de console-v5, et `vite.config.ts`
   la sert dans `preview.headers`. Le serveur de dev ne la sert pas : il
   injecte ses propres scripts.

2. **La politique** :

   ```
   default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
   img-src 'self' data: blob: https://tile.openstreetmap.org;
   font-src 'self' data:; connect-src 'self' http: https: ws: wss:;
   worker-src 'self'; object-src 'none'; base-uri 'self';
   form-action 'self'; frame-ancestors 'none'
   ```

   Ce qui protège vraiment, c'est `script-src 'self'` : sans `'unsafe-inline'`
   ni `'unsafe-eval'`, une injection HTML n'exécute rien. `connect-src` reste
   ouvert à tous les hôtes : c'est le métier de la console, et une XSS déjà
   bloquée par `script-src` n'a rien pour s'en servir.

3. **Ce que la console chargeait d'ailleurs revient chez elle** :
   - le worker JSON d'Ace est importé du paquet (`?url`) et servi avec le
     build. `loadWorkerFromBlob` passe à `false` : chargé directement, il ne
     demande que `worker-src 'self'` ;
   - les tuiles passent à `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
     l'adresse qu'OpenStreetMap recommande : HTTPS, sans sous-domaines `{s}`.

4. **Les specs valident la politique.** `cypress.config.ts` garde la CSP
   (`experimentalCspAllowList` avec la liste complète des directives :
   `true` garde la politique mais en retire `script-src`). Le support lève une
   erreur sur tout `securitypolicyviolation` : une violation fait échouer le
   test qui la déclenche.

5. **Les autres en-têtes** sont posés par la même politique CloudFront :
   `Strict-Transport-Security` (un an, sans `includeSubDomains` ni `preload`,
   qui engageraient d'autres domaines), `X-Content-Type-Options: nosniff`,
   `X-Frame-Options: DENY` (doublon de `frame-ancestors` pour les navigateurs
   qui ignorent la CSP), `Referrer-Policy: strict-origin-when-cross-origin`.

6. **Périmètre : console-v5 seulement.** La production sert la v4 jusqu'à la
   bascule (critère 9) ; elle recevra la même politique dans le lot de la
   bascule, quand elle servira le code que les specs ont validé. next-console
   sert la v4, qui charge encore le worker d'Ace depuis jsDelivr : elle n'en
   reçoit pas.

7. **L'`apply` suit la fusion**, une fois le build déployé sur console-v5 :
   appliquée avant, la CSP bloquerait le worker que la version en ligne charge
   encore depuis jsDelivr.

## Conséquences

### Positives

- ADR-0064 a la défense qu'elle supposait : une injection HTML n'exécute pas
  de script, et ne peut donc pas lire le JWT.
- La console ne charge plus de script tiers, et plus de contenu en clair.
- La politique est testée à chaque PR, par les 17 specs, contre la même valeur
  que celle qui part en ligne.

### Négatives

- `style-src 'unsafe-inline'` : une injection peut encore poser du CSS (de
  l'exfiltration par sélecteurs d'attributs, par exemple). L'enlever demande
  de retirer les `<style>` d'Ace (`useStrictCSP`, avec sa feuille chargée à
  part) et d'ApexCharts, et les attributs `style` d'`index.html`.
- `connect-src` ouvert : une CSP ne peut pas limiter les connexions d'un
  client fait pour se connecter à n'importe quel serveur.
- Une ressource que la console voudrait charger d'ailleurs passe désormais par
  `infra/csp.json`. C'est voulu.

### Risques acceptés

- `frame-ancestors 'none'` interdit d'inclure la console dans un `iframe`.
  Aucun produit Kuzzle ne le fait, à notre connaissance ; un usage qui en
  dépendrait se signalera par une page blanche dans le cadre.
- Les specs n'exercent pas tout : une tuile de carte, par exemple, ne se charge
  pas toujours en CI. Une violation sur un chemin qu'aucune spec ne parcourt
  ne se verra qu'en ligne, dans la console du navigateur.

## Alternatives écartées

- **Écrire la politique dans Terraform seulement.** Rien ne la testerait : on
  découvrirait ce qu'elle bloque en ligne.
- **Une balise `<meta http-equiv="Content-Security-Policy">` dans
  `index.html`.** Elle serait testée sans configuration de Cypress, mais
  `frame-ancestors` y est ignorée, et elle ne porte pas les autres en-têtes.
  Et pour les retirer, il faudrait de toute façon CloudFront.
- **`Content-Security-Policy-Report-Only` d'abord.** Il faudrait un point de
  collecte des rapports, que nous n'avons pas ; les specs jouent ce rôle, avant
  la fusion plutôt qu'après.
- **Autoriser `cdn.jsdelivr.net`.** Garder un script tiers dans la politique,
  c'est garder le risque qu'elle doit fermer : un CDN compromis exécuterait du
  code dans l'origine de la console.
