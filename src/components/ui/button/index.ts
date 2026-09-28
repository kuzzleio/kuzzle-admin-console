import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button } from './Button.vue';

/*
 * Variantes de `Button`, dans la structure de l'amont (ADR-0054) : même
 * `buttonVariants` exporté, mêmes tailles, et les classes de la DA à la place
 * de la palette neutre du registre.
 *
 * Une variante en plus de l'amont : `warning`. La console s'en sert pour les
 * actions qui écrasent sans supprimer — « Replace » sur un document en est le
 * cas type. `destructive` dirait « ça détruit », `secondary` ne dirait rien ;
 * `Alert` porte déjà la même variante pour la même raison. `info` et `success`
 * sont dans le même cas.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 shrink-0',
    'whitespace-nowrap align-middle appearance-none cursor-pointer',
    'bg-transparent',
    'border border-transparent rounded-md',
    'font-sans text-ui font-medium leading-none',
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
        icon: 'size-9 p-0',
        'icon-lg': 'size-10 p-0',
        'icon-sm': 'size-8 p-0',
        'icon-xs': 'size-6 p-0 text-small',
        lg: 'h-10 px-6',
        sm: 'h-8 px-3 text-small',
        xs: 'h-6 gap-1 px-2 text-small',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'text-foreground hover:bg-accent hover:text-foreground',
        info: 'bg-info text-info-foreground hover:bg-info/90',
        link: 'text-primary underline-offset-4 hover:text-primary-hover hover:underline',
        outline: 'border-input bg-card text-foreground hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
