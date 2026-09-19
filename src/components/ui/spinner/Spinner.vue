<template>
  <span :class="classes" role="status" :aria-label="label" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

import { classMerge } from '../class-merge';

/*
 * Spinner — API publique de shadcn-vue (ADR-0009).
 *
 * Remplace `<b-spinner>`. L'amont dessine un `Loader2` de lucide ; ici c'est un
 * anneau en CSS, pour ne pas faire dépendre une primitive d'une bibliothèque
 * d'icônes que la console n'a pas encore choisie — la console est sur
 * FontAwesome, la phase 4 arrivera avec lucide.
 *
 * `role="status"` et le libellé sont portés par la primitive : un indicateur de
 * chargement sans annonce accessible est un défaut, pas un choix de style.
 */
export const spinnerVariants = cva(
  [
    'tw:inline-block tw:shrink-0 tw:align-middle',
    'tw:rounded-full tw:border-current tw:border-r-transparent',
    'tw:animate-spin tw:motion-reduce:animate-none',
  ].join(' '),
  {
    defaultVariants: {
      size: 'default',
    },
    variants: {
      size: {
        default: 'tw:size-6 tw:border-2',
        lg: 'tw:size-10 tw:border-4',
        sm: 'tw:size-4 tw:border-2',
      },
    },
  },
);

type SpinnerVariantProps = VariantProps<typeof spinnerVariants>;
export type SpinnerSize = NonNullable<SpinnerVariantProps['size']>;

export default defineComponent({
  name: 'Spinner',
  mixins: [classMerge],
  inheritAttrs: false,
  props: {
    label: {
      default: 'Loading',
      type: String,
    },
    size: {
      default: 'default',
      type: String as PropType<SpinnerSize>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(spinnerVariants({ size: this.size }));
    },
  },
});
</script>
