<template>
  <td :class="classes" data-slot="table-cell" v-bind="$attrs" v-on="$listeners">
    <slot />
  </td>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

export default defineComponent({
  name: 'TableCell',
  mixins: [classMerge],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses('tw:px-3 tw:py-2 tw:align-middle');
    },
  },
});
</script>
