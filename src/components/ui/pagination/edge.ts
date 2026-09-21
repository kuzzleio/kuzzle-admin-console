import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { paginationContext } from './context';
import { paginationLinkClasses } from './link-classes';

/**
 * Ce que partagent les quatre boutons de bord (`First`, `Previous`, `Next`,
 * `Last`) : l'habillage, la désactivation en bout de course, et le libellé
 * accessible.
 *
 * Ils sont quatre composants distincts parce que l'amont en a quatre — les
 * sites d'appel doivent pouvoir passer d'une implémentation à l'autre par un
 * changement d'import (ADR-0009). Ce qui les distingue tient dans trois
 * options, pas dans un fichier.
 */
export const paginationEdge = defineComponent({
  mixins: [classMerge, paginationContext],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(paginationLinkClasses());
    },
  },
});
