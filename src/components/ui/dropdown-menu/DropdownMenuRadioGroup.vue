<template>
  <DropdownMenuRadioGroup data-slot="dropdown-menu-radio-group" v-bind="forwarded">
    <slot />
  </DropdownMenuRadioGroup>
</template>

<script setup lang="ts">
import {
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupEmits,
  type DropdownMenuRadioGroupProps,
  useForwardPropsEmits,
} from 'reka-ui';

/*
 * DropdownMenuRadioGroup de shadcn-vue (ADR-0012, ADR-0054). Un menu qui
 * désigne l'élément en cours parmi plusieurs exclusifs est un groupe de
 * boutons radio : `role="menuitemradio"` et `aria-checked` sur chaque élément.
 */
const props = defineProps<DropdownMenuRadioGroupProps>();
const emits = defineEmits<DropdownMenuRadioGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
