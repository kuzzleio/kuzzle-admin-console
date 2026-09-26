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
    @click="onClick"
    @keydown.down.prevent="onArrow"
    @keydown.up.prevent="onArrow"
  >
    <slot />
    <i aria-hidden="true" class="fa fa-chevron-down ml-2 text-xs opacity-50" />
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
        'flex h-9 w-full items-center justify-between gap-2',
        'appearance-none cursor-pointer',
        'rounded-sm border border-input bg-card',
        'px-3 py-2',
        'font-sans text-sm leading-none text-foreground',
        'transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
  beforeUnmount() {
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
