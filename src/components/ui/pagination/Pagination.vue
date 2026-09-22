<template>
  <nav :aria-label="ariaLabel" :class="classes" data-slot="pagination" role="navigation">
    <slot :page="currentPage" :page-count="pageCount" />
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import type { PaginationContext, PaginationItemData } from './context';

/*
 * Pagination — racine, API publique de shadcn-vue (ADR-0013).
 *
 * Remplace `<b-pagination>`. Deux écarts avec l'amont, tous deux dus à Vue 2 :
 *
 * - `v-model:page` n'existe pas ; c'est `:page.sync`, ou `v-model` via
 *   l'option `model`, comme `Dialog` (G-012) ;
 * - pas de `PaginationRoot` de `reka-ui` : le calcul des emplacements est ici
 *   (ADR-0009).
 *
 * La racine ne rend aucun bouton : elle calcule `items` et le donne à
 * `PaginationContent`. C'est ce qui rend le découpage amont utilisable tel
 * quel en phase 4.
 */

const ellipsisItem: PaginationItemData = { type: 'ellipsis' };

export default defineComponent({
  name: 'Pagination',
  mixins: [classMerge],
  provide(): { paginationRoot: PaginationContext } {
    return {
      paginationRoot: this as unknown as PaginationContext,
    };
  },
  model: {
    event: 'update:page',
    prop: 'page',
  },
  props: {
    ariaLabel: {
      default: 'Pagination',
      type: String,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    itemsPerPage: {
      required: true,
      type: Number,
    },
    page: {
      default: 1,
      type: Number,
    },
    // Toujours afficher la première et la dernière page, de part et d'autre
    // des ellipses. `b-pagination` le faisait sans le dire ; ici c'est un choix
    // du site d'appel, et le défaut est celui de l'amont.
    showEdges: {
      default: false,
      type: Boolean,
    },
    // Nombre de pages affichées de chaque côté de la page courante.
    siblingCount: {
      default: 2,
      type: Number,
    },
    total: {
      required: true,
      type: Number,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses('flex w-full justify-center');
    },
    pageCount(): number {
      return Math.max(1, Math.ceil(this.total / this.itemsPerPage));
    },
    // La page courante est bornée ici plutôt que chez l'appelant : réduire le
    // nombre de résultats sous la page affichée ne doit pas laisser la barre
    // pointer une page qui n'existe plus.
    currentPage(): number {
      return Math.min(Math.max(1, this.page), this.pageCount);
    },
    isFirst(): boolean {
      return this.currentPage <= 1;
    },
    isLast(): boolean {
      return this.currentPage >= this.pageCount;
    },
    /*
     * Les emplacements de la barre.
     *
     * Le nombre d'emplacements est constant tant que la barre est tronquée :
     * une barre dont la largeur change à chaque clic déplace les boutons sous
     * le curseur. C'est pour ça que les branches « début » et « fin »
     * récupèrent l'emplacement de l'ellipse qu'elles n'affichent pas, au lieu
     * de rendre une liste plus courte.
     */
    items(): PaginationItemData[] {
      const slots = this.siblingCount * 2 + 5;

      if (this.pageCount <= slots) {
        return this.pageRange(1, this.pageCount);
      }

      const edge = this.showEdges ? 1 : 0;
      const first = this.showEdges ? this.pageRange(1, 1) : [];
      const last = this.showEdges ? this.pageRange(this.pageCount, this.pageCount) : [];

      if (this.currentPage - this.siblingCount <= 2) {
        return [...this.pageRange(1, slots - 1 - edge), ellipsisItem, ...last];
      }

      if (this.currentPage + this.siblingCount >= this.pageCount - 1) {
        return [
          ...first,
          ellipsisItem,
          ...this.pageRange(this.pageCount - (slots - 2 - edge), this.pageCount),
        ];
      }

      return [
        ...first,
        ellipsisItem,
        ...this.pageRange(
          this.currentPage - this.siblingCount,
          this.currentPage + this.siblingCount,
        ),
        ellipsisItem,
        ...last,
      ];
    },
  },
  methods: {
    goTo(page: number): void {
      if (this.disabled) {
        return;
      }

      const target = Math.min(Math.max(1, page), this.pageCount);

      if (target !== this.page) {
        this.$emit('update:page', target);
      }
    },
    pageRange(from: number, to: number): PaginationItemData[] {
      const pages: PaginationItemData[] = [];

      for (let value = Math.max(1, from); value <= Math.min(this.pageCount, to); value += 1) {
        pages.push({ type: 'page', value });
      }

      return pages;
    },
  },
});
</script>
