import { defineComponent } from 'vue';

/**
 * Ce que `ResizablePanelGroup` expose à ses descendants (ADR-0021).
 *
 * Même forme que les contextes de `Select` (ADR-0014), `Tabs` (ADR-0017) et
 * `TagsInput` (ADR-0019) : le contexte **est** l'instance de la racine.
 */
export interface ResizableContext {
  direction: 'horizontal' | 'vertical';
  /** Poignée en cours de déplacement : sert à afficher l'état actif. */
  dragging: boolean;
  startDrag: (event: MouseEvent | TouchEvent) => void;
  stepResize: (delta: number) => void;
}

/** Accès typé au contexte depuis un descendant : `this.resizable`. */
export const resizableContext = defineComponent({
  inject: ['resizableRoot'],
  computed: {
    resizable(): ResizableContext {
      return (this as unknown as { resizableRoot: ResizableContext }).resizableRoot;
    },
  },
});
