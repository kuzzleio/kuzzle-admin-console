<template>
  <div :class="classes" role="separator" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/* Séparateur de menu. Remplace `<b-dropdown-divider>`. */
export default defineComponent({
  name: 'DropdownMenuSeparator',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('-mx-1 my-1 h-px bg-border');
    },
  },
});
</script>
