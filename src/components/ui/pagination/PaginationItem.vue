<template>
  <li data-slot="pagination-item">
    <button
      :aria-current="isActive ? 'page' : undefined"
      :class="classes"
      data-slot="pagination-link"
      :disabled="pagination.disabled"
      type="button"
      :value="String(value)"
      v-bind="$attrs"
      v-on="$listeners"
      @click="onClick"
    >
      <slot>{{ value }}</slot>
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { paginationContext } from './context';
import { paginationLinkClasses } from './link-classes';

/*
 * PaginationItem — API publique de shadcn-vue (ADR-0013).
 *
 * Remplace un `.page-item`/`.page-link` de `b-pagination`. Deux choses que
 * l'ancien markup ne faisait pas :
 *
 * - **la page courante est annoncée** par `aria-current="page"`.
 *   `b-pagination` posait `aria-posinset`/`aria-setsize` sur chaque lien et
 *   `.active` sur le courant : de la position, jamais l'état. C'est
 *   `aria-current` qui dit « vous êtes ici » ;
 * - **c'est un `<button>`**, pas un `<a>` sans `href`. La barre ne navigue pas,
 *   elle change l'état de la liste.
 *
 * L'ancrage de test est `data-slot="pagination-link"` et l'attribut `value`,
 * qui porte le numéro de page comme en amont — voir `cy.paginationPage()`.
 */
export default defineComponent({
  name: 'PaginationItem',
  mixins: [classMerge, paginationContext],
  inheritAttrs: false,
  props: {
    isActive: {
      default: false,
      type: Boolean,
    },
    value: {
      required: true,
      type: Number,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(paginationLinkClasses({ active: this.isActive }));
    },
  },
  methods: {
    onClick(): void {
      this.pagination.goTo(this.value);
    },
  },
});
</script>
