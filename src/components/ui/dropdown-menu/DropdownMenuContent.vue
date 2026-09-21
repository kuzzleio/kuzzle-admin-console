<template>
  <div
    v-if="menu.isOpen"
    ref="content"
    :class="classes"
    data-slot="dropdown-menu-content"
    role="menu"
    :style="style"
    tabindex="-1"
    v-bind="$attrs"
    @keydown="onKeydown"
    v-on="$listeners"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

import { classMerge } from '../class-merge';
import { dropdownMenuContext } from './context';

/*
 * DropdownMenuContent — le panneau (ADR-0012).
 *
 * Deux comportements y sont portés pour que les sites d'appel n'aient pas à y
 * penser :
 *
 * - **le déplacement dans `<body>`** : la primitive `Table` enveloppe ses
 *   tableaux dans un `overflow-x-auto` (ADR-0011), et un menu en
 *   `position: absolute` sous une cellule y serait tronqué. Comme il n'est
 *   plus dans le flux, le panneau est placé en `position: fixed` d'après le
 *   rectangle du déclencheur, et replacé au défilement et au
 *   redimensionnement ;
 * - **la navigation au clavier** : flèches, `Début`/`Fin`, `Tab`. `Échap` est
 *   écouté par la racine, sur le document — le focus n'est pas forcément dans
 *   le panneau. Le
 *   panneau ne piège pas le focus — un menu n'est pas modal, `Tab` le ferme et
 *   rend la main au reste de la page.
 *
 * Le `z-index` est à 1020, soit sous `Dialog` (1030) et sous la bande modale de
 * Bootstrap : un menu ouvert derrière une modale ne doit pas passer devant.
 */
const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';

/** Écart entre le déclencheur et le panneau, en pixels. */
const SIDE_OFFSET = 4;

export default defineComponent({
  name: 'DropdownMenuContent',
  mixins: [classMerge, dropdownMenuContext],
  inheritAttrs: false,
  props: {
    align: {
      default: 'start',
      type: String as PropType<'start' | 'end'>,
    },
  },
  data() {
    return {
      position: { left: 0, top: 0, minWidth: 0 },
    };
  },
  computed: {
    classes(): string {
      return this.mergeClasses(
        'tw:z-1020 tw:min-w-32 tw:overflow-hidden tw:rounded-md',
        'tw:border tw:border-border tw:bg-popover tw:text-popover-foreground',
        'tw:p-1 tw:shadow-md tw:outline-none',
      );
    },
    style(): Record<string, string> {
      return {
        left: `${this.position.left}px`,
        minWidth: `${this.position.minWidth}px`,
        position: 'fixed',
        top: `${this.position.top}px`,
      };
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
      if (el.parentNode !== document.body) {
        document.body.appendChild(el);
      }
      this.menu.setContent(el);
      this.place();
      // En capture : un défilement dans un conteneur interne ne remonte pas
      // jusqu'à `window` autrement, et le panneau resterait sur place pendant
      // que son déclencheur s'en va.
      window.addEventListener('scroll', this.place, true);
      window.addEventListener('resize', this.place);

      const edge = this.menu.pendingFocus;
      this.menu.pendingFocus = null;
      if (edge) {
        this.focusEdge(edge);
        return;
      }
      el.focus();
    },
    teardown(): void {
      window.removeEventListener('scroll', this.place, true);
      window.removeEventListener('resize', this.place);
      this.menu.setContent(null);
      // Le nœud a été sorti de l'arbre que Vue gère visuellement : sans ce
      // retrait, il resterait orphelin dans `<body>` après destruction.
      const el = this.$refs.content as HTMLElement | undefined;
      if (el?.parentNode === document.body) {
        document.body.removeChild(el);
      }
    },
    place(): void {
      const el = this.$refs.content as HTMLElement | undefined;
      const trigger = (this.menu as unknown as { triggerEl: HTMLElement | null }).triggerEl;
      if (!el || !trigger) {
        return;
      }
      const anchor = trigger.getBoundingClientRect();
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      let left = this.align === 'end' ? anchor.right - width : anchor.left;
      left = Math.max(SIDE_OFFSET, Math.min(left, window.innerWidth - width - SIDE_OFFSET));

      // Bascule au-dessus du déclencheur quand le bas manque de place, et
      // seulement si le haut en a davantage : sinon on déplace le problème.
      const below = anchor.bottom + SIDE_OFFSET;
      const flip = below + height > window.innerHeight && anchor.top - SIDE_OFFSET - height > 0;
      const top = flip ? anchor.top - SIDE_OFFSET - height : below;

      this.position = { left, minWidth: anchor.width, top };
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
