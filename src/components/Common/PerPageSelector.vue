<template>
  <div class="flex items-center gap-2 text-sm text-foreground">
    <span>Show</span>
    <Select :model-value="pageSize" @update:modelValue="$emit('change-page-size', $event)">
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

<script lang="ts">
import { defineComponent } from 'vue';

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
export default defineComponent({
  name: 'PerPageSelector',
  components: { Select, SelectContent, SelectItem, SelectTrigger, SelectValue },
  props: {
    currentPageSize: {
      default: 25,
      type: Number,
    },
    totalDocuments: {
      default: 0,
      type: Number,
    },
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500],
    };
  },
  computed: {
    pageSize(): number {
      return this.currentPageSize || 25;
    },
  },
});
</script>
