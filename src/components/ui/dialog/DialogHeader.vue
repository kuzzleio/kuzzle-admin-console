<template>
  <div :class="cn('flex flex-col gap-1.5 text-left', props.class)" data-slot="dialog-header">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* En-tête de modale : titre et description. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
