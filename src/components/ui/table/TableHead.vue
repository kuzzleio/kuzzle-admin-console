<template>
  <th
    :class="
      cn(
        'h-10 px-3 text-left align-middle text-label font-bold uppercase whitespace-nowrap text-label-slate',
        props.class,
      )
    "
    data-slot="table-head"
  >
    <slot />
  </th>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* Libellé de section du DS : capitales, 11 px, Label Slate. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
