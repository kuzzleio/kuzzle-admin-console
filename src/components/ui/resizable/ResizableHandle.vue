<template>
  <button
    :aria-label="label"
    :aria-orientation="resizable.direction === 'vertical' ? 'horizontal' : 'vertical'"
    :class="classes"
    data-slot="resizable-handle"
    role="separator"
    tabindex="0"
    type="button"
    v-bind="$attrs"
    @mousedown.prevent="resizable.startDrag($event)"
    @touchstart.prevent="resizable.startDrag($event)"
    @keydown.left.prevent="resizable.stepResize(-1)"
    @keydown.up.prevent="resizable.stepResize(-1)"
    @keydown.right.prevent="resizable.stepResize(1)"
    @keydown.down.prevent="resizable.stepResize(1)"
  >
    <span aria-hidden="true" :class="gripClasses" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { resizableContext } from './context';

/*
 * ResizableHandle — API publique de shadcn-vue (ADR-0021).
 *
 * `role="separator"` avec `aria-orientation`, et un vrai `<button>` : la
 * poignée de `vue-multipane` était un `<div>` sans rôle ni focus, donc
 * invisible pour qui n'utilise pas la souris.
 *
 * Sans preflight (ADR-0008), un `<button>` garde la bordure et le fond du
 * navigateur : les deux sont retirés explicitement (G-021).
 */
export default defineComponent({
  name: 'ResizableHandle',
  mixins: [classMerge, resizableContext],
  inheritAttrs: false,
  props: {
    label: {
      default: 'Resize the panels',
      type: String,
    },
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:appearance-none tw:border-0 tw:p-0',
        'tw:relative tw:flex tw:shrink-0 tw:items-center tw:justify-center',
        'tw:bg-border tw:transition-colors tw:hover:bg-muted-foreground',
        'tw:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-ring',
        this.resizable.direction === 'vertical'
          ? 'tw:h-1.5 tw:w-full tw:cursor-row-resize'
          : 'tw:h-full tw:w-1.5 tw:cursor-col-resize',
        this.resizable.dragging ? 'tw:bg-muted-foreground' : '',
      );
    },
    gripClasses(): string {
      return this.resizable.direction === 'vertical'
        ? 'tw:h-0.5 tw:w-8 tw:rounded-full tw:bg-background/70'
        : 'tw:h-8 tw:w-0.5 tw:rounded-full tw:bg-background/70';
    },
  },
});
</script>
