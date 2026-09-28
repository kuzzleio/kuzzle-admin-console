import { cva, type VariantProps } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

/*
 * Variantes de `Badge`, dans la structure de l'amont (ADR-0054).
 *
 * `warning`, `success` et `info` sont en plus de l'amont, sur les tokens
 * d'état, comme sur `Alert` et `Button` : les notifications temps réel
 * distinguent « mis à jour » de « supprimé », et les deux ne peuvent pas être
 * rouges.
 *
 * `default` (fuchsia) est réservé aux compteurs : c'est le « count badge » du
 * DS, et le fuchsia est le seul accent de l'écran. Un tag (nom de profil,
 * controller : action) prend `info`, le « tag » Soft Sky du DS.
 */
export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 shrink-0',
    'border border-transparent rounded-pill',
    'px-2 py-0.5',
    'font-sans text-xs font-medium leading-normal whitespace-nowrap',
    'transition-colors',
  ].join(' '),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
        secondary: 'bg-muted text-muted-foreground',
        info: 'bg-secondary text-info',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
      },
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariant = NonNullable<BadgeVariants['variant']>;
