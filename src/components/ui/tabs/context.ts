import { defineComponent } from 'vue';

export type TabsValue = string;

/**
 * Ce que la racine `Tabs` expose à ses descendants (ADR-0017).
 *
 * Même forme que `SelectContext` (ADR-0014) et que le contexte de
 * `DropdownMenu` (ADR-0012) : le contexte **est** l'instance de la racine.
 * `provide()` n'est évalué qu'une fois en Vue 2, et un objet littéral figerait
 * `value` au premier rendu.
 */
export interface TabsContext {
  /** Identifiant unique de l'instance, préfixe des `id` des onglets. */
  baseId: string;
  orientation: 'horizontal' | 'vertical';
  /** Valeurs des onglets, dans l'ordre de montage : c'est ce qui donne son
   * sens aux flèches du clavier. */
  order: TabsValue[];
  value: TabsValue | null;
  register: (value: TabsValue) => void;
  select: (value: TabsValue) => void;
  selectRelative: (from: TabsValue, offset: number | 'first' | 'last') => void;
  unregister: (value: TabsValue) => void;
}

/** Accès typé au contexte depuis un descendant : `this.tabs`. */
export const tabsContext = defineComponent({
  inject: ['tabsRoot'],
  computed: {
    tabs(): TabsContext {
      return (this as unknown as { tabsRoot: TabsContext }).tabsRoot;
    },
  },
});
