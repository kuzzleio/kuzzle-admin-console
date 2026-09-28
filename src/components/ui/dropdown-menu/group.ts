import type { InjectionKey } from 'vue';

/** Identifiant du libellé d'un `DropdownMenuGroup`, que porte son `DropdownMenuLabel`. */
export const dropdownMenuGroupKey: InjectionKey<string> = Symbol('dropdownMenuGroup');
