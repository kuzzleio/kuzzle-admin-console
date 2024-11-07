<template>
  <span>
    <b-dropdown
      v-if="backendMajorVersion !== 1"
      :id="`index-${indexName}`"
      data-cy="IndexDropdownAction"
      no-caret
      toggle-class="indexDropdown"
      variant="light"
    >
      <template #button-content>
        <i class="fas fa-ellipsis-v" />
      </template>

      <b-dropdown-group header="Actions">
        <b-dropdown-item
          v-if="backendMajorVersion !== 1"
          data-cy="IndexDropdown-delete"
          :disabled="!canDeleteIndex(indexName)"
          :title="
            !canDeleteIndex(indexName) ? 'Your rights do not allow you to delete this index' : ''
          "
          @click="onDeleteIndexClicked"
        >
          Delete index
        </b-dropdown-item>
      </b-dropdown-group>
    </b-dropdown>
  </span>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore, useKuzzleStore } from '@/stores';

export default {
  name: 'IndexDropdownAction',
  props: {
    indexName: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canDeleteIndex']),
    backendMajorVersion() {
      return this.kuzzleStore.currentEnvironment?.backendMajorVersion;
    },
  },
  methods: {
    onDeleteIndexClicked() {
      this.$emit('delete-index-clicked');
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss';

::v-deep .indexDropdown {
  background-color: variables.$light-grey-color;
  border: none;
}

::v-deep .show .indexDropdown i {
  transform: rotate(90deg);
}
</style>
