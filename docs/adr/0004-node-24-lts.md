# ADR-0004 : Cible Node 24 LTS et alignement de la toolchain

- **Statut** : Acceptée
- **Date** : 2026-09-18
- **Décideurs** : Ricky

## Contexte

La version de Node est déclarée à **quatre endroits, avec trois valeurs
différentes** :

| Emplacement | Valeur au 2026-09-18 |
|---|---|
| `.nvmrc` | `v20` |
| `package.json` → `engines.node` | `>= 20.0.0` |
| `.github/workflows/*` → `NODE_VERSION` | `'20'` |
| `Dockerfile` | `node:22-bookworm-slim` |

**Node 20 « Iron » est EOL depuis mars 2026** : plus aucun correctif de sécurité.
L'image Docker construit donc les artefacts de production sur une version
différente de celle que la CI valide, et les deux divergent de celle des postes
de développement.

## Décision

Cible unique : **Node 24 « Krypton »**, la LTS active (24.21.0 au 2026-09-18).

La version est alignée aux quatre emplacements, et `.nvmrc` fait foi. Toute
montée de version future les modifie **ensemble**, dans la même PR.

Node 26 est écarté : il n'est pas encore passé LTS. Une console d'administration
n'a aucune raison d'être sur une ligne Current.

Dans la foulée et dans la même phase (phase 0 de l'ADR-0002), la toolchain est
remise à niveau **en gardant Vue 2**, pour isoler ces changements de la migration
applicative : Vite, TypeScript, ESLint et Cypress. Les versions cibles précises
et leur état d'avancement sont suivis dans [`../MIGRATION.md`](../MIGRATION.md).

## Conséquences

### Positives
- On rebascule sur une version supportée en sécurité.
- Dev, CI et image Docker construisent enfin sur la même base.
- Faire cette montée **avant** la migration Vue évite d'avoir à démêler un échec
  de build entre « c'est Node » et « c'est Vue 3 ».

### Négatives
- Montée simultanée de plusieurs outils majeurs (Vite, TS, ESLint) : de la
  casse est attendue, notamment sur la configuration ESLint (flat config) et sur
  les règles TypeScript plus strictes. Mitigation : une PR par outil, pas une PR
  fourre-tout.

### Risques acceptés
- `@vitejs/plugin-vue2` doit rester compatible avec la version de Vite retenue.
  Si ce n'est pas le cas, c'est **lui** qui fixe le plafond de Vite jusqu'à la
  phase 3, et on s'arrête à la dernière version compatible. À vérifier avant
  d'engager la montée.
