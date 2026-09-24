import { nextTick, type Directive } from 'vue';

/*
 * Hook `mounted` et non `bind` : `bind` est le nom Vue 2. `@vue/compat` le
 * traduisait même en `MODE: 3` — `CUSTOM_DIR` est le seul drapeau que `MODE`
 * n'éteint pas vraiment (G-062). Le typage `Directive` refuse désormais les
 * anciens noms.
 */
const focus: Directive<HTMLElement> = {
  mounted(el) {
    nextTick(() => {
      if (el) {
        el.focus();
      }
    });
  },
};

export default focus;
