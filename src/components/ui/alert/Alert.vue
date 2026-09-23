<template>
  <div :class="classes" role="alert" v-bind="$attrs">
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
 * L'amont propose `default` et `destructive`. `success` et `warning` sont
 * ajoutés ici parce que la console s'en sert (confirmation d'import, alerte
 * « vous éditez votre propre profil »), et qu'il vaut mieux une variante nommée
 * qu'un `class="bg-green-…"` posé à la main au site d'appel.
 */
export const alertVariants = cva(
  ['relative w-full rounded-md border px-4 py-3', 'font-sans text-sm leading-normal'].join(' '),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
        success: 'border-secondary/40 bg-secondary/10 text-foreground',
        warning: 'border-accent bg-accent/20 text-foreground',
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
