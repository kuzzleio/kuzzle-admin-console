# Architecture Decision Records

Ce dossier conserve les décisions structurantes du chantier de modernisation de
l'Admin Console. Une ADR répond à **pourquoi** on a fait un choix, pas à *où on
en est* (ça, c'est [`../MIGRATION.md`](../MIGRATION.md)) ni à *qui fait quoi*
(ça, ce sont les issues GitHub).

## Règles

- Une ADR est **immuable** une fois acceptée. On ne la réécrit pas : on en écrit
  une nouvelle qui la remplace, et on passe l'ancienne en `Remplacée par ADR-XXX`.
- Numérotation séquentielle, jamais réutilisée.
- Format court. Si une ADR fait plus de deux écrans, c'est qu'elle mélange
  plusieurs décisions.
- On écrit l'ADR **au moment où la décision est prise**, pas après coup.

## Statuts

`Proposée` → `Acceptée` → (`Remplacée par ADR-XXX` | `Abandonnée`)

## Index

| # | Titre | Statut |
|---|---|---|
| [0001](0001-systeme-de-suivi.md) | Système de suivi du chantier de modernisation | Acceptée |
| [0002](0002-sortir-de-bootstrap-vue-avant-vue-3.md) | Sortir de bootstrap-vue avant de migrer vers Vue 3 | Acceptée |
| [0003](0003-design-system-tailwind-shadcn-vue.md) | Tailwind CSS + shadcn-vue comme design system | Acceptée |
| [0004](0004-node-24-lts.md) | Cible Node 24 LTS et alignement de la toolchain | Acceptée |

## Gabarit

```markdown
# ADR-XXXX : <titre à l'impératif>

- **Statut** : Proposée
- **Date** : AAAA-MM-JJ
- **Décideurs** : ...

## Contexte
Les faits, mesurés. Pas d'opinion.

## Décision
Ce qu'on fait, à l'affirmatif.

## Conséquences
### Positives / Négatives / Risques acceptés

## Alternatives écartées
Chaque alternative, et **pourquoi** elle a été écartée.
```
