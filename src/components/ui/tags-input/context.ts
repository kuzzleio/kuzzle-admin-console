import { defineComponent } from 'vue';

/**
 * Ce que la racine `TagsInput` expose à ses descendants (ADR-0019).
 *
 * Même forme que les contextes de `Select` (ADR-0014) et de `Tabs`
 * (ADR-0017) : le contexte **est** l'instance de la racine, parce que
 * `provide()` n'est évalué qu'une fois en Vue 2.
 */
export interface TagsInputContext {
  disabled: boolean;
  modelValue: string[];
  add: (value: string) => void;
  remove: (value: string) => void;
  removeLast: () => void;
}

/** Accès typé au contexte depuis un descendant : `this.tagsInput`. */
export const tagsInputContext = defineComponent({
  inject: ['tagsInputRoot'],
  computed: {
    tagsInput(): TagsInputContext {
      return (this as unknown as { tagsInputRoot: TagsInputContext }).tagsInputRoot;
    },
  },
});
