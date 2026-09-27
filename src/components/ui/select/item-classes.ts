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
    'relative flex w-full items-center gap-2',
    'cursor-pointer appearance-none text-left',
    'border border-transparent bg-transparent rounded-sm',
    'py-1.5 pr-2 pl-8',
    'font-sans text-sm leading-normal text-popover-foreground',
    'outline-none transition-colors',
    // Le fond Row Hover seul (1,1:1) ne signale pas le focus : filet Captain Blue.
    'focus-visible:bg-accent focus-visible:shadow-[inset_3px_0_0_var(--color-ring)] hover:bg-accent',
  ].join(' '),
  {
    defaultVariants: {
      disabled: false,
    },
    variants: {
      disabled: {
        false: '',
        true: 'pointer-events-none cursor-default opacity-50',
      },
    },
  },
);
