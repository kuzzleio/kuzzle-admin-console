<template>
  <b-container class="CollectionUpdate h-100">
    <div v-if="hasRights" class="h-100">
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
  </b-container>
</template>
<script>
import { omit } from 'lodash';
import { mapGetters } from 'vuex';

import PageNotAllowed from '../../Common/PageNotAllowed.vue';
import { KIndexActionsTypes, KIndexGettersTypes, StoreNamespaceTypes } from '@/store';

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
  data() {
    return {
      mapping: {},
      realtimeOnly: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['canEditCollection']),
    hasRights() {
      return this.canEditCollection(this.indexName, this.collectionName);
    },
    index() {
      return this.$store.getters[
        `${StoreNamespaceTypes.INDEX}/${KIndexGettersTypes.GET_ONE_INDEX}`
      ](this.indexName);
    },
    collection() {
      return this.$store.getters[
        `${StoreNamespaceTypes.INDEX}/${KIndexGettersTypes.GET_ONE_COLLECTION}`
      ](this.index, this.collectionName);
    },
    fullMappings() {
      const mappings = {
        dynamic: this.collection.dynamic,
        properties: omit(this.collection.mapping, '_kuzzle_info'),
      };

      return mappings;
    },
    loading() {
      return this.$store.getters[
        `${StoreNamespaceTypes.INDEX}/${KIndexGettersTypes.LOADING_COLLECTIONS}`
      ](this.index.name);
    },
  },
  methods: {
    async update(payload) {
      this.error = '';
      try {
        this.$store.dispatch(
          `${StoreNamespaceTypes.INDEX}/${KIndexActionsTypes.UPDATE_COLLECTION}`,
          {
            index: this.index,
            name: payload.name,
            mapping: payload.mapping,
          },
        );
        this.$router.push({
          name: 'Collections',
          params: { indexName: this.index.name },
        });
      } catch (e) {
        this.$log.error(e);
        this.$bvToast.toast(e.message, {
          title: 'Ooops! Something went wrong while updating the collection.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
      }
    },
    setError(payload) {
      this.error = payload;
    },
  },
};
</script>
