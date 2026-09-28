<template>
  <SelectItemText data-slot="select-item-text" v-bind="props">
    <slot />
  </SelectItemText>
</template>

<script setup lang="ts">
import { SelectItemText, type SelectItemTextProps } from 'reka-ui';

/* `SelectItem` l'inclut lui-même, comme en amont : c'est lui qui déclare le
 * libellé de l'option à la racine. */
const props = defineProps<SelectItemTextProps>();
</script>
