<template>
  <span :class="classes" data-slot="tags-input-item" :title="value" v-bind="$attrs">
    <slot />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * TagsInputItem — API publique de shadcn-vue (ADR-0019).
 *
 * `title` porte la valeur : une étiquette tronquée doit rester lisible, et
 * c'est aussi ce à quoi la commande Cypress `removeFormTag` s'accroche — comme
 * elle le faisait sur `.b-form-tag[title]`.
 */
export default defineComponent({
  name: 'TagsInputItem',
  mixins: [classMerge],
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
        'inline-flex max-w-full items-center gap-1 rounded-md',
        'bg-secondary px-2 py-0.5',
        'font-sans text-sm text-secondary-foreground',
      );
    },
  },
});
</script>
