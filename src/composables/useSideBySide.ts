import type { Ref } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

/*
 * useSideBySide — vrai à partir de `md`, le point de rupture où les panneaux
 * de Data et d'API Action passent côte à côte (G-081).
 *
 * En dessous, les panneaux s'empilent et la poignée n'a plus de sens : elle
 * doit quitter le DOM, pas seulement être cachée, sans quoi `reka-ui` capte
 * encore les appuis sur son rectangle nul (G-099). Les seuils sont ceux de
 * Tailwind, que la console ne redéfinit pas.
 */
export function useSideBySide(): Readonly<Ref<boolean>> {
  return useBreakpoints(breakpointsTailwind).greaterOrEqual('md');
}
