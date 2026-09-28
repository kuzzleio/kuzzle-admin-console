<template>
  <h3
    :class="cn('font-sans text-title font-bold text-card-foreground', props.class)"
    data-slot="card-title"
  >
    <slot />
  </h3>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* Titre de Card. `h3` par défaut — à revoir sur un écran où la hiérarchie
 * des titres impose autre chose. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>
