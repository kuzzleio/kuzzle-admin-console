# ADR-0057 : La session se surveille, se prolonge, et se perd sur place

- **Statut** : Acceptée
- **Date** : 2026-09-28
- **Décideurs** : Ricky

## Contexte

La popup « Sorry, your session has expired » (`Home`) s'ouvre quand
`tokenValid` passe à `false` : sur l'événement `tokenExpired` du SDK, ou sur une
`queryError` d'identifiant `security.token.expired`. Un intervalle de 20 s
(`afterLogin`) rafraîchit le token 30 s avant son expiration.

Ce que la relecture a établi, sur `5-dev` comme sur `master` :

- **Une session ouverte par identifiants n'est jamais surveillée.** `doLogin`
  appelle `setSession` sans `afterLogin`. Seules une session reprise au
  rechargement (`loginByToken`) et une session OpenID arment l'intervalle. Au
  bout des 2 h du token, les requêtes échouent, et on l'apprend par elles.
- **Un rafraîchissement qui échoue déconnecte** (`doLogout`) : l'écran de
  connexion remplace la page, et le travail en cours est perdu.
- **Rien ne revérifie la session au retour sur l'onglet.** Un onglet en
  arrière-plan ou une machine en veille ne font pas tourner l'intervalle ; une
  session fermée ailleurs ne se voit qu'à la requête suivante.
- **Chaque `afterLogin` ajoute un intervalle** sans arrêter le précédent :
  changer d'environnement laisse tourner celui de l'ancien.
- **Plusieurs onglets rafraîchissent chacun leur token**, et chacun invalide
  celui des autres à la fin du délai de grâce de Kuzzle.

La plateforme IoT (`iot-platform-v4`, `store/modules/Auth/store.ts`) a déjà
traité ces cas. La console en reprend le modèle, pour ses environnements
multiples.

## Décision

**1. Chaque ouverture de session arme la surveillance**, quel que soit le
chemin : identifiants, token repris, OpenID, token rafraîchi, token adopté. La
surveillance précédente est arrêtée d'abord : une seule session est surveillée,
celle de l'environnement courant. La déconnexion l'arrête.

**2. Au retour sur l'onglet** (`visibilitychange`, `focus`), l'expiration est
revérifiée tout de suite, et le token est vérifié auprès de Kuzzle
(`auth:checkToken`).

**3. Un seul rafraîchissement à la fois**, avec deux nouvelles tentatives à
3 s d'intervalle. Entre onglets, un verrou Web Locks par environnement
(`kuzzle-admin-console:token-refresh:<environnement>`) : un seul onglet
rafraîchit. Les autres adoptent le token qu'il écrit dans `localStorage`, par
l'événement `storage`, après l'avoir vérifié.

**4. Une session qu'on ne peut plus prolonger se perd sur place**
(`loseSession`) : la surveillance s'arrête, `tokenValid` passe à `false`, la
popup de reconnexion s'ouvre au-dessus de la page, qui ne change pas. Se
reconnecter dans la popup rend la page telle qu'elle était.

**5. Les specs de session sont dans `login.spec`** : la matrice de la CI liste
les specs une à une, et c'est le domaine. L'horloge de la page y est remplacée
(`cy.clock`) pour `setInterval` et `Date` seulement.

## Conséquences

- Une session par identifiants dure autant que l'utilisateur travaille, et
  non plus 2 h.
- Une session perdue ne fait plus perdre la page.
- Chaque retour sur l'onglet coûte un `auth:checkToken`.
- Un token de moins de 31 s serait rafraîchi dès le premier tick, et un
  rafraîchissement dans la seconde de l'émission rend le même token (G-093).

## Alternatives écartées

- **Recharger la page après un échec**, comme la plateforme IoT : la console
  a une popup de reconnexion, qui garde le contexte.
- **Vérifier le token à intervalle fixe auprès de Kuzzle** : une requête
  toutes les 20 s par onglet, pour un cas que le retour sur l'onglet et les
  notifications `TokenExpired` du websocket couvrent déjà.
- **Laisser chaque onglet rafraîchir le sien** : le délai de grâce de Kuzzle
  (1 s) fait mourir le token des autres onglets.
