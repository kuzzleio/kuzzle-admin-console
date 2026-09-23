<template>
  <div :class="classes" role="group" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DropdownMenuRadioGroup — API publique de shadcn-vue (ADR-0012).
 *
 * `b-dropdown-item` n'avait qu'une prop `active`, qui posait une classe et
 * rien d'autre : à la lecture d'écran, l'élément courant était indiscernable
 * des autres. Un menu qui désigne l'élément en cours parmi plusieurs exclusifs
 * est un groupe de boutons radio, et l'amont a le composant qui va avec.
 *
 * La valeur suit `v-model` par l'option `model` de Vue 2, comme `Checkbox` et
 * `Input` (G-012). Le groupe ne la modifie pas de lui-même : il émet, et
 * l'appelant décide — ici, en naviguant.
 */
export default defineComponent({
  name: 'DropdownMenuRadioGroup',
  mixins: [classMerge],
  inheritAttrs: false,
  provide(): { dropdownMenuRadioGroup: unknown } {
    return { dropdownMenuRadioGroup: this };
  },
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      default: undefined,
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses('');
    },
  },
  methods: {
    select(value: string): void {
      this.$emit('update:modelValue', value);
    },
  },
});
</script>
