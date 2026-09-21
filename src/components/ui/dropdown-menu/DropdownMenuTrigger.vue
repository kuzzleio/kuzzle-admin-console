<template>
  <component
    :is="as"
    ref="trigger"
    aria-haspopup="menu"
    :aria-expanded="String(isOpen)"
    :class="classes"
    data-slot="dropdown-menu-trigger"
    v-bind="$attrs"
    v-on="$listeners"
    @click="onClick"
    @keydown.down.prevent="openFrom('first')"
    @keydown.up.prevent="openFrom('last')"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { dropdownMenuContext } from './context';

/*
 * DropdownMenuTrigger — API publique de shadcn-vue (ADR-0012).
 *
 * `asChild` n'existe pas en Vue 2 (ADR-0009) : la prop `as` couvre le besoin.
 * Le rendu par défaut est un `<button>` nu — un déclencheur de menu se style au
 * site d'appel, souvent avec les classes de `Button`, parfois pas du tout.
 *
 * Les flèches haut/bas ouvrent le menu **et** posent le focus sur le premier
 * ou le dernier élément : c'est ce qu'attend le motif `menu button` de l'ARIA
 * APG, et c'est ce qui rend le menu utilisable sans souris.
 */
export default defineComponent({
  name: 'DropdownMenuTrigger',
  mixins: [classMerge, dropdownMenuContext],
  inheritAttrs: false,
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses('tw:cursor-pointer');
    },
    isOpen(): boolean {
      return this.menu.isOpen;
    },
  },
  mounted() {
    this.menu.setTrigger(this.$el as HTMLElement);
  },
  beforeDestroy() {
    this.menu.setTrigger(null);
  },
  methods: {
    onClick(): void {
      this.menu.toggle();
    },
    openFrom(edge: 'first' | 'last'): void {
      this.menu.pendingFocus = edge;
      if (!this.isOpen) {
        this.menu.setOpen(true);
      }
    },
  },
});
</script>
