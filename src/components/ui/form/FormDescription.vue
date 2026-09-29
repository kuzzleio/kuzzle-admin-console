<template>
  <p
    :class="cn('font-sans text-sm text-muted-foreground', props.class)"
    data-slot="form-description"
    v-bind="$attrs"
  >
    <slot />
  </p>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

/* Texte d'aide d'un champ. Remplace la prop `description` de `b-form-group`. */
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>
