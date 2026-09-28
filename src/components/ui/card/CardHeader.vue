<template>
  <div :class="cn('flex flex-col gap-1.5 px-6', props.class)" data-slot="card-header">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* En-tête de Card : titre, description, et rien d'autre. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
