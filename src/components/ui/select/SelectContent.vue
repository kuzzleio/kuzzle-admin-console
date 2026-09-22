<template>
  <div
    v-if="isOpen"
    ref="content"
    :class="classes"
    data-slot="select-content"
    role="listbox"
    :style="panelStyle"
    tabindex="-1"
    v-bind="$attrs"
    @keydown="onKeydown"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { classMerge } from '../class-merge';
import { floatingPanel } from '../floating-panel';
import { selectContext } from './context';

/*
 * SelectContent — le panneau de la liste (ADR-0014).
 *
 * Le placement est dans le mixin `floatingPanel`, partagé avec
 * `DropdownMenuContent` (ADR-0012). Ce qui reste ici est ce qui fait une
 * *liste* plutôt qu'un menu :
 *
 * - **l'ouverture pose le focus sur l'option retenue**, pas sur la première :
 *   une liste déroulante s'ouvre là où on l'a laissée. C'est ce que faisait le
 *   `<select>` natif derrière `<b-form-select>`, et le perdre ferait
 *   recommencer la navigation au clavier depuis le haut à chaque ouverture ;
 * - `Échap` est écouté par la racine, sur le document : le focus n'est pas
 *   forcément dans le panneau.
 *
 * Le panneau ne piège pas le focus, pour la même raison que le menu : il n'est
 * pas modal, et `Tab` le ferme en rendant la main au reste de la page.
 *
 * `z-index` à 1035, comme le menu : **au-dessus** de `Dialog` (1030) et sous
 * la bande modale de Bootstrap (`.modal-backdrop` 1040). Il valait 1020
 * jusqu'à ce qu'un `Select` soit monté dans une modale — voir ADR-0018.
 */
const ITEM_SELECTOR = '[role="option"]';

export default defineComponent({
  name: 'SelectContent',
  mixins: [classMerge, floatingPanel, selectContext],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'z-1035 min-w-32 max-h-96 overflow-y-auto rounded-md',
        'border border-border bg-popover text-popover-foreground',
        'p-1 shadow-md outline-none',
      );
    },
    isOpen(): boolean {
      return this.select.isOpen;
    },
  },
  watch: {
    isOpen: {
      immediate: true,
      handler(open: boolean) {
        if (!open) {
          this.teardown();
          return;
        }
        this.$nextTick(() => this.setup());
      },
    },
  },
  beforeDestroy() {
    this.teardown();
  },
  methods: {
    setup(): void {
      const el = this.$refs.content as HTMLElement | undefined;
      if (!el) {
        return;
      }
      this.attachPanel(el, (this.select as unknown as { triggerEl: HTMLElement | null }).triggerEl);
      this.select.setContent(el);

      const items = this.items();
      const selected = items.find((item) => item.getAttribute('aria-selected') === 'true');
      (selected ?? items[0] ?? el).focus();
      // Le placement a été calculé avant que le panneau ne défile sur l'option
      // retenue ; la hauteur n'a pas changé, mais le navigateur peut avoir fait
      // défiler un ancêtre pour amener le focus à l'écran.
      this.placePanel();
    },
    teardown(): void {
      this.detachPanel();
      this.select.setContent(null);
    },
    items(): HTMLElement[] {
      const el = this.$refs.content as HTMLElement | undefined;
      if (!el) {
        return [];
      }
      return Array.from(el.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
        (item) => item.getAttribute('aria-disabled') !== 'true',
      );
    },
    focusEdge(edge: 'first' | 'last'): void {
      const items = this.items();
      const item = edge === 'first' ? items[0] : items[items.length - 1];
      (item ?? (this.$refs.content as HTMLElement | undefined))?.focus();
    },
    move(step: number): void {
      const items = this.items();
      if (items.length === 0) {
        return;
      }
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = current === -1 ? (step > 0 ? 0 : items.length - 1) : current + step;
      items[(next + items.length) % items.length].focus();
    },
    onKeydown(event: KeyboardEvent): void {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.move(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.move(-1);
          break;
        case 'Home':
          event.preventDefault();
          this.focusEdge('first');
          break;
        case 'End':
          event.preventDefault();
          this.focusEdge('last');
          break;
        case 'Tab':
          this.select.close({ focusTrigger: true });
          break;
      }
    },
  },
});
</script>
