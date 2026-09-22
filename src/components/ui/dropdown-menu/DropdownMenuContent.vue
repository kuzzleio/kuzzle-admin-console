<template>
  <div
    v-if="menu.isOpen"
    ref="content"
    :class="classes"
    data-slot="dropdown-menu-content"
    role="menu"
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
import { dropdownMenuContext } from './context';

/*
 * DropdownMenuContent — le panneau (ADR-0012).
 *
 * Le placement — déplacement dans `<body>`, `position: fixed` d'après le
 * rectangle du déclencheur, bascule au-dessus quand le bas manque de place —
 * est dans le mixin `floatingPanel`, partagé avec `Select` (ADR-0014). Ce qui
 * reste ici est ce qui fait un *menu* :
 *
 * - **la navigation au clavier** : flèches, `Début`/`Fin`, `Tab`. `Échap` est
 *   écouté par la racine, sur le document — le focus n'est pas forcément dans
 *   le panneau. Le panneau ne piège pas le focus — un menu n'est pas modal,
 *   `Tab` le ferme et rend la main au reste de la page.
 *
 * Le `z-index` est à 1035, soit **au-dessus** de `Dialog` (1030) et sous la
 * bande modale de Bootstrap (`.modal-backdrop` 1040). Il valait 1020, sur
 * l'idée qu'un menu ouvert derrière une modale ne doit pas passer devant —
 * sauf que le menu ouvert *depuis* une modale est le cas courant, et il était
 * alors invisible. Voir ADR-0018.
 */
const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';

export default defineComponent({
  name: 'DropdownMenuContent',
  mixins: [classMerge, floatingPanel, dropdownMenuContext],
  inheritAttrs: false,
  computed: {
    classes(): string {
      return this.mergeClasses(
        'z-1035 min-w-32 overflow-hidden rounded-md',
        'border border-border bg-popover text-popover-foreground',
        'p-1 shadow-md outline-none',
      );
    },
  },
  watch: {
    'menu.isOpen': {
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
      this.attachPanel(el, (this.menu as unknown as { triggerEl: HTMLElement | null }).triggerEl);
      this.menu.setContent(el);

      const edge = this.menu.pendingFocus;
      this.menu.pendingFocus = null;
      if (edge) {
        this.focusEdge(edge);
        return;
      }
      el.focus();
    },
    teardown(): void {
      this.detachPanel();
      this.menu.setContent(null);
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
      // Depuis le panneau lui-même (`current === -1`), la flèche bas va au
      // premier élément et la flèche haut au dernier.
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
          this.menu.close({ focusTrigger: true });
          break;
      }
    },
  },
});
</script>
