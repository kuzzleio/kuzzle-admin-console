import { defineComponent } from 'vue';

/**
 * Ce que la racine `DropdownMenu` expose à ses descendants.
 *
 * Le contexte est l'instance de la racine elle-même : `provide()` n'est évalué
 * qu'une fois en Vue 2, et un objet littéral y figerait `isOpen`. Cette
 * interface est donc la part publique de la racine, et rien d'autre ne doit
 * être lu depuis un enfant.
 */
export interface DropdownMenuContext {
  isOpen: boolean;
  /** Bord sur lequel poser le focus à la prochaine ouverture, quand elle vient
   * du clavier. `null` quand l'ouverture vient de la souris. */
  pendingFocus: 'first' | 'last' | null;
  close: (options?: { focusTrigger?: boolean }) => void;
  setContent: (el: HTMLElement | null) => void;
  setOpen: (open: boolean) => void;
  setTrigger: (el: HTMLElement | null) => void;
  toggle: () => void;
}

/**
 * Accès typé au contexte depuis un descendant : `this.menu`.
 *
 * Le détour par le mixin évite de répéter l'`inject` et la conversion de type
 * dans les sept composants de la famille.
 */
export const dropdownMenuContext = defineComponent({
  inject: ['dropdownMenu'],
  computed: {
    menu(): DropdownMenuContext {
      return (this as unknown as { dropdownMenu: DropdownMenuContext }).dropdownMenu;
    },
  },
});
