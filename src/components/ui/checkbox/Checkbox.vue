<template>
  <input
    :checked="modelValue"
    :class="classes"
    type="checkbox"
    v-bind="$attrs"
    v-on="$listeners"
    @change="onChange"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * Checkbox — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-form-checkbox>`. Deux écarts avec l'amont, tous deux assumés :
 *
 * - l'amont rend un `<button role="checkbox">` (reka-ui) ; ici c'est un vrai
 *   `<input type="checkbox">` habillé par `accent-color`. La console coche des
 *   lignes de liste au clavier et à la souris, et les specs cliquent l'élément
 *   qui porte le `data-cy` : un input natif fait les deux sans qu'on ait à
 *   réimplémenter l'état indéterminé, le focus ni la touche Espace ;
 * - `v-model` passe par l'option `model` de Vue 2, comme `Input` (G-012).
 *
 * La valeur est un booléen. `b-form-checkbox` permettait `value` /
 * `unchecked-value` pour stocker autre chose — la console s'en servait pour
 * ranger les chaînes `'true'` et `'false'`, ce qui ne servait rien.
 *
 * Le preflight n'étant pas chargé (ADR-0008), la taille et le curseur sont
 * posés explicitement plutôt que supposés.
 */
export const checkboxClasses = [
  'tw:size-4 tw:shrink-0 tw:cursor-pointer tw:align-middle',
  'tw:accent-primary',
  'tw:outline-none',
  'tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background',
  'tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
].join(' ');

export default defineComponent({
  name: 'Checkbox',
  mixins: [classMerge],
  inheritAttrs: false,
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(checkboxClasses);
    },
  },
  methods: {
    onChange(event: Event): void {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).checked);
    },
  },
});
</script>
