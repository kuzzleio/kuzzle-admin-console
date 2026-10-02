# ADR-0070 : Clés d'API — cadrage de la fonctionnalité

- **Statut** : Acceptée pour la v1 de la fonctionnalité (Ricky, 2026-10-02) ; l'atelier demandé par #665 (`need-workshop`) pourra la remplacer
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : #665 (« Add the API key section on the Security page »), la
  seule demande, en une phrase

## Contexte

Relevé le 2026-10-02 sur Kuzzle 2.56, la stack de `docker-compose.yml` :

| Constat | Conséquence |
|---|---|
| Six actions : `security:createApiKey`, `security:searchApiKeys`, `security:deleteApiKey`, qui prennent un `userId`, et leurs pendants `auth:*`, qui portent sur l'utilisateur connecté | Deux usages distincts : un administrateur gère les clés **d'un** utilisateur, un utilisateur gère **les siennes**. |
| `security:searchApiKeys` exige un `userId` (`POST /users/:userId/api-keys/_search`) | Il n'existe pas de liste de toutes les clés. Une page « toutes les clés » devrait interroger chaque utilisateur. |
| Le jeton (`kapikey-…`) n'est renvoyé **qu'à la création**. La recherche rend `description`, `expiresAt`, `ttl`, `fingerprint` (SHA-256 du jeton) et `userId`, sans date de création | Le jeton se montre une fois, au moment de la création. Après, une clé ne se reconnaît que par sa description et son empreinte. |
| `expiresIn` accepte une durée (`1h`, `30d`) ou `-1`, la valeur par défaut, et la clé ne s'expire alors jamais (`expiresAt: -1`) | Le défaut de Kuzzle est la clé éternelle. La console peut choisir un autre défaut. |
| `deleteApiKey` révoque : le jeton cesse d'être accepté | La révocation est la suppression. Il n'y a ni désactivation ni rotation. |
| Les backends v1 (`kuzzle-sdk-v6`) n'ont pas de clés d'API | La fonctionnalité ne s'affiche que sur un environnement v2. |
| Les droits de la console passent par `isActionAllowed` (`src/stores/auth.ts`), un getter par action | Trois getters de plus par contrôleur suffisent à cacher ce qu'on ne peut pas faire. |

## Décision

### Où

1. **Sur la page d'un utilisateur**, une section « API keys »
   (`/security/users/:id/api-keys`), atteinte depuis la page de l'utilisateur
   et depuis sa ligne dans la liste. Elle utilise `security:*`.
2. **Dans le menu de l'utilisateur connecté**, « My API keys », qui utilise
   `auth:*`. Un développeur sans droit sur `security` peut ainsi créer sa
   propre clé, ce qui est le cas le plus fréquent.

Les deux écrans sont le même composant, paramétré par le contrôleur.

### Créer

- Une description, **obligatoire** (Kuzzle l'exige, et c'est la seule façon de
  reconnaître la clé ensuite).
- Une expiration choisie dans une liste : 7 jours, 30 jours, **90 jours (par
  défaut)**, 1 an, sans expiration. « Sans expiration » s'accompagne d'un
  avertissement.
- L'identifiant personnalisé (`_id`) n'est pas proposé.

### Montrer le jeton une fois

- Le jeton s'affiche dans une fenêtre dédiée, avec un bouton de copie et un
  avertissement : il ne sera plus jamais affiché.
- La fenêtre ne se ferme pas d'un clic à côté ni d'Échap, seulement par un
  bouton explicite (« I've copied it »).
- Le jeton ne quitte pas cette fenêtre. Il n'entre ni dans un store, ni dans le
  `localStorage`, ni dans un toast, ni dans les logs, et il est oublié à la
  fermeture.

### Lister

- Les colonnes : description, expiration (relative, la date exacte au survol),
  empreinte abrégée (permet de retrouver la clé d'un jeton qui a fuité).
- Une clé expirée reste listée, et marquée comme telle : Kuzzle ne la supprime
  pas.
- La recherche porte sur la description.

### Révoquer

- Une clé à la fois, après une confirmation qui nomme sa description et dit
  que les applications qui l'utilisent cesseront de fonctionner.
- La révocation en lot n'est pas dans la première version.

### Droits et versions

- Les getters `canCreateApiKey`, `canSearchApiKeys` et `canDeleteApiKey`
  existent pour `security` et pour `auth`. Une action non permise n'est pas
  affichée. Si la recherche n'est pas permise, la section n'existe pas.
- Sur un backend v1, rien n'est affiché.

### Garde-fou

- Une 18ᵉ spec, `apiKeys.spec.js`, couvre :
  - la création, avec le jeton affiché une fois puis absent ;
  - la liste, avec une clé expirée ;
  - la révocation ;
  - l'écran « My API keys » ;
  - un utilisateur sans droit, qui ne voit pas la section.
- Elle vérifie aussi que le jeton créé authentifie bien une requête, puis plus
  rien après la révocation.

### Livraison

- La QA de console-v5 précède la bascule. Pendant ce temps, le code vit sur une
  branche `feat/api-keys` tirée de `5-dev`, et sa PR **ne se fusionne pas
  avant la fin de la QA**, pour ne pas changer ce que l'équipe teste.
- Cette ADR, qui n'est que de la documentation, peut se fusionner tout de
  suite.

## Points tranchés pour la v1

Les recommandations ci-dessus sont retenues telles quelles. L'atelier peut
revenir sur chacune par une nouvelle ADR :

1. L'expiration par défaut est de **90 jours**, et non l'absence d'expiration,
   défaut de Kuzzle.
2. **« Sans expiration » reste proposé**, avec un avertissement.
3. **« My API keys » est dans la v1.**
4. **Pas de vue de toutes les clés** : elle coûterait une requête par
   utilisateur.
5. **Pas de révocation en lot** dans la v1.

## Conséquences

### Positives

- La console couvre une fonction de sécurité que l'API offre depuis Kuzzle 2.1
  et qui ne se gérait jusqu'ici qu'à la main, par l'API.
- Le jeton n'est jamais conservé par la console : une fuite ne peut venir que
  de ce que l'utilisateur en fait après la copie.

### Négatives

- Une spec de plus dans la suite de CI.
- Deux écrans à tenir, même s'ils partagent leur composant.

### Risques acceptés

- Kuzzle ne renvoie pas de date de création : la liste ne peut pas trier par
  ancienneté.
- Un jeton copié puis perdu ne se retrouve pas : il faut en créer un autre.

## Alternatives écartées

- **Une section « API keys » dans la barre latérale de Sécurité, listant toutes
  les clés** : l'API ne le permet pas sans une requête par utilisateur.
- **Garder le jeton dans la session pour le réafficher** : c'est exactement ce
  que Kuzzle évite en ne le renvoyant qu'une fois.
- **Laisser le défaut de Kuzzle (clé éternelle)** : une clé créée vite et
  oubliée ne s'expire jamais. Le défaut doit être le choix prudent.
