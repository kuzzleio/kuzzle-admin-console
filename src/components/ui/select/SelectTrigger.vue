<template>
  <component
    :is="as"
    ref="trigger"
    aria-haspopup="listbox"
    :aria-expanded="String(isOpen)"
    :class="classes"
    data-slot="select-trigger"
    :disabled="disabled"
    role="combobox"
    type="button"
    v-bind="$attrs"
    v-on="$listeners"
    @click="onClick"
    @keydown.down.prevent="onArrow"
    @keydown.up.prevent="onArrow"
  >
    <slot />
    <i aria-hidden="true" class="fa fa-chevron-down tw:ml-2 tw:text-xs tw:opacity-50" />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { selectContext } from './context';

/*
 * SelectTrigger — API publique de shadcn-vue (ADR-0014).
 *
 * `role="combobox"` et `aria-expanded` : le déclencheur d'une liste déroulante
 * n'est pas un bouton de menu. C'est la différence visible avec
 * `DropdownMenuTrigger`, qui annonce `aria-haspopup="menu"`.
 *
 * `type="button"` est explicite : dans un `<form>`, un `<button>` sans type
 * soumet — `TimeSeries` place justement son sélecteur à côté d'un formulaire.
 *
 * `Entrée` et `Espace` ne sont pas interceptés : le navigateur les traduit déjà
 * en `click` sur un `<button>`, et les traiter en plus ouvrirait puis
 * refermerait le panneau.
 */
export default defineComponent({
  name: 'SelectTrigger',
  mixins: [classMerge, selectContext],
  inheritAttrs: false,
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:flex tw:h-9 tw:w-full tw:items-center tw:justify-between tw:gap-2',
        'tw:appearance-none tw:cursor-pointer',
        'tw:rounded-md tw:border tw:border-input tw:bg-background',
        'tw:px-3 tw:py-2',
        'tw:font-sans tw:text-sm tw:leading-none tw:text-foreground',
        'tw:transition-colors tw:outline-none',
        'tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background',
        'tw:disabled:cursor-not-allowed tw:disabled:opacity-50',
      );
    },
    disabled(): boolean {
      return this.select.disabled;
    },
    isOpen(): boolean {
      return this.select.isOpen;
    },
  },
  mounted() {
    this.select.setTrigger(this.$el as HTMLElement);
  },
  beforeDestroy() {
    this.select.setTrigger(null);
  },
  methods: {
    onClick(): void {
      this.select.toggle();
    },
    onArrow(): void {
      if (!this.isOpen) {
        this.select.setOpen(true);
      }
    },
  },
});
</script>
