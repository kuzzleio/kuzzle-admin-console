<template>
  <div
    v-if="isActive"
    :id="`${tabs.baseId}-content-${value}`"
    :aria-labelledby="`${tabs.baseId}-trigger-${value}`"
    :class="classes"
    data-slot="tabs-content"
    role="tabpanel"
    tabindex="0"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { tabsContext } from './context';

/*
 * TabsContent — API publique de shadcn-vue (ADR-0017).
 *
 * `v-if` et non `v-show` : un panneau masqué reste dans le DOM, et ses champs
 * continuent de porter leurs `id` et de participer au formulaire. C'est ce qui
 * fait qu'un `id` en double passe inaperçu jusqu'au jour où une spec le vise.
 *
 * `tabindex="0"` : le panneau est atteignable au clavier depuis son onglet,
 * sans quoi le contenu d'un panneau sans élément focalisable serait
 * inaccessible.
 */
export default defineComponent({
  name: 'TabsContent',
  mixins: [classMerge, tabsContext],
  inheritAttrs: false,
  props: {
    value: {
      required: true,
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses('tw:min-w-0 tw:flex-1 tw:outline-none');
    },
    isActive(): boolean {
      return this.tabs.value === this.value;
    },
  },
});
</script>
