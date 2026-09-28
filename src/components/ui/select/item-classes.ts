import { cva } from 'class-variance-authority';

/**
 * Habillage d'une option de `Select` (ADR-0014, ADR-0054).
 *
 * Volontairement proche des éléments de `DropdownMenu` sans le partager : une
 * option de liste et un élément de menu se ressemblent aujourd'hui, mais ils ne
 * sont pas la même chose, et l'amont les tient séparés.
 *
 * La coche est à gauche et le décalage est constant, coche ou non : sans lui,
 * l'option retenue se décalerait des autres. `reka-ui` pose `data-highlighted`
 * sur l'option que le clavier ou la souris désigne.
 */
export const itemClasses = cva(
  [
    'relative flex w-full items-center gap-2',
    'cursor-pointer select-none text-left',
    'rounded-sm py-1.5 pr-2 pl-8',
    'font-sans text-sm leading-normal text-popover-foreground',
    'outline-none transition-colors',
    // Le fond Row Hover seul (1,1:1) ne signale pas le focus : filet Captain Blue.
    'data-highlighted:bg-accent data-highlighted:shadow-[inset_3px_0_0_var(--color-ring)]',
    'data-disabled:pointer-events-none data-disabled:cursor-default data-disabled:opacity-50',
  ].join(' '),
);
