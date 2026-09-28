<template>
  <div
    :class="cn('flex flex-wrap items-center justify-end gap-2', props.class)"
    data-slot="dialog-footer"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* Pied de modale : les actions, alignées à droite. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
