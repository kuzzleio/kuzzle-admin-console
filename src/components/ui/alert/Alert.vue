<template>
  <div :class="cn(alertVariants({ variant }), props.class)" data-slot="alert" role="alert">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/lib/utils';

import { alertVariants, type AlertVariants } from '.';

/*
 * Alert de shadcn-vue (ADR-0054). `role="alert"` est porté par la primitive,
 * comme en amont : un message d'erreur qui n'est pas annoncé n'existe pas pour
 * qui n'a pas l'écran.
 */
const props = defineProps<{
  class?: HTMLAttributes['class'];
  variant?: AlertVariants['variant'];
}>();
</script>
