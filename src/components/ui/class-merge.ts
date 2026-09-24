import { defineComponent } from 'vue';
import type { ClassValue } from 'clsx';

import { cn } from '@/lib/utils';

/**
 * Fusionne les classes d'une primitive avec celles posées par le site d'appel.
 *
 * La passer à `cn` est ce qui permet à l'appelant de surcharger une variante
 * (`<Badge class="bg-accent">`) — sans elle, c'est l'ordre dans la feuille de
 * styles qui tranche, pas le site d'appel.
 *
 * En Vue 2, cette classe n'arrivait pas dans `$attrs` : elle se lisait sur le
 * vnode, par `this.$vnode.data.staticClass`. En Vue 3, `$vnode` n'existe plus —
 * c'est une API privée, que seul le drapeau `PRIVATE_APIS` de `@vue/compat`
 * maintenait en vie — et la classe du site d'appel est dans `$attrs` comme
 * n'importe quel attribut (G-059).
 *
 * Vue recopie de son côté cette même classe sur l'élément racine : elle
 * apparaît donc deux fois dans l'attribut `class`. Sans effet — ce qui compte
 * est que la classe *de la variante* en conflit, elle, a bien été retirée.
 *
 * En amont, shadcn-vue fait la même chose avec `props.class` ; le mécanisme
 * diffère, l'API publique non (ADR-0009).
 */
export const classMerge = defineComponent({
  methods: {
    mergeClasses(...base: ClassValue[]): string {
      return cn(...base, this.$attrs.class as ClassValue);
    },
  },
});
