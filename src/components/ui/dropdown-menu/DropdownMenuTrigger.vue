<template>
  <DropdownMenuTrigger
    :class="cn('cursor-pointer', props.class)"
    data-slot="dropdown-menu-trigger"
    v-bind="delegatedProps"
  >
    <slot />
  </DropdownMenuTrigger>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * DropdownMenuTrigger de shadcn-vue (ADR-0054). `:as="Button"` pour lui donner
 * l'apparence d'un bouton, ou `as-child` autour de l'élément voulu. La flèche
 * bas ouvre le menu sur son premier élément, Échap le referme et rend le focus
 * ici : c'est `reka-ui`.
 */
const props = defineProps<DropdownMenuTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
