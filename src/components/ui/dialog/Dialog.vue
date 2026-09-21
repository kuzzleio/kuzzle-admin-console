<template>
  <div
    v-if="open"
    class="tw:fixed tw:inset-0 tw:z-1030 tw:flex tw:items-start tw:justify-center tw:overflow-y-auto tw:p-4 tw:sm:p-6"
  >
    <!-- Fond assombri. `aria-hidden` : il double la touche Échap et le bouton
         de fermeture, il n'ajoute rien pour un lecteur d'écran. -->
    <div
      aria-hidden="true"
      class="tw:fixed tw:inset-0 tw:bg-foreground/50"
      @click="requestClose('overlay')"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/*
 * Dialog — racine, API publique de shadcn-vue (ADR-0010).
 *
 * L'état d'ouverture appartient au composant appelant : `:open` et
 * `@update:open`, pas un registre global indexé par chaîne comme `$bvModal`.
 * `v-model` fonctionne grâce à l'option `model` de Vue 2 (G-012).
 *
 * Trois choses que la primitive porte pour que les sites d'appel n'aient pas à
 * y penser :
 *
 * - **le déplacement dans `<body>`** : Vue 2.7 n'a pas de `<Teleport>`, et une
 *   modale rendue en place est prisonnière du premier ancêtre `transform` ou
 *   `overflow: hidden`. Le nœud est retiré avant destruction, sans quoi il
 *   resterait orphelin dans le DOM ;
 * - **le blocage du défilement du fond** ;
 * - **la touche Échap**.
 *
 * Le `z-index` est à 1030, soit **sous** la bande modale de Bootstrap
 * (`.modal-backdrop` 1040, `.modal` 1050) et au-dessus de tout le reste de la
 * console. Tant que les deux familles de modales cohabitent, une `b-modal`
 * ouverte par-dessus un `Dialog` doit gagner — c'est le cas de l'écran
 * « session expirée », qui peut surgir sur n'importe quel écran (G-019). Mettre
 * les deux à 1050 laisse l'ordre dans le DOM trancher, et le `Dialog`, déplacé
 * en fin de `<body>` à l'ouverture, gagnait toujours. La valeur remonte quand
 * bootstrap-vue s'en va.
 *
 * Le piège de focus, lui, est dans `DialogContent` : c'est lui qui connaît les
 * éléments focalisables.
 */
export default defineComponent({
  name: 'Dialog',
  provide(): { dialog: { requestClose: (reason: string) => void } } {
    return {
      dialog: {
        requestClose: (reason: string) => this.requestClose(reason),
      },
    };
  },
  model: {
    event: 'update:open',
    prop: 'open',
  },
  props: {
    // Une modale de confirmation destructrice ne doit pas se fermer sur un clic
    // à côté : le geste est trop facile à faire par accident.
    dismissible: {
      default: true,
      type: Boolean,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  watch: {
    open: {
      immediate: true,
      handler(open: boolean) {
        this.$nextTick(() => {
          this.syncBodyState(open);
        });
      },
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown);
    this.releaseBody();
  },
  methods: {
    onKeydown(event: KeyboardEvent): void {
      if (this.open && event.key === 'Escape') {
        this.requestClose('escape');
      }
    },
    requestClose(reason: string): void {
      if (reason === 'overlay' && !this.dismissible) {
        return;
      }
      this.$emit('update:open', false);
    },
    syncBodyState(open: boolean): void {
      if (open) {
        if (this.$el instanceof HTMLElement && this.$el.parentNode !== document.body) {
          document.body.appendChild(this.$el);
        }
        document.body.style.overflow = 'hidden';
        return;
      }
      this.releaseBody();
    },
    releaseBody(): void {
      document.body.style.overflow = '';
      if (this.$el instanceof HTMLElement && this.$el.parentNode === document.body) {
        document.body.removeChild(this.$el);
      }
    },
  },
});
</script>
