<template>
  <PaginationList
    v-slot="slotProps"
    :class="cn('m-0 flex list-none flex-row items-center gap-1 p-0', props.class)"
    data-slot="pagination-content"
    v-bind="delegatedProps"
  >
    <slot v-bind="slotProps" />
  </PaginationList>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PaginationList, type PaginationListProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * PaginationContent de shadcn-vue (ADR-0013, ADR-0054) : donne au site d'appel
 * les emplacements calculés par `reka-ui`.
 *
 * Écart avec l'amont, qui rend une `<div>` : la barre reste une liste (`<ul>`,
 * chaque bouton dans son `<li>`). C'est ce qui donne aux lecteurs d'écran le
 * nombre de pages.
 */
const props = withDefaults(
  defineProps<PaginationListProps & { class?: HTMLAttributes['class'] }>(),
  { as: 'ul' },
);

const delegatedProps = reactiveOmit(props, 'class');
</script>
