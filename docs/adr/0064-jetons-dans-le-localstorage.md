# ADR-0064 : Le JWT reste dans le `localStorage`, le `sessionId` OpenID passe par environnement

- **Statut** : Proposée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *sécurité* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md)

## Contexte

La console garde deux secrets dans le navigateur, en clair, sans expiration de
stockage :

| Secret | Où | Écrit par | Durée de vie |
|---|---|---|---|
| JWT Kuzzle, un par environnement | `localStorage.environments[<id>].token` | `kuzzle.updateTokenCurrentEnvironment` (à chaque `setSession`) | 2 h, prolongé tant qu'un onglet est ouvert ([ADR-0057](0057-gestion-de-session.md)) ; effacé à la déconnexion et à la suppression de l'environnement |
| `sessionId` OpenID (Keycloak) | `localStorage['openid-sessionId']`, **une seule clé pour tous les environnements** | `Login/Form.vue`, avant la redirection vers le fournisseur | Jusqu'à la déconnexion ; il permet de rouvrir une session (`auth:login` stratégie `keycloak`) et de rafraîchir le token |

Le `localStorage` est lisible par tout script de l'origine : une injection
(XSS) lit les deux secrets. Il survit à la fermeture du navigateur : le JWT
reste utilisable jusqu'à 2 h après le dernier onglet fermé, le `sessionId`
tant que Keycloak garde la session.

Ce que la relecture a établi :

- **Le JWT doit être lisible par le code.** Le SDK l'envoie dans chaque message
  WebSocket (`kuzzle.jwt`), la console le vérifie (`auth:checkToken`), en tire
  le `kuid` (`kuidFromToken`) et l'adopte d'un onglet à l'autre (`storage`,
  ADR-0057 §3). Une XSS le lit dans `kuzzle.jwt` quel que soit l'endroit où il
  est rangé : le stockage ne change que sa **persistance**, pas son exposition.
- **`cookieAuth` du SDK v7 ne convient pas.** Il fait passer `auth:*` par HTTP
  pour poser un cookie `HttpOnly`, puis rouvre le WebSocket avec. Mais la
  console est servie depuis `console.kuzzle.io` et parle à des backends sur
  d'autres domaines, choisis par l'utilisateur : le cookie serait tiers
  (bloqué par Safari et Firefox, `SameSite=None` requis), le backend devrait
  autoriser l'origine avec `credentials`, le SDK v6 (backends v1,
  [ADR-0005](0005-conserver-les-deux-sdk-kuzzle.md)) ne le connaît pas, et un
  cookie par domaine ne sait pas porter deux environnements sur le même hôte.
- **L'export des environnements retire déjà le token** (`EnvironmentsSwitch`,
  `omit(e, 'token')`). **L'import, lui, le garde** : un fichier d'environnements
  qui contient un `token` ouvre une session avec, sans identifiants.
- **Le `sessionId` OpenID n'est pas rattaché à son environnement.** Après une
  connexion Keycloak sur l'environnement A, `auth.init()` lit la même clé sur
  l'environnement B : B passe en stratégie `keycloak`, rafraîchit avec le
  `sessionId` de A, et appelle `keycloak:closeSession` à la déconnexion.
- **Une réponse sans en-tête de stratégie écrit `'undefined'`** dans
  `openid-sessionId` et redirige vers `undefined` (`String(undefined)`,
  conservé « comme avant » à la migration).
- La v4 (`4-dev`) a les mêmes stockages et les mêmes trois défauts.

Le jeton à usage unique de l'export CSV (`Column.vue`, `&jwt=` dans l'URL) est
hors de cause : il ne sert qu'une fois.

## Décision

1. **Le JWT reste dans le `localStorage`**, par environnement. La défense
   contre son vol est l'absence d'injection (lot 2 de la revue, G-129) et la
   CSP de l'hébergement (lot S2, à venir), pas son rangement.
2. **Le `sessionId` OpenID est rangé dans son environnement**
   (`environments[<id>].openidSessionId`), à côté du token, avec le même cycle
   de vie : effacé à la déconnexion et avec l'environnement. L'ancienne clé
   `openid-sessionId` est reprise une fois pour l'environnement courant, puis
   supprimée.
3. **L'export et l'import ignorent `token` et `openidSessionId`.**
4. **Pas d'en-tête de stratégie, pas de redirection** : `Login/Form.vue`
   affiche une erreur au lieu d'écrire `'undefined'`.
5. Les points 2 à 4 font un lot de code, avec ses specs (`login`,
   `environments`), reporté sur `4-dev`.

## Conséquences

### Positives

- Rien ne change pour l'utilisateur : session reprise au rechargement, dans un
  nouvel onglet et après redémarrage du navigateur, adoption entre onglets.
- Une connexion Keycloak n'en impose plus la stratégie aux autres
  environnements.
- Un fichier d'environnements ne transporte plus de session, dans aucun sens.

### Négatives

- Le format de `localStorage.environments` gagne un champ, et une reprise de
  l'ancienne clé est à garder tant que des navigateurs l'ont.

### Risques acceptés

- Une XSS lit les secrets de **tous** les environnements enregistrés, pas
  seulement du courant.
- Sur un poste partagé, quelqu'un qui ouvre le profil du navigateur dans les
  2 h retrouve la session JWT ; le `sessionId` OpenID, plus longtemps. La
  déconnexion explicite les efface.

## Alternatives écartées

- **`sessionStorage`** : propre à l'onglet. Un nouvel onglet demande de se
  reconnecter, et l'adoption entre onglets d'ADR-0057 (événement `storage`)
  disparaît : chaque onglet rafraîchit le sien et invalide celui des autres.
- **Le JWT en mémoire seulement** : reconnexion à chaque rechargement, sans
  gain contre une XSS, qui le lit dans `kuzzle.jwt`.
- **`cookieAuth`** : voir le contexte — cookie tiers, CORS avec
  `credentials` côté backend, pas de support dans le SDK v6, un cookie par
  domaine pour plusieurs environnements.
- **Chiffrer le stockage** : la clé serait dans la même origine que le texte
  chiffré.
- **Ne garder que le token de l'environnement courant** : changer
  d'environnement redemanderait de se connecter, pour un gain qui ne vaut que
  contre une XSS déjà en place.
