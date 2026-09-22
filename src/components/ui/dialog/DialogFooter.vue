<template>
  <div :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Pied de modale : les actions, alignées à droite. */
export default defineComponent({
  name: 'DialogFooter',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('flex flex-wrap items-center justify-end gap-2');
    },
  },
});
</script>
