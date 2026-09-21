<template>
  <component :is="as" :class="classes" data-slot="badge" v-bind="$attrs" v-on="$listeners">
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

import { classMerge } from '../class-merge';

/*
 * Badge — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-badge>`, dont la console utilise surtout les variantes
 * `primary`, `secondary`, `danger` et `light`. `light` n'existe pas en amont :
 * le rendu correspondant se fait avec `variant="secondary"`.
 *
 * `warning` est en plus de l'amont, sur le token `accent`, comme sur `Alert` et
 * `Button` : les notifications temps réel distinguent « mis à jour » de
 * « supprimé », et les deux ne peuvent pas être rouges.
 *
 * Le preflight n'étant pas chargé (ADR-0008), la bordure et le rayon sont
 * posés explicitement.
 */
export const badgeVariants = cva(
  [
    'tw:inline-flex tw:items-center tw:gap-1.5 tw:shrink-0',
    'tw:border tw:border-transparent tw:rounded-md',
    'tw:px-2 tw:py-0.5',
    'tw:font-sans tw:text-xs tw:font-medium tw:leading-normal tw:whitespace-nowrap',
    'tw:transition-colors',
  ].join(' '),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'tw:bg-primary tw:text-primary-foreground',
        destructive: 'tw:bg-destructive tw:text-destructive-foreground',
        outline: 'tw:border-border tw:text-foreground',
        secondary: 'tw:bg-muted tw:text-muted-foreground',
        warning: 'tw:bg-accent tw:text-accent-foreground',
      },
    },
  },
);

type BadgeVariantProps = VariantProps<typeof badgeVariants>;
export type BadgeVariant = NonNullable<BadgeVariantProps['variant']>;

export default defineComponent({
  name: 'Badge',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    as: {
      default: 'span',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    variant: {
      default: 'default',
      type: String as PropType<BadgeVariant>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(badgeVariants({ variant: this.variant }));
    },
  },
});
</script>
