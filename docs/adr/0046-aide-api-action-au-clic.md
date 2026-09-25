# ADR-0046 : L'aide d'API Action s'ouvre au clic

- **Statut** : Acceptée
- **Date** : 2026-09-25
- **Décideurs** : Ricky

## Contexte

La comparaison v4 / v5 ([`ecarts.md` § E-14](../comparaison-v4-v5/ecarts.md#e-14),
#1132) relève un écart sans ADR : le « ? » d'API Action ouvrait en v4 un
`b-popover` au survol. La v5 le remplace par un `DropdownMenu`, qui s'ouvre au
clic (`ApiAction/QueryCard.vue`) ; le commentaire du template cite
[ADR-0012](0012-primitive-dropdown-menu-en-vue-2.md), qui ne décide pas ce
remplacement. Le contenu (texte d'aide et deux liens vers la documentation)
est identique.

## Décision

**L'aide s'ouvre au clic**, dans le `DropdownMenu` actuel. Le comportement de
la v5 est conservé.

## Conséquences

- API-08 passe de 🔴 à 🎯 dans l'inventaire.
- L'aide est atteignable au clavier (Tab puis Entrée) et au toucher, ce que le
  survol ne permettait pas ; ses liens restent cliquables sans que le panneau
  se ferme en quittant le « ? ».
- Aucune primitive `Popover` n'est ajoutée pour ce seul site d'appel.

## Alternatives écartées

- **Une primitive `Popover` au survol.** Le coût d'une primitive pour un seul
  site d'appel, et un survol inaccessible au clavier et au toucher.
- **Une infobulle (`title`).** Elle ne peut pas contenir de liens.
