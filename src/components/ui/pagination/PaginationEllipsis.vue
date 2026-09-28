<template>
  <li data-slot="pagination-item">
    <PaginationEllipsis
      aria-hidden="true"
      :class="
        cn(
          'inline-flex size-9 items-center justify-center text-sm text-muted-foreground',
          props.class,
        )
      "
      data-slot="pagination-ellipsis"
      v-bind="delegatedProps"
    >
      <slot>…</slot>
    </PaginationEllipsis>
  </li>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationEllipsis, type PaginationEllipsisProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * PaginationEllipsis de shadcn-vue (ADR-0013, ADR-0054). `aria-hidden` : les
 * pages omises ne sont pas une information pour un lecteur d'écran, qui
 * connaît déjà le nombre d'éléments de la liste.
 */
const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
