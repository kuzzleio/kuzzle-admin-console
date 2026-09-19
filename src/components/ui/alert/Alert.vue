<template>
  <div :class="classes" role="alert" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

import { classMerge } from '../class-merge';

/*
 * Alert — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `b-alert`. `role="alert"` est porté par la primitive : un message
 * d'erreur qui n'est pas annoncé n'existe pas pour qui n'a pas l'écran.
 *
 * L'amont propose `default` et `destructive`. `success` est ajouté ici parce
 * que la console s'en sert (confirmation d'import), et qu'il vaut mieux une
 * variante nommée qu'un `class="tw:bg-green-…"` posé à la main au site d'appel.
 */
export const alertVariants = cva(
  [
    'tw:relative tw:w-full tw:rounded-md tw:border tw:px-4 tw:py-3',
    'tw:font-sans tw:text-sm tw:leading-normal',
  ].join(' '),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'tw:border-border tw:bg-card tw:text-card-foreground',
        destructive: 'tw:border-destructive/40 tw:bg-destructive/10 tw:text-destructive',
        success: 'tw:border-secondary/40 tw:bg-secondary/10 tw:text-foreground',
      },
    },
  },
);

type AlertVariantProps = VariantProps<typeof alertVariants>;
export type AlertVariant = NonNullable<AlertVariantProps['variant']>;

export default defineComponent({
  name: 'Alert',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    variant: {
      default: 'default',
      type: String as PropType<AlertVariant>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(alertVariants({ variant: this.variant }));
    },
  },
});
</script>
