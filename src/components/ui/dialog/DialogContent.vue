<template>
  <div
    ref="content"
    :aria-describedby="describedBy"
    :aria-labelledby="labelledBy"
    aria-modal="true"
    :class="classes"
    role="dialog"
    tabindex="-1"
    v-bind="$attrs"
    @keydown.tab="trapFocus"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';

/*
 * DialogContent — le panneau de la modale (ADR-0010).
 *
 * Porte le piège de focus : sans lui, la tabulation sort de la modale et
 * continue derrière le fond assombri, sur des contrôles que l'utilisateur ne
 * voit pas. Ça ne se remarque jamais à la souris, et c'est la raison pour
 * laquelle ce comportement est dans la primitive et non dans les sites d'appel.
 *
 * Le focus est posé à l'ouverture sur le premier élément focalisable — ou sur
 * le panneau lui-même s'il n'y en a pas — et rendu à l'élément qui avait le
 * focus avant l'ouverture.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default defineComponent({
  name: 'DialogContent',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    describedBy: {
      default: undefined,
      type: String,
    },
    labelledBy: {
      default: undefined,
      type: String,
    },
  },
  data() {
    return {
      previouslyFocused: null as HTMLElement | null,
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'relative z-10 my-8 flex w-full max-w-lg flex-col gap-4',
        'rounded-lg border border-border bg-card text-card-foreground',
        'p-6 shadow-lg outline-none',
      );
    },
  },
  mounted() {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.$nextTick(() => {
      const first = this.focusable()[0];
      (first ?? (this.$refs.content as HTMLElement))?.focus();
    });
  },
  beforeUnmount() {
    this.previouslyFocused?.focus?.();
  },
  methods: {
    focusable(): HTMLElement[] {
      const root = this.$refs.content as HTMLElement | undefined;
      if (!root) {
        return [];
      }
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    },
    trapFocus(event: KeyboardEvent): void {
      const items = this.focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === this.$refs.content)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
  },
});
</script>
