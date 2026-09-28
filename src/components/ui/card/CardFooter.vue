<template>
  <div :class="cn('flex items-center gap-2 px-6', props.class)" data-slot="card-footer">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* Pied de Card : les actions. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
