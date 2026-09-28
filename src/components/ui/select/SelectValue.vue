<template>
  <SelectValue data-slot="select-value" v-bind="props">
    <slot />
  </SelectValue>
</template>

<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui';

/*
 * SelectValue de shadcn-vue (ADR-0014, ADR-0054) : le libellé de l'option
 * retenue, ou le `placeholder`. Le slot remplace ce texte ; il reçoit
 * `selectedLabel` et `modelValue`.
 */
const props = defineProps<SelectValueProps>();
</script>
