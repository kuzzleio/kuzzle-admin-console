<template>
  <button
    :aria-label="`Remove ${value}`"
    :class="classes"
    data-slot="tags-input-item-delete"
    :disabled="tagsInput.disabled"
    type="button"
    v-bind="$attrs"
    @click="tagsInput.remove(value)"
  >
    <slot><i aria-hidden="true" class="fa fa-times" /></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { tagsInputContext } from './context';

/*
 * TagsInputItemDelete — API publique de shadcn-vue (ADR-0019).
 *
 * C'est un `<button>` et non l'icône cliquable de `b-form-tags` : retirer une
 * étiquette est une action, et elle doit être atteignable au clavier et
 * annoncée.
 */
export default defineComponent({
  name: 'TagsInputItemDelete',
  mixins: [classMerge, tagsInputContext],
  inheritAttrs: false,
  props: {
    value: {
      required: true,
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        // Sans preflight (ADR-0008), un `<button>` garde la bordure et le fond
        // du navigateur : les deux sont retirés explicitement (G-021).
        'appearance-none border-0 bg-transparent p-0',
        'cursor-pointer text-xs leading-none opacity-60',
        'outline-none hover:opacity-100',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed',
      );
    },
  },
});
</script>
