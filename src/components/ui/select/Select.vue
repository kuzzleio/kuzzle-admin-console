<template>
  <SelectRoot v-slot="slotProps" data-slot="select" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </SelectRoot>
</template>

<script setup lang="ts">
import {
  SelectRoot,
  type SelectRootEmits,
  type SelectRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

/*
 * Select de shadcn-vue (ADR-0014, ADR-0054).
 *
 * La racine ne rend aucun élément : une classe ou un `data-cy` posés ici sont
 * perdus, ils vont sur `SelectTrigger` (G-088).
 *
 * Une valeur garde son type : `PerPageSelector` émet un nombre que ses parents
 * comparent à un nombre (ADR-0014, décision 5). La comparaison est stricte —
 * `'25'` ne retrouve pas l'option `25`.
 */
const props = defineProps<SelectRootProps>();
const emits = defineEmits<SelectRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
