<template>
  <textarea
    v-model="modelValue"
    :class="cn(inputClasses, 'h-auto min-h-16 resize-y py-2 leading-normal', props.class)"
    data-slot="textarea"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';

import { inputClasses } from '../input';
import { cn } from '@/lib/utils';

/*
 * Textarea de shadcn-vue (ADR-0054). Reprend les classes d'`Input` et ne
 * redéfinit que ce qui distingue une zone de texte : plusieurs lignes, une
 * hauteur minimale, un interligne lisible et un redimensionnement vertical.
 */
const props = defineProps<{
  class?: HTMLAttributes['class'];
  defaultValue?: string | number;
  modelValue?: string | number;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
});
</script>
