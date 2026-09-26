<template>
  <div
    v-if="open"
    :aria-live="variant === 'danger' ? 'assertive' : 'polite'"
    :class="classes"
    data-slot="toast"
    role="alert"
    v-bind="$attrs"
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
 * Contrairement à `Alert`, un toast flotte au-dessus du contenu : sa teinte
 * est mêlée à `card` plutôt qu'à la transparence, sans quoi il est illisible
 * sur ce qu'il recouvre (E-03 de la comparaison v4 / v5).
 */
export const toastVariants = cva(
  [
    'pointer-events-auto flex w-full flex-col gap-1',
    'rounded-md border p-4 shadow-menu',
    'font-sans text-sm',
  ].join(' '),
  {
    defaultVariants: {
      variant: 'warning',
    },
    variants: {
      variant: {
        danger:
          'border-destructive/40 bg-[color-mix(in_oklab,var(--color-destructive)_10%,var(--color-card))] text-destructive',
        info: 'border-info/30 bg-secondary text-foreground',
        success:
          'border-success/60 bg-[color-mix(in_oklab,var(--color-success)_15%,var(--color-card))] text-foreground',
        warning:
          'border-warning/60 bg-[color-mix(in_oklab,var(--color-warning)_15%,var(--color-card))] text-foreground',
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
