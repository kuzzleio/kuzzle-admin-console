<template>
  <div ref="root" class="Autocomplete">
    <Input
      v-model="inputValue"
      :class="inputClass"
      data-cy="Autocomplete-input"
      :placeholder="placeholder"
      type="text"
      @update:modelValue="onInput"
      @change="onChange"
      @focus="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <!--
      Le `<style scoped>` posait les couleurs de la sélection en dur
      (`$blue-color`) ; elles viennent des tokens, comme partout ailleurs.
    -->
    <ul
      v-show="isOpen"
      class="Autocomplete-results m-0 h-30 list-none overflow-auto rounded-md border border-border p-0"
      data-cy="Autocomplete-results"
    >
      <li
        v-for="(result, i) in results"
        :key="result"
        class="Autocomplete-result cursor-pointer px-1 py-1 text-left hover:bg-accent hover:text-accent-foreground"
        :class="i === selectionCursor ? 'is-active bg-accent text-accent-foreground' : ''"
        :data-cy="`autocomplete-item--${result}`"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

import { Input } from '@/components/ui/input';

const props = withDefaults(
  defineProps<{
    inputClass?: string;
    item?: string;
    items?: string[];
    notifyChange?: boolean;
    placeholder?: string;
    value?: string;
  }>(),
  {
    inputClass: '',
    item: '',
    items: () => [],
    notifyChange: true,
    placeholder: '',
    value: '',
  },
);

const emit = defineEmits<{
  (e: 'autocomplete::change', value: string): void;
}>();

const root = useTemplateRef<HTMLDivElement>('root');
const inputValue = ref('');
const results = ref<string[]>([]);
const isOpen = ref(false);
const selectionCursor = ref(-1);

watch(
  () => props.value,
  (newValue) => {
    inputValue.value = newValue;
  },
  { immediate: true },
);

function changeResult(result: string): void {
  emit('autocomplete::change', result);
  inputValue.value = '';
}

function onChange(evt: Event): void {
  if (props.notifyChange) {
    return changeResult((evt.target as HTMLInputElement).value);
  }
}

function filterResults(): void {
  results.value = props.items.filter(
    (item) => item.toLowerCase().indexOf(inputValue.value.toLowerCase()) > -1,
  );
}

function onInput(): void {
  isOpen.value = true;
  filterResults();
}

function setResult(result: string): void {
  isOpen.value = false;
  inputValue.value = result;
  emit('autocomplete::change', result);
  inputValue.value = '';
}

function onArrowDown(): void {
  if (selectionCursor.value + 1 < results.value.length) {
    selectionCursor.value = selectionCursor.value + 1;
  }
}

function onArrowUp(): void {
  if (selectionCursor.value > 0) {
    selectionCursor.value = selectionCursor.value - 1;
  }
}

function onEnter(): void {
  setResult(results.value[selectionCursor.value]);
  selectionCursor.value = -1;
}

function handleClickOutside(evt: MouseEvent): void {
  if (!root.value?.contains(evt.target as Node)) {
    isOpen.value = false;
    selectionCursor.value = -1;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
