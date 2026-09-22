<template>
  <div :class="classes" data-slot="tags-input" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import type { TagsInputContext } from './context';

/*
 * TagsInput — API publique de shadcn-vue (ADR-0019).
 *
 * Remplace `<b-form-tags>`. Trois différences avec lui, toutes voulues :
 *
 * - **la valeur est un tableau, pas une chaîne à séparateur.** `b-form-tags`
 *   acceptait les deux et devinait ; ici `modelValue` est toujours un tableau
 *   de chaînes ;
 * - **un doublon est ignoré en silence**, comme en amont. `b-form-tags`
 *   affichait un message d'erreur sous le champ, que la console masquait ;
 * - **`Retour arrière` sur un champ vide retire la dernière étiquette.**
 *   C'est le geste attendu d'un champ à étiquettes, et `b-form-tags` ne le
 *   faisait pas.
 *
 * La racine ne rend qu'une enveloppe : les étiquettes et le champ sont
 * composés au site d'appel, comme en amont.
 */
export default defineComponent({
  name: 'TagsInput',
  mixins: [classMerge],
  inheritAttrs: false,
  model: {
    event: 'update:modelValue',
    prop: 'modelValue',
  },
  provide(): { tagsInputRoot: TagsInputContext } {
    return { tagsInputRoot: this as unknown as TagsInputContext };
  },
  props: {
    disabled: {
      default: false,
      type: Boolean,
    },
    modelValue: {
      default: () => [],
      type: Array as PropType<string[]>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:flex tw:flex-wrap tw:items-center tw:gap-2',
        'tw:rounded-md tw:border tw:border-input tw:bg-background tw:px-3 tw:py-2',
        'tw:focus-within:ring-2 tw:focus-within:ring-ring tw:focus-within:ring-offset-2 tw:focus-within:ring-offset-background',
        this.disabled ? 'tw:cursor-not-allowed tw:opacity-50' : '',
      );
    },
  },
  methods: {
    add(value: string): void {
      const tag = value.trim();

      if (this.disabled || tag === '' || this.modelValue.includes(tag)) {
        return;
      }

      this.$emit('update:modelValue', [...this.modelValue, tag]);
    },
    remove(value: string): void {
      if (this.disabled) {
        return;
      }
      this.$emit(
        'update:modelValue',
        this.modelValue.filter((tag) => tag !== value),
      );
    },
    removeLast(): void {
      if (this.disabled || this.modelValue.length === 0) {
        return;
      }
      this.$emit('update:modelValue', this.modelValue.slice(0, -1));
    },
  },
});
</script>
