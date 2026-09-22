<template>
  <div :class="classes" data-slot="tabs-list" role="tablist" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { tabsContext } from './context';

/*
 * TabsList — API publique de shadcn-vue (ADR-0017).
 *
 * Porte `role="tablist"`. `aria-orientation` n'est posé qu'en vertical :
 * `horizontal` est la valeur par défaut du rôle, et la répéter n'apprend rien
 * à personne.
 */
export default defineComponent({
  name: 'TabsList',
  mixins: [classMerge, tabsContext],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'flex gap-1',
        this.tabs.orientation === 'vertical'
          ? 'shrink-0 flex-col border-r border-border pr-2'
          : 'flex-row border-b border-border',
      );
    },
  },
  mounted() {
    if (this.tabs.orientation === 'vertical') {
      (this.$el as HTMLElement).setAttribute('aria-orientation', 'vertical');
    }
  },
});
</script>
