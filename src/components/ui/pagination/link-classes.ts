import { cva } from 'class-variance-authority';

/**
 * Habillage commun aux boutons de la barre : numéros de page et flèches.
 *
 * Aligné sur les variantes `outline` et `ghost` de `Button` — même hauteur,
 * même rayon, même anneau de focus — sans passer par `Button` lui-même : un
 * élément de pagination porte `aria-current` et un `value`, que la primitive
 * `Button` n'a pas à connaître.
 */
export const paginationLinkClasses = cva(
  [
    'inline-flex items-center justify-center shrink-0',
    'h-9 min-w-9 px-3',
    'appearance-none cursor-pointer',
    'border border-transparent rounded-md',
    'font-sans text-sm font-medium leading-none',
    'transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: 'bg-transparent text-foreground hover:bg-muted',
        true: 'border-input bg-background text-foreground hover:bg-muted',
      },
    },
  },
);
