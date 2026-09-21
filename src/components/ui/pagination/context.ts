import { defineComponent } from 'vue';

/** Un emplacement de la barre : un numéro de page, ou une ellipse. */
export type PaginationItemData = { type: 'page'; value: number } | { type: 'ellipsis' };

/**
 * Ce que la racine `Pagination` expose à ses descendants.
 *
 * Comme pour `DropdownMenu` (ADR-0012), le contexte est l'instance de la racine
 * elle-même : `provide()` n'est évalué qu'une fois en Vue 2, et un objet
 * littéral y figerait `currentPage`. Cette interface est la part publique de la
 * racine, et rien d'autre ne doit être lu depuis un enfant.
 */
export interface PaginationContext {
  currentPage: number;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  items: PaginationItemData[];
  pageCount: number;
  goTo: (page: number) => void;
}

/**
 * Accès typé au contexte depuis un descendant : `this.pagination`.
 */
export const paginationContext = defineComponent({
  inject: ['paginationRoot'],
  computed: {
    pagination(): PaginationContext {
      return (this as unknown as { paginationRoot: PaginationContext }).paginationRoot;
    },
  },
});
