<template>
  <component :is="as" :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';

import { classMerge } from '../class-merge';

/*
 * Première primitive du design system (ADR-0003, ADR-0009).
 *
 * L'API publique est celle de `shadcn-vue` — mêmes noms de variantes, mêmes
 * tailles, même `buttonVariants` exporté — pour qu'en phase 4 le remplacement
 * par le vrai composant amont soit un changement d'import, pas une reprise des
 * sites d'appel.
 *
 * Une variante en plus de l'amont : `warning`, sur le token `accent`. La
 * console s'en sert pour les actions qui écrasent sans supprimer — « Replace »
 * sur un document en est le cas type. `destructive` dirait « ça détruit »,
 * `secondary` ne dirait rien ; `Alert` porte déjà la même variante pour la même
 * raison.
 *
 * Deux écarts, tous deux dus à Vue 2 et à la cohabitation avec Bootstrap :
 *
 * - pas de `asChild` : il repose sur `Primitive` de `reka-ui`, qui demande
 *   Vue 3. La prop `as` couvre le besoin courant (`as="a"`,
 *   `as="router-link"`) ;
 * - les classes portent le préfixe `tw:` (ADR-0008).
 *
 * Comme le preflight de Tailwind n'est pas chargé, le composant ne peut rien
 * supposer des styles par défaut du navigateur ni du reboot de Bootstrap : la
 * bordure, le fond, le rayon et le curseur sont posés explicitement.
 */
export const buttonVariants = cva(
  [
    'tw:inline-flex tw:items-center tw:justify-center tw:gap-2 tw:shrink-0',
    'tw:whitespace-nowrap tw:align-middle tw:appearance-none tw:cursor-pointer',
    'tw:border tw:border-transparent tw:rounded-md',
    'tw:font-sans tw:text-sm tw:font-medium tw:leading-none',
    'tw:transition-colors tw:outline-none',
    'tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background',
    'tw:disabled:pointer-events-none tw:disabled:opacity-50',
  ].join(' '),
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'tw:h-9 tw:px-4 tw:py-2',
        icon: 'tw:h-9 tw:w-9 tw:p-0',
        lg: 'tw:h-10 tw:px-6',
        sm: 'tw:h-8 tw:px-3 tw:text-xs',
      },
      variant: {
        default: 'tw:bg-primary tw:text-primary-foreground tw:hover:bg-primary/90',
        destructive: 'tw:bg-destructive tw:text-destructive-foreground tw:hover:bg-destructive/90',
        ghost: 'tw:text-foreground tw:hover:bg-muted tw:hover:text-foreground',
        link: 'tw:text-secondary tw:underline-offset-4 tw:hover:underline',
        outline: 'tw:border-input tw:bg-background tw:text-foreground tw:hover:bg-muted',
        secondary: 'tw:bg-secondary tw:text-secondary-foreground tw:hover:bg-secondary/80',
        warning: 'tw:bg-accent tw:text-accent-foreground tw:hover:bg-accent/90',
      },
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
export type ButtonSize = NonNullable<ButtonVariantProps['size']>;

export default defineComponent({
  name: 'Button',
  mixins: [classMerge],
  // Les attributs non déclarés (`type`, `disabled`, `data-cy`, `aria-*`) sont
  // posés à la main sur l'élément rendu, pas sur la racine par défaut.
  inheritAttrs: false,
  props: {
    as: {
      default: 'button',
      type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    size: {
      default: 'default',
      type: String as PropType<ButtonSize>,
    },
    variant: {
      default: 'default',
      type: String as PropType<ButtonVariant>,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(buttonVariants({ size: this.size, variant: this.variant }));
    },
  },
});
</script>
