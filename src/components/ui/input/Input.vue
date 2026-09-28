<template>
  <input v-model="modelValue" :class="cn(inputClasses, props.class)" data-slot="input" />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';

import { cn } from '@/lib/utils';

import { inputClasses } from '.';

/*
 * Input de shadcn-vue (ADR-0054). `v-model` passe par `useVModel` en mode
 * passif, comme en amont : sans `v-model` au site d'appel, le champ garde sa
 * saisie pour lui.
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
