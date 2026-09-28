<template>
  <DropdownMenuRadioItem
    :class="cn(itemClasses({ inset: true }), props.class)"
    data-slot="dropdown-menu-radio-item"
    v-bind="forwarded"
  >
    <span aria-hidden="true" class="absolute left-2 flex w-4 justify-center">
      <DropdownMenuItemIndicator>
        <i class="fa fa-check" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemEmits,
  type DropdownMenuRadioItemProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';
import { itemClasses } from './item-classes';

/*
 * DropdownMenuRadioItem de shadcn-vue (ADR-0054). La coche est décorative :
 * `aria-checked` dit déjà l'état, l'annoncer deux fois serait du bruit.
 */
const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
