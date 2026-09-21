import { cva } from 'class-variance-authority';

/**
 * Habillage d'une option de `Select` (ADR-0014).
 *
 * Volontairement proche de `dropdownMenuItemVariants` sans le partager : une
 * option de liste et un élément de menu se ressemblent aujourd'hui, mais ils ne
 * sont pas la même chose, et l'amont les tient séparés. Les factoriser ferait
 * qu'une retouche du menu changerait les listes sans qu'on le veuille.
 *
 * Le décalage à gauche est constant, coche ou non : sans lui, l'option
 * sélectionnée se décalerait des autres.
 */
export const itemClasses = cva(
  [
    'tw:relative tw:flex tw:w-full tw:items-center tw:gap-2',
    'tw:cursor-pointer tw:appearance-none tw:text-left',
    'tw:border tw:border-transparent tw:bg-transparent tw:rounded-sm',
    'tw:py-1.5 tw:pr-2 tw:pl-8',
    'tw:font-sans tw:text-sm tw:leading-normal tw:text-popover-foreground',
    'tw:outline-none tw:transition-colors',
    'tw:focus-visible:bg-muted tw:hover:bg-muted',
  ].join(' '),
  {
    defaultVariants: {
      disabled: false,
    },
    variants: {
      disabled: {
        false: '',
        true: 'tw:pointer-events-none tw:cursor-default tw:opacity-50',
      },
    },
  },
);
