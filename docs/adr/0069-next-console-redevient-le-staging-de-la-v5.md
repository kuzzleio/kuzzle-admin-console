# ADR-0069 : À la bascule, next-console redevient le staging (en v5) et console-v5 est supprimé

- **Statut** : Acceptée
- **Date** : 2026-10-02
- **Décideurs** : Ricky
- **Précise** : le volet *livraison* du critère 8 d'[ADR-0051](0051-criteres-de-sortie-de-la-v5.md), lot 4 ; tranche le risque laissé ouvert par ADR-0051 (« le sort de next-console sera traité par la revue de livraison ») ; clôt l'environnement ouvert par [ADR-0030](0030-branche-5-dev-et-deploiement-console-v5.md)

## Contexte

Relevé le 2026-10-02 :

| Constat | Conséquence |
|---|---|
| Trois environnements sous Terraform : `console` (production, `master`), `next-console` (staging v4, `4-dev`), `console-v5` (revue du chantier, `5-dev`) | `terraform plan` annonce **No changes** sur les trois : aucune dérive depuis l'import du 2026-09-23. |
| La bascule (critère 9) met `master` en v5 et `4-stable` **sans hébergement** | next-console n'a plus de v4 à servir, et console-v5 n'est plus un environnement de revue mais un staging de la v5, sous un nom provisoire. |
| `4-dev` porte encore un workflow qui déploie next-console à chaque push | Si next-console reçoit la v5 alors que ce workflow existe encore, un push sur `4-dev` y remet la v4. C'est la course qu'ADR-0030 a dû défaire : cinq jours de next-console inutilisable. |
| `4-dev` a **39 commits** absents de `master`, dont les correctifs reportés de la v5 vers la v4 | `4-stable` créée depuis `master` tel quel les perdrait. |
| La production n'a pas de politique d'en-têtes de réponse : la CSP d'[ADR-0065](0065-csp-et-en-tetes-de-securite.md) n'est servie que par console-v5 | La v4 ne la respecte pas (worker d'Ace sur `cdn.jsdelivr.net`, tuiles OSM en `http://`). La poser avant que la v5 soit en ligne casserait la production. |
| next-console et la production gardent l'ACL héritée `AllUsers: READ` en plus de la politique de bucket ; console-v5 est en `BucketOwnerEnforced` | Sans effet sur ce qui est servi. Rien ne presse. |

## Décision

**Après la bascule, on revient au modèle d'avant le chantier** : la branche de
développement de la v5 déploie next-console.kuzzle.io, `master` déploie
console.kuzzle.io. console-v5.kuzzle.io est supprimé.

L'ordre compte. Chaque étape se vérifie avant la suivante :

1. **`4-dev` est versée dans `master`**, puis `master` part en `4-stable`. Sans
   cela, `4-stable` perd les correctifs v4.
2. **Le déploiement de `4-dev` est retiré**, ou la branche archivée, *avant*
   toute v5 sur next-console.
3. **`5-dev` est versée dans `master`.** Le push déploie la v5 sur
   console.kuzzle.io, avec le `deploy.sh` d'[ADR-0066](0066-deploiement-du-build-teste-sans-interruption.md),
   qui ne vide pas le bucket.
4. **La production reçoit la politique d'en-têtes** de console-v5, celle qui
   lit `infra/csp.json`, dans `infra/console/`. Elle passe d'abord sur
   next-console, puis sur la production, comme les réglages hérités
   l'ont fait. Le `plan` ne doit annoncer que la politique et son rattachement.
5. **Le déploiement de `5-dev` vise next-console.** Seules les deux variables de
   dépôt changent (le bucket `next.console.kuzzle.io` et la distribution
   `E35G0B414M3IWU`), puis le job et les variables sont renommés pour ne plus
   dire `V5`.
6. **console-v5 est détruit** (`terraform destroy` dans `infra/console-v5/`),
   une fois le premier déploiement sur next-console vérifié. Les variables
   `CONSOLE_V5_*` sont supprimées, puis le module, puis son état.

L'ACL héritée et `BucketOwnerEnforced` ne font pas partie de la bascule. Elles
se traitent après, dans l'ordre déjà écrit dans `infra/next-console/README.md`.

## Conséquences

### Positives

- Le modèle de branches et de domaines est celui que l'équipe connaissait :
  `next-console` pour le staging, `console` pour la production.
- Deux environnements au lieu de trois, et aucun ne sert une version morte.
- Le passage de next-console à la v5 ne demande aucune ressource nouvelle :
  l'environnement est déjà sous Terraform.

### Négatives

- La bascule devient une séquence de six étapes au lieu d'une fusion. Elles
  sont reportées dans `MIGRATION.md`, sous le critère 9.
- Les liens vers console-v5.kuzzle.io (issues, PR, messages) cessent de
  fonctionner.

### Risques acceptés

- Entre les étapes 3 et 4, la v5 est en production sans CSP. C'est l'état
  actuel de la production, et la v5 y est servie sans régression.
- Une violation de la CSP que les specs ne couvrent pas apparaîtrait d'abord
  en production si l'étape 4 commençait par elle. D'où next-console d'abord.

## Alternatives écartées

- **Garder console-v5 et arrêter next-console** : on perd le nom que l'équipe
  connaît pour garder un nom provisoire, et la suppression porterait sur
  l'environnement le plus ancien, avec son ACL héritée.
- **Garder les deux** : deux staging à maintenir pour une seule version en
  développement.
- **Plus de staging** : chaque fusion sur la branche de développement
  partirait directement en production, ou ne serait vue nulle part.
- **Poser la CSP sur la production dès maintenant** : elle casserait la v4 qui y
  est servie.
