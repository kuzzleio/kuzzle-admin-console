<template>
  <div :class="classes" data-slot="resizable-panel-group" v-bind="$attrs" v-on="$listeners">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import type { ResizableContext } from './context';

/* Déplacement d'un cran au clavier, en pixels. */
const KEYBOARD_STEP = 16;

/*
 * ResizablePanelGroup — API publique de shadcn-vue (ADR-0021).
 *
 * Remplace `<multipane>` de `vue-multipane`, abandonné. Trois différences avec
 * lui, toutes voulues :
 *
 * - **le groupe ne touche pas au style des panneaux.** `vue-multipane` écrivait
 *   lui-même `width` sur le nœud précédent la poignée ; ici il émet
 *   `resize` avec la nouvelle taille, et le site d'appel décide quoi en faire —
 *   c'est lui qui sait s'il la persiste ;
 * - **la poignée est un `<button role="separator">`**, déplaçable aussi aux
 *   flèches du clavier. Celle de `vue-multipane` était un `<div>` ;
 * - **rien n'est rendu en `position: absolute`** : deux panneaux et une poignée
 *   dans un conteneur `flex`, ce que le navigateur sait faire seul.
 *
 * Le groupe ne gère qu'**une** poignée, entre deux panneaux : c'est tout ce
 * dont la console se sert, sur ses trois emplacements.
 */
export default defineComponent({
  name: 'ResizablePanelGroup',
  mixins: [classMerge],
  inheritAttrs: false,
  provide(): { resizableRoot: ResizableContext } {
    return { resizableRoot: this as unknown as ResizableContext };
  },
  props: {
    direction: {
      default: 'horizontal',
      type: String as PropType<'horizontal' | 'vertical'>,
    },
  },
  data() {
    return {
      dragging: false,
      /* Référence à l'écouteur en cours, pour pouvoir le retirer. */
      onMove: null as ((event: MouseEvent | TouchEvent) => void) | null,
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'flex h-full w-full',
        this.direction === 'vertical' ? 'flex-col' : 'flex-row',
      );
    },
  },
  beforeDestroy() {
    this.stopDrag();
  },
  methods: {
    pointerPosition(event: MouseEvent | TouchEvent): number {
      const point = 'touches' in event ? event.touches[0] : event;
      return this.direction === 'vertical' ? point.clientY : point.clientX;
    },
    startDrag(event: MouseEvent | TouchEvent): void {
      const first = (this.$el as HTMLElement).firstElementChild as HTMLElement | null;

      if (!first) {
        return;
      }

      this.dragging = true;
      const origin = this.pointerPosition(event);
      const size = this.direction === 'vertical' ? first.offsetHeight : first.offsetWidth;

      const onMove = (moveEvent: MouseEvent | TouchEvent): void => {
        const delta = this.pointerPosition(moveEvent) - origin;
        this.$emit('resize', Math.max(0, size + delta));
      };

      this.onMove = onMove;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('mouseup', this.stopDrag);
      window.addEventListener('touchend', this.stopDrag);
    },
    /* Flèches du clavier : le même événement, par pas fixe. */
    stepResize(steps: number): void {
      const first = (this.$el as HTMLElement).firstElementChild as HTMLElement | null;

      if (!first) {
        return;
      }

      const size = this.direction === 'vertical' ? first.offsetHeight : first.offsetWidth;

      this.$emit('resize', Math.max(0, size + steps * KEYBOARD_STEP));
    },
    stopDrag(): void {
      if (this.onMove) {
        window.removeEventListener('mousemove', this.onMove);
        window.removeEventListener('touchmove', this.onMove);
        this.onMove = null;
      }
      window.removeEventListener('mouseup', this.stopDrag);
      window.removeEventListener('touchend', this.stopDrag);

      if (this.dragging) {
        this.dragging = false;
        this.$emit('resize-end');
      }
    },
  },
});
</script>
