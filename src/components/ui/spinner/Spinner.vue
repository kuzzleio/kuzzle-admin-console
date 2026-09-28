<template>
  <span
    :aria-label="label"
    :class="cn(spinnerVariants({ size }), props.class)"
    data-slot="spinner"
    role="status"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

import { spinnerVariants, type SpinnerVariants } from '.';

/*
 * Spinner de shadcn-vue (ADR-0054). L'amont dessine le `Loader2` de lucide ;
 * ici c'est un anneau en CSS, la DA étant sur Font Awesome. `size` est en plus
 * de l'amont : la console a trois tailles d'attente, de la ligne au plein
 * écran.
 *
 * `role="status"` et le libellé sont portés par la primitive, comme en amont :
 * un indicateur de chargement sans annonce accessible est un défaut, pas un
 * choix de style.
 */
const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class'];
    label?: string;
    size?: SpinnerVariants['size'];
  }>(),
  { label: 'Loading' },
);
</script>
