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
    'tw:inline-flex tw:items-center tw:justify-center tw:shrink-0',
    'tw:h-9 tw:min-w-9 tw:px-3',
    'tw:appearance-none tw:cursor-pointer',
    'tw:border tw:border-transparent tw:rounded-md',
    'tw:font-sans tw:text-sm tw:font-medium tw:leading-none',
    'tw:transition-colors tw:outline-none',
    'tw:focus-visible:ring-2 tw:focus-visible:ring-ring tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-background',
    'tw:disabled:pointer-events-none tw:disabled:opacity-50',
  ].join(' '),
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: 'tw:bg-transparent tw:text-foreground tw:hover:bg-muted',
        true: 'tw:border-input tw:bg-background tw:text-foreground tw:hover:bg-muted',
      },
    },
  },
);
