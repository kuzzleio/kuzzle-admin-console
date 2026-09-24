import type { Directive } from 'vue';
import JSONFormatter from 'json-formatter-js';

interface JsonFormatterBinding {
  content: unknown;
  open?: boolean;
}

const render = (el: HTMLElement, { content, open }: JsonFormatterBinding) => {
  const html = new JSONFormatter(content, open ? Infinity : 0).render();

  el.innerHTML = '';
  el.appendChild(html);
};

/*
 * `beforeMount` et `updated` et non `bind` et `update` : ce sont les noms
 * Vue 2, que `@vue/compat` traduisait même en `MODE: 3` (G-062). Le typage
 * `Directive` refuse désormais les anciens noms.
 */
const jsonFormatter: Directive<HTMLElement, JsonFormatterBinding> = {
  beforeMount(el, binding) {
    render(el, binding.value);
  },
  updated(el, binding) {
    render(el, binding.value);
  },
};

export default jsonFormatter;
