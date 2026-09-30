<template>
  <span>
    <DropdownMenu>
      <DropdownMenuTrigger
        :as="Button"
        :aria-label="`Actions on collection ${collectionName}`"
        data-cy="CollectionDropdownAction"
        size="icon"
        variant="outline"
      >
        <i aria-hidden="true" class="fas fa-ellipsis-v" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            :as="canEdit ? RouterLink : 'button'"
            data-cy="CollectionDropdown-edit"
            :disabled="!canEdit"
            :title="canEdit ? '' : 'Your rights do not allow you to edit this collection'"
            :to="canEdit ? editRoute : undefined"
          >
            Edit collection
          </DropdownMenuItem>

          <DropdownMenuItem
            v-if="backendMajorVersion !== 1"
            data-cy="CollectionDropdown-delete"
            variant="destructive"
            @select="emit('delete-collection-clicked')"
          >
            Delete collection
          </DropdownMenuItem>

          <DropdownMenuItem
            data-cy="CollectionDropdown-clear"
            :disabled="!canTruncate"
            :title="canTruncate ? '' : 'Your rights do not allow you to truncate this collection'"
            @select="clearOpen = true"
          >
            Clear documents
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <modal-clear
      v-model:open="clearOpen"
      :index="indexName"
      :collection="collectionName"
      @clear="emit('clear')"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

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

import ModalClear from './ModalClear.vue';

const props = defineProps<{
  collectionName: string;
  indexName: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'delete-collection-clicked'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();

const clearOpen = ref(false);

const backendMajorVersion = computed(
  (): number | undefined => kuzzleStore.currentEnvironment?.backendMajorVersion,
);

const canEdit = computed((): boolean =>
  authStore.canEditCollection(props.indexName, props.collectionName),
);

const canTruncate = computed((): boolean =>
  authStore.canTruncateCollection(props.indexName, props.collectionName),
);

const editRoute = computed(
  (): RouteLocationRaw => ({
    name: 'EditCollection',
    params: { collectionName: props.collectionName, indexName: props.indexName },
  }),
);
</script>
