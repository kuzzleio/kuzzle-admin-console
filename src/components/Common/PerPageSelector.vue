<template>
  <div class="flex items-center gap-2 text-sm text-foreground">
    <span>Show</span>
    <Select :model-value="pageSize" @update:modelValue="onSelect">
      <SelectTrigger aria-label="Items per page" class="w-auto min-w-20" data-cy="perPageSelector">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="size of itemsPerPage" :key="size" :value="size">{{ size }}</SelectItem>
      </SelectContent>
    </Select>
    <span v-if="totalDocuments">of {{ totalDocuments }} total items.</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/*
 * Taille de page, partagée par les listes de Data et de Security.
 *
 * Le déclencheur porte son nom en `aria-label` et non en `aria-labelledby` :
 * `<b-form-select>` n'avait aucun nom accessible, et le mot « Show » qui le
 * précède n'en tenait lieu que pour qui voit l'écran. Un `id` à pointer serait
 * dupliqué le jour où deux listes paginées partagent une page.
 */
const props = withDefaults(
  defineProps<{
    currentPageSize?: number;
    totalDocuments?: number;
  }>(),
  { currentPageSize: 25, totalDocuments: 0 },
);

const emit = defineEmits<{
  (e: 'change-page-size', size: number): void;
}>();

const itemsPerPage = [10, 25, 50, 100, 500];

const pageSize = computed((): number => props.currentPageSize || 25);

// Le `Select` rend une valeur de `reka-ui` (`AcceptableValue`) : ses options
// sont les nombres de `itemsPerPage`, rien d'autre ne peut en sortir.
function onSelect(value: unknown): void {
  if (typeof value === 'number') {
    emit('change-page-size', value);
  }
}
</script>
