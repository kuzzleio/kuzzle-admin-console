import { defineComponent } from 'vue';

export type SelectOptionValue = string | number;

/**
 * Ce que la racine `Select` expose à ses descendants (ADR-0014).
 *
 * Comme pour `DropdownMenu` (ADR-0012), le contexte est l'instance de la racine
 * elle-même : `provide()` n'est évalué qu'une fois en Vue 2, et un objet
 * littéral figerait `isOpen` et `modelValue`. Cette interface est la part
 * publique de la racine, et rien d'autre ne doit être lu depuis un enfant.
 */
export interface SelectContext {
  disabled: boolean;
  isOpen: boolean;
  /** Libellé affiché pour une valeur, indexé par `String(valeur)`. Renseigné
   * par les `SelectItem` à leur montage. */
  labels: Record<string, string>;
  modelValue: SelectOptionValue | null;
  close: (options?: { focusTrigger?: boolean }) => void;
  registerLabel: (value: SelectOptionValue, label: string) => void;
  select: (value: SelectOptionValue) => void;
  setContent: (el: HTMLElement | null) => void;
  setOpen: (open: boolean) => void;
  setTrigger: (el: HTMLElement | null) => void;
  toggle: () => void;
}

/** Accès typé au contexte depuis un descendant : `this.select`. */
export const selectContext = defineComponent({
  inject: ['selectRoot'],
  computed: {
    select(): SelectContext {
      return (this as unknown as { selectRoot: SelectContext }).selectRoot;
    },
  },
});
