import { defineComponent } from 'vue';
import type { ClassValue } from 'clsx';

import { cn } from '@/lib/utils';

/**
 * Fusionne les classes d'une primitive avec celles posées par le site d'appel.
 *
 * En Vue 2, la classe écrite sur un composant n'arrive pas dans `$attrs` : elle
 * est lue sur le vnode. La passer à `cn` est ce qui permet à l'appelant de
 * surcharger une variante (`<Badge class="tw:bg-accent">`) — sans elle, c'est
 * l'ordre dans la feuille de styles qui tranche, pas le site d'appel.
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
      return cn(...base, this.$vnode?.data?.staticClass, this.$vnode?.data?.class as ClassValue);
    },
  },
});
