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
            :as="canEdit ? 'router-link' : 'button'"
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
            @select="$emit('delete-collection-clicked')"
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
      :open.sync="clearOpen"
      :index="indexName"
      :collection="collectionName"
      @clear="$emit('clear')"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import type { RawLocation } from 'vue-router';

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

export default defineComponent({
  name: 'CollectionDropdownAction',
  components: {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    ModalClear,
  },
  props: {
    collectionName: {
      required: true,
      type: String,
    },
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
      Button: Object.freeze(Button),
      clearOpen: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canEditCollection', 'canTruncateCollection']),
    backendMajorVersion(): number | undefined {
      return this.kuzzleStore.currentEnvironment?.backendMajorVersion;
    },
    canEdit(): boolean {
      return this.canEditCollection(this.indexName, this.collectionName);
    },
    canTruncate(): boolean {
      return this.canTruncateCollection(this.indexName, this.collectionName);
    },
    editRoute(): RawLocation {
      return {
        name: 'EditCollection',
        params: { collectionName: this.collectionName, indexName: this.indexName },
      };
    },
  },
});
</script>
