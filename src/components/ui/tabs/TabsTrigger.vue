<template>
  <button
    :id="`${tabs.baseId}-trigger-${value}`"
    :aria-controls="`${tabs.baseId}-content-${value}`"
    :aria-selected="String(isActive)"
    :class="classes"
    data-slot="tabs-trigger"
    :disabled="disabled"
    role="tab"
    :tabindex="isActive ? 0 : -1"
    type="button"
    v-bind="$attrs"
    v-on="$listeners"
    @click="onClick"
    @keydown.left.prevent="onPrevious"
    @keydown.up.prevent="onPrevious"
    @keydown.right.prevent="onNext"
    @keydown.down.prevent="onNext"
    @keydown.home.prevent="tabs.selectRelative(value, 'first')"
    @keydown.end.prevent="tabs.selectRelative(value, 'last')"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { tabsContext } from './context';

/*
 * TabsTrigger — API publique de shadcn-vue (ADR-0017).
 *
 * Un seul déclencheur est dans l'ordre de tabulation (`tabindex="0"` sur
 * l'onglet courant, `-1` sur les autres) : c'est le motif ARIA du *tablist*,
 * et c'est ce qui rend les flèches nécessaires. `b-tabs` laissait les trois
 * déclencheurs tabulables, donc trois arrêts pour un seul choix.
 *
 * Les flèches suivent l'orientation : haut/bas et gauche/droite sont acceptées
 * dans les deux cas, parce qu'un utilisateur qui se trompe de touche sur une
 * barre verticale ne veut pas être puni pour autant.
 *
 * Le preflight n'étant pas chargé (ADR-0008), le fond et la bordure d'un
 * `<button>` sont posés explicitement (G-021).
 */
export default defineComponent({
  name: 'TabsTrigger',
  mixins: [classMerge, tabsContext],
  inheritAttrs: false,
  props: {
    disabled: {
      default: false,
      type: Boolean,
    },
    value: {
      required: true,
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'inline-flex cursor-pointer items-center gap-2',
        'appearance-none border-0 bg-transparent',
        'px-3 py-2',
        'font-sans text-sm font-medium',
        'transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        this.isActive
          ? 'text-foreground aria-selected:font-semibold'
          : 'text-muted-foreground hover:text-foreground',
        this.activeMarker,
      );
    },
    /* Le repère de l'onglet courant suit l'orientation de la barre. */
    activeMarker(): string {
      if (!this.isActive) {
        return '';
      }

      return this.tabs.orientation === 'vertical'
        ? '-mr-2 border-r-2 border-primary'
        : '-mb-px border-b-2 border-primary';
    },
    isActive(): boolean {
      return this.tabs.value === this.value;
    },
  },
  mounted() {
    this.tabs.register(this.value);
  },
  beforeDestroy() {
    this.tabs.unregister(this.value);
  },
  updated() {
    /* L'onglet qui vient d'être choisi au clavier doit recevoir le focus,
       sinon les flèches suivantes partiraient de l'ancien. */
    if (this.isActive && this.movedByKeyboard) {
      this.movedByKeyboard = false;
      (this.$el as HTMLElement).focus();
    }
  },
  data() {
    return {
      movedByKeyboard: false,
    };
  },
  methods: {
    onClick(): void {
      if (this.disabled) {
        return;
      }
      this.tabs.select(this.value);
    },
    onNext(): void {
      this.moveBy(1);
    },
    onPrevious(): void {
      this.moveBy(-1);
    },
    moveBy(offset: number): void {
      if (this.disabled) {
        return;
      }
      this.movedByKeyboard = true;
      this.tabs.selectRelative(this.value, offset);
    },
  },
});
</script>
