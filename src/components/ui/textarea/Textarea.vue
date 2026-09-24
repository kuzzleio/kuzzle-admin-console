<template>
  <textarea :class="classes" :value="modelValue" v-bind="$attrs" @input="handleInput" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { inputClasses } from '../input';

/*
 * Textarea — API publique de shadcn-vue (ADR-0009).
 *
 * Reprend les classes d'`Input` et ne redéfinit que ce qui distingue une zone
 * de texte : plusieurs lignes, une hauteur minimale, un interligne lisible et
 * un redimensionnement vertical. Dupliquer la bordure, le fond et les états de
 * focus aurait fait diverger les deux champs à la première retouche de token.
 *
 * `v-model` passe par l'option `model` de Vue 2, comme `Input` (G-012).
 */
export const textareaClasses = [inputClasses, 'h-auto min-h-16 resize-y py-2 leading-normal'].join(
  ' ',
);

export default defineComponent({
  name: 'Textarea',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    modelValue: {
      default: '',
      type: [String, Number] as PropType<string | number>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(textareaClasses);
    },
  },
  methods: {
    handleInput(event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
    },
  },
});
</script>
