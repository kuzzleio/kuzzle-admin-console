<template>
  <!--
    Le cas par défaut est écrit en dur plutôt que passé par `<component :is>`.
    Vue 3 résout la chaîne d'un `:is` **comme un composant avant de la traiter
    comme une balise**, et `resolveAsset` compare le nom demandé au nom du
    composant courant : `capitalize(camelize('button'))` vaut `Button`, donc
    `<component :is="'button'">` se rendait lui-même, à l'infini (G-039).
  -->
  <button v-if="as === 'button'" :class="classes" v-bind="$attrs" v-on="$listeners">
    <slot />
  </button>
  <component :is="as" v-else :class="classes" v-bind="$attrs" v-on="$listeners">
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
 * Un écart subsiste, dû à Vue 2 : pas de `asChild`, il repose sur `Primitive`
 * de `reka-ui`, qui demande Vue 3. La prop `as` couvre le besoin courant
 * (`as="a"`, `as="router-link"`).
 *
 * La bordure, le fond, le rayon et le curseur restent posés explicitement :
 * le preflight ne les donne pas, il ne fait que normaliser.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 shrink-0',
    'whitespace-nowrap align-middle appearance-none cursor-pointer',
    // `bg-transparent` dans la base, pas seulement dans les variantes qui n'ont
    // pas de fond : sans preflight, un `<button>` garde le fond gris par défaut
    // du navigateur, et `ghost` comme `link` s'affichaient en gris (G-021). Les
    // variantes qui posent un fond gagnent, `tailwind-merge` les départage.
    'bg-transparent',
    'border border-transparent rounded-md',
    'font-sans text-sm font-medium leading-none',
    'transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'h-9 w-9 p-0',
        lg: 'h-10 px-6',
        sm: 'h-8 px-3 text-xs',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground',
        link: 'text-secondary underline-offset-4 hover:underline',
        outline: 'border-input bg-background text-foreground hover:bg-muted',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        warning: 'bg-accent text-accent-foreground hover:bg-accent/90',
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
