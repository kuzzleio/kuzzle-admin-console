<template>
  <div class="DocumentUpdate mx-auto flex h-full w-full max-w-6xl flex-col px-4">
    <template v-if="hasRights">
      <headline> Edit document </headline>

      <Alert v-if="showAlert" class="mb-4" variant="destructive">
        <b>Warning!</b> This document has been edited while you were editing it. If you save now,
        you will overwrite someone else's modifications.
      </Alert>
      <div v-if="loading" class="mt-12 flex justify-center">
        <Spinner label="Loading the document" size="lg" />
      </div>
      <create-or-update
        v-else
        :id="id"
        :index="indexName"
        :collection="collectionName"
        :document="document"
        :mapping="mappingAttributes"
        @cancel="onCancel"
        @submit="onSubmit"
        @document-change="onDocumentChange"
      />
    </template>
    <template v-else>
      <page-not-allowed />
    </template>
  </div>
</template>

<script>
import get from 'lodash/get';
import omit from 'lodash/omit';
import { mapState } from 'pinia';

import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';

import PageNotAllowed from '@/components/Common/PageNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import CreateOrUpdate from './Common/CreateOrUpdate.vue';

export default {
  name: 'DocumentUpdate',
  components: {
    Alert,
    Headline,
    CreateOrUpdate,
    PageNotAllowed,
    Spinner,
  },
  props: {
    id: { type: String, required: true },
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
      document: {},
      loading: false,
      showAlert: false,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle', 'wrapper']),
    ...mapState(useAuthStore, ['canEditDocument']),
    mappingAttributes() {
      return get(this, 'collection.mapping', null)
        ? omit(this.collection.mapping, '_kuzzle_info')
        : null;
    },
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
    collection() {
      return this.storageIndexStore.getOneCollection(this.index, this.collectionName);
    },
    hasRights() {
      return this.canEditDocument(this.indexName, this.collectionName);
    },
  },
  async mounted() {
    this.fetch();
    this.room = await this.$kuzzle.realtime.subscribe(
      this.indexName,
      this.collectionName,
      { ids: { values: [this.$route.params.id] } },
      () => {
        this.showAlert = true;
      },
    );
  },
  async destroyed() {
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room);
    }
  },
  methods: {
    async onSubmit(document, id, replace = false) {
      this.submitted = true;
      this.error = '';

      if (!document) {
        this.error = 'The document is invalid, please review it';
        return;
      }

      try {
        delete document._id;
        let action = 'update';
        if (replace) {
          action = 'replace';
        }
        await this.$kuzzle.document[action](
          this.indexName,
          this.collectionName,
          this.id,
          document,
          { refresh: 'wait_for' },
        );
        this.$router.push({
          name: 'DocumentList',
          params: { index: this.indexName, collection: this.collectionName },
        });
      } catch (err) {
        this.$log.error(err);
        this.$toast.warning(
          'Ooops! Something went wrong while persisting the document.',
          err.message,
        );
      }
    },
    onCancel() {
      this.$router.push({
        name: 'DocumentList',
        params: { index: this.indexName, collection: this.collectionName },
      });
    },
    onDocumentChange(document) {
      this.document = document;
    },
    async fetch() {
      this.showAlert = false;
      this.loading = true;
      try {
        const res = await this.$kuzzle.document.get(this.indexName, this.collectionName, this.id);
        this.document = omit(res._source, '_kuzzle_info');
        this.loading = false;
      } catch (err) {
        this.$log.error(err);
        this.$toast.warning('Ooops! Something went wrong while loading the document.', err.message);
      }
    },
  },
};
</script>
