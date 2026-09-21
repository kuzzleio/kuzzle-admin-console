import { cva } from 'class-variance-authority';

/**
 * Habillage commun à `DropdownMenuItem` et `DropdownMenuRadioItem`.
 *
 * Extrait parce que les deux doivent rendre exactement la même ligne : un
 * élément de menu ne change pas d'apparence selon qu'il porte une coche ou
 * non, seul le décalage change.
 *
 * `disabled` est une variante et non l'attribut HTML : l'élément peut être un
 * `<a>` ou un `router-link`, sur lesquels `:disabled` n'existe pas. Le clic est
 * arrêté par le composant, l'état annoncé par `aria-disabled`.
 *
 * Sans preflight (ADR-0008), fond, bordure, rayon et curseur sont posés
 * explicitement : un `<button>` nu garderait le fond gris du navigateur.
 */
export const itemClasses = cva(
  [
    'tw:relative tw:flex tw:w-full tw:items-center tw:gap-2',
    'tw:cursor-pointer tw:appearance-none tw:text-left',
    'tw:border tw:border-transparent tw:bg-transparent tw:rounded-sm',
    'tw:px-2 tw:py-1.5',
    'tw:font-sans tw:text-sm tw:leading-normal',
    'tw:outline-none tw:transition-colors',
    'tw:focus-visible:bg-muted tw:hover:bg-muted',
  ].join(' '),
  {
    defaultVariants: {
      disabled: false,
      inset: false,
      variant: 'default',
    },
    variants: {
      disabled: {
        false: '',
        true: 'tw:pointer-events-none tw:cursor-default tw:opacity-50',
      },
      inset: {
        false: '',
        true: 'tw:pl-8',
      },
      variant: {
        default: 'tw:text-popover-foreground',
        destructive: 'tw:text-destructive tw:hover:bg-destructive/10',
      },
    },
  },
);
