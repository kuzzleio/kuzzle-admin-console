<template>
  <DropdownMenuSeparator
    :class="cn('-mx-1 my-1 h-px bg-border', props.class)"
    data-slot="dropdown-menu-separator"
    v-bind="delegatedProps"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Séparateur de menu, DropdownMenuSeparator de shadcn-vue (ADR-0054). */
const props = defineProps<DropdownMenuSeparatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
