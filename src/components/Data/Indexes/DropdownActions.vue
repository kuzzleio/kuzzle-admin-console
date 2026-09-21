<template>
  <span>
    <DropdownMenu v-if="backendMajorVersion !== 1">
      <DropdownMenuTrigger
        :as="Button"
        :aria-label="`Actions on index ${indexName}`"
        data-cy="IndexDropdownAction"
        size="icon"
        variant="outline"
      >
        <i aria-hidden="true" class="fas fa-ellipsis-v" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            data-cy="IndexDropdown-delete"
            :disabled="!canDeleteIndex(indexName)"
            :title="
              !canDeleteIndex(indexName) ? 'Your rights do not allow you to delete this index' : ''
            "
            variant="destructive"
            @select="$emit('delete-index-clicked')"
          >
            Delete index
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </span>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { mapState } from 'pinia';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useKuzzleStore } from '@/stores';

/*
 * Jumeau de `Collections/DropdownAction.vue` (ADR-0012). Deux choses de
 * `b-dropdown` ne sont pas reportées :
 *
 * - la rotation de l'icône à l'ouverture, qui reposait sur la classe `.show`
 *   que bootstrap-vue posait sur le conteneur. Le déclencheur porte désormais
 *   `aria-expanded`, qui dit la même chose à qui ne voit pas l'écran ;
 * - le fond gris de `variant="light"`, remplacé par la variante `outline` du
 *   bouton — la même que le menu des collections, pour que deux menus
 *   identiques se ressemblent enfin.
 */
export default defineComponent({
  name: 'IndexDropdownAction',
  components: {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  },
  props: {
    indexName: {
      required: true,
      type: String,
    },
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      Button: markRaw(Button),
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canDeleteIndex']),
    backendMajorVersion(): number | undefined {
      return this.kuzzleStore.currentEnvironment?.backendMajorVersion;
    },
  },
});
</script>
