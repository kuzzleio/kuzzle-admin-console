<template>
  <div
    class="CollectionUpdate tw:mx-auto tw:flex tw:h-full tw:w-full tw:max-w-6xl tw:flex-col tw:px-4"
  >
    <div v-if="hasRights" class="tw:flex tw:h-full tw:flex-col">
      <create-or-update
        v-if="index && collection"
        headline="Update collection"
        submit-label="Update"
        :collection="collection.name"
        :index="index.name"
        :mapping="fullMappings"
        :realtime-only="collection.isRealtime()"
        @submit="update"
      />
    </div>
    <div v-else>
      <page-not-allowed />
    </div>
  </div>
</template>
<script>
import { omit } from 'lodash';
import { mapState } from 'pinia';

import PageNotAllowed from '../../Common/PageNotAllowed.vue';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import CreateOrUpdate from './CreateOrUpdate.vue';

export default {
  name: 'CollectionUpdate',
  components: {
    CreateOrUpdate,
    PageNotAllowed,
  },
  props: {
    indexName: { type: String, required: true },
    collectionName: { type: String, required: true },
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      mapping: {},
      realtimeOnly: false,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canEditCollection']),
    hasRights() {
      return this.canEditCollection(this.indexName, this.collectionName);
    },
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
    collection() {
      return this.storageIndexStore.getOneCollection(this.index, this.collectionName);
    },
    fullMappings() {
      const mappings = {
        dynamic: this.collection.dynamic,
        properties: omit(this.collection.mapping, '_kuzzle_info'),
      };

      return mappings;
    },
    loading() {
      return this.storageIndexStore.loadingCollections(this.index.name);
    },
  },
  methods: {
    async update(payload) {
      this.error = '';
      try {
        this.storageIndexStore.updateCollection({
          index: this.index,
          name: payload.name,
          mapping: payload.mapping,
        });

        this.$router.push({
          name: 'Collections',
          params: { indexName: this.index.name },
        });
      } catch (e) {
        this.$log.error(e);
        this.$toast.warning(
          'Ooops! Something went wrong while updating the collection.',
          e.message,
        );
      }
    },
    setError(payload) {
      this.error = payload;
    },
  },
};
</script>
