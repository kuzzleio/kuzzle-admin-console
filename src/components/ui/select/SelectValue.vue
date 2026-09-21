<template>
  <span :class="classes" data-slot="select-value" v-bind="$attrs">
    <slot v-if="hasValue">{{ label }}</slot>
    <template v-else>{{ placeholder }}</template>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { selectContext } from './context';

/*
 * SelectValue — API publique de shadcn-vue (ADR-0014).
 *
 * Affiche le libellé de l'option retenue, et le `placeholder` quand il n'y en a
 * pas. Le libellé vient de l'index tenu par la racine, que les `SelectItem`
 * renseignent à leur montage ; tant que le panneau n'a jamais été ouvert, il
 * est vide et c'est la valeur brute qui s'affiche. Les sites d'appel de la
 * console ont des valeurs lisibles — `25`, `payloadDate` — et l'écart ne s'y
 * voit pas. Ceux qui auront des valeurs opaques devront ouvrir la liste une
 * fois, ou passer leur libellé dans le slot.
 */
export default defineComponent({
  name: 'SelectValue',
  mixins: [classMerge, selectContext],
  inheritAttrs: false,
  props: {
    placeholder: {
      default: '',
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:truncate',
        this.hasValue ? 'tw:text-foreground' : 'tw:text-muted-foreground',
      );
    },
    hasValue(): boolean {
      const value = this.select.modelValue;
      return value !== null && value !== undefined && value !== '';
    },
    label(): string {
      const value = this.select.modelValue;
      return this.select.labels[String(value)] ?? String(value);
    },
  },
});
</script>
