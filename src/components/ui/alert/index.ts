import { cva, type VariantProps } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';

/*
 * Variantes d'`Alert`, dans la structure de l'amont (ADR-0054).
 *
 * L'amont propose `default` et `destructive`. `info`, `success` et `warning`
 * sont ajoutés ici parce que la console s'en sert (confirmation d'import,
 * alerte « vous éditez votre propre profil »), et qu'il vaut mieux une variante
 * nommée qu'un `class="bg-green-…"` posé à la main au site d'appel.
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
        info: 'border-info/30 bg-secondary text-foreground',
        success: 'border-success/60 bg-success/15 text-foreground',
        warning: 'border-warning/60 bg-warning/15 text-foreground',
      },
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
