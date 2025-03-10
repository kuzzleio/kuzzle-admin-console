<template>
  <b-container class="DocumentCreate d-flex flex-column h-100">
    <template v-if="hasRights" class="wrapper">
      <headline> Create a new document </headline>

      <create-or-update
        v-if="index && collection"
        :index="indexName"
        :collection="collectionName"
        :mapping="mappingAttributes"
        :document="newDocument"
        @cancel="onCancel"
        @submit="onSubmit"
        @document-change="onDocumentChange"
      />
    </template>
    <template v-else>
      <page-not-allowed />
    </template>
  </b-container>
</template>

<script>
import get from 'lodash/get';
import omit from 'lodash/omit';
import { mapState } from 'pinia';

import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import CreateOrUpdate from './Common/CreateOrUpdate.vue';

export default {
  name: 'DocumentCreate',
  components: {
    Headline,
    CreateOrUpdate,
    PageNotAllowed,
  },
  props: {
    indexName: String,
    collectionName: String,
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      submitting: false,
      newDocument: {},
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['canCreateDocument']),
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
    collection() {
      return this.storageIndexStore.getOneCollection(this.index, this.collectionName);
    },
    mappingAttributes() {
      return get(this, 'collection.mapping', null)
        ? omit(this.collection.mapping, '_kuzzle_info')
        : null;
    },
    hasRights() {
      return this.canCreateDocument(this.indexName, this.collectionName);
    },
  },
  methods: {
    async onSubmit(document, id) {
      if (!document) {
        this.error = 'The document is invalid, please review it';
        return;
      }

      this.submitting = true;

      try {
        await this.$kuzzle.document.create(this.indexName, this.collectionName, document, id, {
          refresh: 'wait_for',
        });

        await this.fetchCollectionMapping();

        this.$router.push({
          name: 'DocumentList',
          params: {
            indexName: this.indexName,
            collectionName: this.collectionName,
          },
        });
      } catch (err) {
        this.$log.error(err);
        this.$bvToast.toast(err.message, {
          title: 'Ooops! Something went wrong while persisting the document.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
      }
    },
    onCancel() {
      this.$router.push({
        name: 'DocumentList',
        params: { index: this.index, collection: this.collection },
      });
    },
    onDocumentChange(document) {
      this.newDocument = document;
    },
    async fetchCollectionMapping() {
      try {
        await this.storageIndexStore.fetchCollectionMapping({
          index: this.index,
          collection: this.collection,
        });
      } catch (error) {
        this.$log.error(error);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while counting documents in collections.',
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
