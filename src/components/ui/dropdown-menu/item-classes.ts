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
    'relative flex w-full items-center gap-2',
    'cursor-pointer appearance-none text-left',
    'border border-transparent bg-transparent rounded-sm',
    'px-2 py-1.5',
    'font-sans text-sm leading-normal',
    'outline-none transition-colors',
    'focus-visible:bg-muted hover:bg-muted',
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
        true: 'pointer-events-none cursor-default opacity-50',
      },
      inset: {
        false: '',
        true: 'pl-8',
      },
      variant: {
        default: 'text-popover-foreground',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
    },
  },
);
