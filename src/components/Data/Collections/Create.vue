<template>
  <b-container v-if="index" class="CollectionCreate h-100">
    <create-or-update
      v-if="hasRights"
      headline="Create a new collection"
      submit-label="Create"
      :index="index.name"
      @submit="create"
    />
    <page-not-allowed v-else />
  </b-container>
</template>

<script>
import { mapState } from 'pinia';

import PageNotAllowed from '../../Common/PageNotAllowed.vue';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import CreateOrUpdate from './CreateOrUpdate.vue';

export default {
  name: 'CollectionCreate',
  components: {
    CreateOrUpdate,
    PageNotAllowed,
  },
  props: {
    indexName: String,
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canCreateCollection']),
    hasRights() {
      return this.canCreateCollection(this.index.name);
    },
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
  },
  methods: {
    async create(payload) {
      try {
        await this.storageIndexStore.createCollection({
          index: this.index,
          name: payload.name,
          mapping: payload.mapping,
        });

        this.$router.push({
          name: 'Collections',
          params: { indexName: this.index.name },
        });
      } catch (error) {
        this.$log.error(error);
        this.$bvToast.toast(error.message, {
          title: 'Ooops! Something went wrong while creating the collection.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
      }
    },
  },
};
</script>
