<template>
  <input :class="classes" :value="modelValue" v-bind="$attrs" @input="handleInput" />
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
 * défaut du navigateur et le reboot de Bootstrap : `appearance-none`, la
 * bordure, le fond et la police sont posés explicitement.
 *
 * La méthode s'appelle `handleInput` et non `onInput` : un `@input` posé par le
 * site d'appel — `DateTimeFormInput` le fait — arrive ici comme une prop nommée
 * `onInput`, qui masquerait la méthode (G-047).
 */
export const inputClasses = [
  'flex h-9 w-full min-w-0',
  'appearance-none rounded-md border border-input bg-background',
  'px-3 py-1',
  'font-sans text-sm leading-none text-foreground',
  'transition-colors outline-none',
  'placeholder:text-muted-foreground',
  // `type="file"` : l'input natif dessine son propre bouton, que le preflight
  // absent laisse tel quel. Les variantes `file:` le raccordent aux tokens.
  'file:mr-3 file:border-0 file:bg-transparent file:font-sans file:text-sm file:font-medium file:text-foreground',
  'cursor-pointer file:cursor-pointer',
  // L'état invalide se déclare avec `aria-invalid`, pas avec une prop `state`
  // comme `b-input` : l'attribut porte l'information pour le lecteur d'écran
  // **et** pour la feuille de styles, au lieu de la dupliquer.
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
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
    // Le `@input` du site d'appel arrive dans `$attrs` sous la clé `onInput`
    // et Vue fusionne les deux gestionnaires sur l'élément, il ne les
    // substitue pas : celui du site d'appel reste appelé.
    handleInput(event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    },
  },
});
</script>
