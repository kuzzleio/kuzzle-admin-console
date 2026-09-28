<template>
  <DropdownMenuGroup :aria-labelledby="labelId" data-slot="dropdown-menu-group" v-bind="props">
    <slot />
  </DropdownMenuGroup>
</template>

<script setup lang="ts">
import { provide, useId } from 'vue';
import { DropdownMenuGroup, type DropdownMenuGroupProps } from 'reka-ui';

import { dropdownMenuGroupKey } from './group';

/*
 * DropdownMenuGroup de shadcn-vue (ADR-0012, ADR-0054).
 *
 * **Un ajout à l'amont** : le groupe se nomme d'après le `DropdownMenuLabel`
 * qu'il contient. `reka-ui` rend un `role="group"` sans nom, et un groupe sans
 * nom n'est pas annoncé comme une section. Le groupe fabrique l'identifiant, le
 * libellé le porte : un site d'appel n'a pas à inventer un identifiant unique.
 */
const props = defineProps<DropdownMenuGroupProps>();

const labelId = useId();
provide(dropdownMenuGroupKey, labelId);
</script>
