import { cva } from 'class-variance-authority';

/**
 * Habillage commun aux éléments de menu (ADR-0054).
 *
 * Un élément de menu ne change pas d'apparence selon qu'il porte une coche ou
 * non, seul le décalage change. `reka-ui` pose `data-highlighted` sur l'élément
 * que le clavier ou la souris désigne, et `data-disabled` sur un élément
 * désactivé : les états se lisent sur ces attributs.
 */
export const itemClasses = cva(
  [
    'relative flex w-full items-center gap-2',
    'cursor-pointer select-none appearance-none text-left',
    'border border-transparent bg-transparent rounded-sm',
    'px-2 py-1.5',
    'font-sans text-sm leading-normal',
    'outline-none transition-colors',
    // Le fond Row Hover seul (1,1:1) ne signale pas le focus : filet Captain Blue.
    'data-highlighted:bg-accent focus-visible:shadow-[inset_3px_0_0_var(--color-ring)]',
    'data-disabled:pointer-events-none data-disabled:cursor-default data-disabled:opacity-50',
  ].join(' '),
  {
    defaultVariants: {
      inset: false,
      variant: 'default',
    },
    variants: {
      inset: {
        false: '',
        true: 'pl-8',
      },
      variant: {
        default: 'text-popover-foreground',
        destructive: 'text-destructive data-highlighted:bg-destructive/10',
      },
    },
  },
);
