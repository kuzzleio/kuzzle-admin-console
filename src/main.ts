import { configureCompat, createApp } from 'vue';
import { createPinia } from 'pinia';

import loggerPlugin, { logger } from './plugins/logger';
import toastPlugin from './plugins/toast';
import 'leaflet/dist/leaflet.css';

import createRoutes from './routes/index';
import { useKuzzleStore } from './stores';

import App from './App.vue';

/*
 * Drapeaux de compatibilité (ADR-0027).
 *
 * `MODE: 2` est posé dans `vite.config.ts` : l'application démarre en
 * comportement Vue 2, et chaque drapeau s'éteint ici quand le code
 * correspondant a été repris. Ce qui est encore absent de cette liste est donc
 * **la dette restante de la phase 3**, et la liste est faite pour grossir
 * jusqu'à ce que `MODE: 3` puisse la remplacer.
 */
configureCompat({
  /*
   * `vm.$listeners` n'existe plus en Vue 3 : les écouteurs posés par le parent
   * arrivent dans `$attrs` sous la forme `onClick`, `onInput`… Les 62
   * primitives de `ui/` écrivaient `v-bind="$attrs" v-on="$listeners"` ; le
   * `v-bind` seul les porte désormais toutes les deux.
   *
   * Le drapeau ne fait pas que retirer `$listeners` : tant qu'il est allumé,
   * `shouldSkipAttr` **exclut** les clés `onX` de `$attrs`. L'éteindre et
   * retirer le `v-on` vont donc ensemble — l'un sans l'autre perd les
   * écouteurs ou les pose deux fois.
   */
  INSTANCE_LISTENERS: false,

  /*
   * `beforeDestroy` et `destroyed` s'appellent `beforeUnmount` et `unmounted`
   * en Vue 3. Le renommage est sans effet de bord : les deux paires désignent
   * le même moment du cycle de vie, seul le nom change — Vue 3 parle de
   * démontage là où Vue 2 parlait de destruction.
   */
  OPTIONS_BEFORE_DESTROY: false,
  OPTIONS_DESTROYED: false,

  /*
   * `Vue.prototype` n'existe plus : `$toast` et `$log` s'installent sur
   * `app.config.globalProperties`, qui appartient à l'application et non au
   * paquet `vue`.
   */
  GLOBAL_PROTOTYPE: false,

  /*
   * `this.$set` n'a plus d'objet : il existait parce que la réactivité de Vue 2
   * reposait sur `Object.defineProperty`, qui ne pouvait pas voir une clé
   * ajoutée après coup ni une case de tableau écrite par son indice. Vue 3
   * observe par `Proxy` et voit les deux. Les 8 appels deviennent des
   * affectations.
   */
  INSTANCE_SET: false,

  /*
   * `:prop.sync` s'écrit `v-model:prop`. Le contrat ne bouge pas — une prop et
   * un `update:<prop>` — seule la syntaxe du site d'appel change, et elle
   * devient celle de l'amont shadcn-vue que les primitives suivent déjà
   * (ADR-0009).
   */
  COMPILER_V_BIND_SYNC: false,

  /*
   * L'option `model` de Vue 2 disparaît : un `v-model` nu signifie désormais
   * `modelValue` + `update:modelValue`, ce que les primitives déclarent déjà
   * (ADR-0009). Les trois composants tiers écrits pour Vue 2 — `vue-color`,
   * `vue-multiselect`, `vuedraggable` — ne peuvent pas suivre : leur contrat
   * `value` / `input` est écrit à la main sur leurs sites d'appel. Voir G-053.
   */
  COMPONENT_V_MODEL: false,
});

Reflect.defineProperty(window, 'kuzzle', {
  get() {
    const kuzzleStore = useKuzzleStore();
    return kuzzleStore.$kuzzle;
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(loggerPlugin);
app.use(toastPlugin);
app.use(createRoutes(logger));

app.mount('#app');
