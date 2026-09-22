<template>
  <div
    v-if="open"
    :aria-live="variant === 'danger' ? 'assertive' : 'polite'"
    :class="classes"
    data-slot="toast"
    role="alert"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

import { classMerge } from '../class-merge';

/*
 * Toast — API publique de shadcn-vue (ADR-0020).
 *
 * Remplace `<b-toast>`. Trois différences avec lui, toutes voulues :
 *
 * - **il n'est pas piloté par un `id` global.** `b-toast` s'affichait par
 *   `this.$bvToast.show('mon-id')` depuis n'importe où ; ici l'état est une
 *   prop `open`, comme `Dialog` (ADR-0010) ;
 * - **il n'est pas rendu tant qu'il est fermé**, ce sur quoi les specs du
 *   toast hors-ligne s'appuient déjà (`should('not.exist')`) ;
 * - **`role="alert"` est porté par la primitive**, avec `aria-live`
 *   `assertive` pour une erreur et `polite` sinon : un message qui n'est pas
 *   annoncé n'existe pas pour qui n'a pas l'écran.
 *
 * Les variantes reprennent celles d'`Alert` : la console a besoin des quatre.
 */
export const toastVariants = cva(
  [
    'tw:pointer-events-auto tw:flex tw:w-full tw:flex-col tw:gap-1',
    'tw:rounded-md tw:border tw:p-4 tw:shadow-md',
    'tw:font-sans tw:text-sm',
  ].join(' '),
  {
    defaultVariants: {
      variant: 'warning',
    },
    variants: {
      variant: {
        danger: 'tw:border-destructive/40 tw:bg-destructive/10 tw:text-destructive',
        info: 'tw:border-border tw:bg-card tw:text-card-foreground',
        success: 'tw:border-secondary/40 tw:bg-secondary/10 tw:text-foreground',
        warning: 'tw:border-accent tw:bg-accent/20 tw:text-foreground',
      },
    },
  },
);

type ToastVariantProps = VariantProps<typeof toastVariants>;
export type ToastVariant = NonNullable<ToastVariantProps['variant']>;

export default defineComponent({
  name: 'Toast',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    open: {
      default: true,
      type: Boolean,
    },
    variant: {
      default: 'warning',
      type: String as PropType<ToastVariant>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(toastVariants({ variant: this.variant }));
    },
  },
});
</script>
