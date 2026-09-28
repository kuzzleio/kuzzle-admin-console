<template>
  <li data-slot="pagination-item">
    <PaginationFirst
      aria-label="Go to first page"
      :class="cn(buttonVariants({ variant: 'ghost', size }), props.class)"
      data-slot="pagination-first"
      v-bind="{ ...$attrs, ...delegatedProps }"
    >
      <slot><i aria-hidden="true" class="fas fa-angle-double-left" /></slot>
    </PaginationFirst>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationFirst, type PaginationFirstProps } from 'reka-ui';

import { type ButtonVariants, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * PaginationFirst de shadcn-vue (ADR-0013, ADR-0054). Icône seule, comme les
 * trois autres boutons de bord : l'amont affiche aussi un libellé, que la
 * barre de la console n'a pas la place de porter. Le libellé accessible se
 * remplace par un `aria-label` du site d'appel.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    PaginationFirstProps & { class?: HTMLAttributes['class']; size?: ButtonVariants['size'] }
  >(),
  { size: 'icon' },
);

const delegatedProps = reactiveOmit(props, 'class', 'size');
</script>
