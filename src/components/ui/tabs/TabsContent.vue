<template>
  <TabsContent
    :class="cn('min-w-0 flex-1 outline-none [&[hidden]]:hidden', props.class)"
    data-slot="tabs-content"
    v-bind="forwarded"
  >
    <slot />
  </TabsContent>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TabsContent, type TabsContentProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TabsContent de shadcn-vue (ADR-0017, ADR-0054), `role="tabpanel"` relié à
 * son onglet par `reka-ui`.
 *
 * `reka-ui` rend **toujours** l'élément du panneau, et le masque par
 * l'attribut `hidden` quand il est inactif. Sans preflight (ADR-0008), seule
 * la feuille du navigateur applique `[hidden] { display: none }`, et une
 * classe `flex` posée au site d'appel l'emporte : le panneau vide restait
 * affiché, avec ses marges. `[&[hidden]]:hidden` rétablit la règle.
 *
 * `force-mount` de `reka-ui` n'est pas celui de la primitive précédente : il
 * rend le panneau **visible** même inactif. Pour garder un panneau monté et
 * caché, c'est `:unmount-on-hide="false"` sur `Tabs`.
 */
const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>
