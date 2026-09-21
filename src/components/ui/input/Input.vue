<template>
  <input :class="classes" :value="modelValue" v-bind="$attrs" v-on="$listeners" @input="onInput" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Input — API publique de shadcn-vue (ADR-0009).
 *
 * La prop et l'événement portent les noms de l'amont Vue 3 — `modelValue` et
 * `update:modelValue` — alors que le `v-model` de Vue 2 attend `value` et
 * `input`. L'option `model` de Vue 2 fait le pont : `<Input v-model="x" />`
 * fonctionne ici, et les noms n'auront pas à changer en phase 4.
 *
 * Le preflight n'étant pas chargé (ADR-0008), un `<input>` garde les styles par
 * défaut du navigateur et le reboot de Bootstrap : `tw:appearance-none`, la
 * bordure, le fond et la police sont posés explicitement.
 */
export const inputClasses = [
  'tw:flex tw:h-9 tw:w-full tw:min-w-0',
  'tw:appearance-none tw:rounded-md tw:border tw:border-input tw:bg-background',
  'tw:px-3 tw:py-1',
  'tw:font-sans tw:text-sm tw:leading-none tw:text-foreground',
  'tw:transition-colors tw:outline-none',
  'tw:placeholder:text-muted-foreground',
  // `type="file"` : l'input natif dessine son propre bouton, que le preflight
  // absent laisse tel quel. Les variantes `file:` le raccordent aux tokens.
  'tw:file:mr-3 tw:file:border-0 tw:file:bg-transparent tw:file:font-sans tw:file:text-sm tw:file:font-medium tw:file:text-foreground',
  'tw:cursor-pointer tw:file:cursor-pointer',
  // L'état invalide se déclare avec `aria-invalid`, pas avec une prop `state`
  // comme `b-input` : l'attribut porte l'information pour le lecteur d'écran
  // **et** pour la feuille de styles, au lieu de la dupliquer.
  'tw:aria-invalid:border-destructive tw:aria-invalid:focus-visible:ring-destructive',
  'tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background',
  'tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
].join(' ');

export default defineComponent({
  name: 'Input',
  mixins: [classMerge],
  inheritAttrs: false,
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      default: '',
      type: [String, Number] as PropType<string | number>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(inputClasses);
    },
  },
  methods: {
    // `v-on="$listeners"` et ce `@input` sont fusionnés par Vue 2, pas
    // substitués : un `@input` posé par le site d'appel reste appelé.
    onInput(event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    },
  },
});
</script>
