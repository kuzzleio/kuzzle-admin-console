import { defineComponent, type PropType } from 'vue';

/** Écart entre l'ancre et le panneau, en pixels. */
const SIDE_OFFSET = 4;

/**
 * Panneau flottant partagé par `DropdownMenu` et `Select` (ADR-0014).
 *
 * Extrait de `DropdownMenuContent` (ADR-0012), où il avait été écrit la
 * première fois. Les deux primitives posent exactement le même problème : un
 * panneau qui doit sortir de son conteneur — la primitive `Table` enveloppe ses
 * tableaux dans un `overflow-x-auto` (ADR-0011), et un panneau en
 * `position: absolute` sous une cellule y serait tronqué.
 *
 * Le panneau est donc déplacé dans `<body>` à l'ouverture, placé en
 * `position: fixed` d'après le rectangle de l'ancre, replacé au défilement et
 * au redimensionnement, et basculé au-dessus de l'ancre quand le bas manque de
 * place.
 *
 * Le mixin ne rend rien et ne connaît ni les rôles ARIA ni le clavier : ce qui
 * distingue un menu d'une liste déroulante reste dans chaque famille. Il ne
 * s'occupe que de l'endroit où le panneau se trouve.
 *
 * Les deux nœuds sont tenus en `data` comme `triggerEl` l'est dans
 * `DropdownMenu` : Vue 2 n'observe en profondeur que les objets simples, un
 * `HTMLElement` n'en est pas un, et seule la propriété qui le porte devient
 * réactive.
 */
export const floatingPanel = defineComponent({
  props: {
    align: {
      default: 'start',
      type: String as PropType<'start' | 'end'>,
    },
  },
  data() {
    return {
      anchorEl: null as HTMLElement | null,
      panelEl: null as HTMLElement | null,
      panelPosition: { left: 0, minWidth: 0, top: 0 },
    };
  },
  computed: {
    panelStyle(): Record<string, string> {
      return {
        left: `${this.panelPosition.left}px`,
        minWidth: `${this.panelPosition.minWidth}px`,
        position: 'fixed',
        top: `${this.panelPosition.top}px`,
      };
    },
  },
  beforeDestroy() {
    this.detachPanel();
  },
  methods: {
    attachPanel(panel: HTMLElement, anchor: HTMLElement | null): void {
      this.panelEl = panel;
      this.anchorEl = anchor;
      if (panel.parentNode !== document.body) {
        document.body.appendChild(panel);
      }
      this.placePanel();
      // En capture : un défilement dans un conteneur interne ne remonte pas
      // jusqu'à `window` autrement, et le panneau resterait sur place pendant
      // que son ancre s'en va.
      window.addEventListener('scroll', this.placePanel, true);
      window.addEventListener('resize', this.placePanel);
    },
    detachPanel(): void {
      window.removeEventListener('scroll', this.placePanel, true);
      window.removeEventListener('resize', this.placePanel);
      // Le nœud a été sorti de l'arbre que Vue gère visuellement : sans ce
      // retrait, il resterait orphelin dans `<body>` après destruction.
      if (this.panelEl?.parentNode === document.body) {
        document.body.removeChild(this.panelEl);
      }
      this.panelEl = null;
      this.anchorEl = null;
    },
    placePanel(): void {
      const panel = this.panelEl;
      const anchorEl = this.anchorEl;
      if (!panel || !anchorEl) {
        return;
      }
      const anchor = anchorEl.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;

      let left = this.align === 'end' ? anchor.right - width : anchor.left;
      left = Math.max(SIDE_OFFSET, Math.min(left, window.innerWidth - width - SIDE_OFFSET));

      // Bascule au-dessus de l'ancre quand le bas manque de place, et seulement
      // si le haut en a davantage : sinon on déplace le problème.
      const below = anchor.bottom + SIDE_OFFSET;
      const flip = below + height > window.innerHeight && anchor.top - SIDE_OFFSET - height > 0;
      const top = flip ? anchor.top - SIDE_OFFSET - height : below;

      this.panelPosition = { left, minWidth: anchor.width, top };
    },
  },
});
