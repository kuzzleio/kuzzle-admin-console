<template>
  <form class="RawFilter" data-cy="RawFilter">
    <json-editor
      id="rawsearch"
      class="JsonEditor"
      myclass="pre_ace"
      :content="rawFilter"
      @change="onFilterChange"
    />
    <Alert v-if="!isFilterValid && showError" class="mt-2" variant="destructive">
      Your JSON filter contains errors.
    </Alert>
    <div v-if="actionButtonsVisible" class="mt-3 flex justify-end gap-2">
      <Button data-cy="RawFilter-resetBtn" variant="outline" @click="reset">Reset</Button>
      <Button data-cy="RawFilter-submitBtn" :disabled="!isFilterValid" @click.prevent="submit">
        {{ submitButtonLabel }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { SearchFilter } from './types';

import JsonEditor from '@/components/Common/JsonEditor.vue';

const props = withDefaults(
  defineProps<{
    actionButtonsVisible?: boolean;
    currentFilter?: Partial<SearchFilter>;
    submitButtonLabel?: string;
  }>(),
  {
    actionButtonsVisible: true,
    currentFilter: () => ({}),
    submitButtonLabel: 'Search',
  },
);

const emit = defineEmits<{
  (e: 'filter-submitted', filter: Record<string, unknown>): void;
  (e: 'reset'): void;
}>();

const rawFilter = ref(`{
  "query": {},
  "sort": {}
}`);
const showError = ref(false);

const filterState = computed((): Record<string, unknown> => {
  try {
    return JSON.parse(rawFilter.value);
  } catch (error) {
    return {};
  }
});

const isFilterValid = computed((): boolean => {
  try {
    JSON.parse(rawFilter.value);
    return true;
  } catch (error) {
    return false;
  }
});

watch(
  () => props.currentFilter,
  (val) => {
    if (!val) {
      return;
    }
    if (!val.raw) {
      return;
    }
    rawFilter.value = JSON.stringify(val.raw, null, 2);
  },
  { immediate: true },
);

function onFilterChange(val: string): void {
  rawFilter.value = val;
}

function submit(): void {
  if (isFilterValid.value) {
    showError.value = false;
    emit('filter-submitted', filterState.value);
  } else {
    showError.value = true;
  }
}

function reset(): void {
  emit('reset');
}
</script>

<style lang="scss" scoped>
.RawFilter {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.JsonEditor {
  flex-grow: 1;
}
</style>
