<template>
  <div class="DocumentList mb-20">
    <div
      class="mx-auto w-full px-4 transition-[max-width] duration-500"
      :class="listViewType === LIST_VIEW_LIST ? 'max-w-6xl' : 'max-w-full'"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <headline>
          <span class="code" :title="collectionName">{{ truncateName(collectionName, 20) }}</span>
        </headline>

        <div class="flex flex-wrap items-center gap-2">
          <Button
            :as="cannotCreateDocument ? 'button' : 'router-link'"
            data-cy="CreateDocument-btn"
            :disabled="cannotCreateDocument"
            :to="
              cannotCreateDocument
                ? undefined
                : { name: 'CreateDocument', params: { indexName, collectionName } }
            "
          >
            Create New Document
          </Button>

          <!-- Bouton scindé : la partie gauche rafraîchit, la flèche ouvre les
               options. Les deux moitiés sont collées par les rayons plutôt que
               par un composant dédié — c'est le seul de la console. -->
          <div class="inline-flex" data-cy="Refresh-dropdown">
            <Button
              class="rounded-r-none"
              :title="
                autoSync
                  ? 'Documents are updated in real-time'
                  : 'Refresh the list to apply pending changes'
              "
              variant="outline"
              @click="fetchDocuments"
            >
              <i
                aria-hidden="true"
                :class="['fas', 'fa-sync', autoSync ? 'fa-spin' : 'text-muted-foreground']"
                :data-autosync="autoSync ? 'on' : 'off'"
                data-cy="Autosync-icon"
              />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                :as="Button"
                aria-label="Refresh options"
                class="rounded-l-none border-l-0"
                data-cy="Refresh-dropdown--toggle"
                size="icon"
                variant="outline"
              >
                <i aria-hidden="true" class="fa fa-caret-down" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  :checked="autoSync"
                  data-cy="Autosync-toggle"
                  :disabled="!displayRealtimeButton.includes(listViewType)"
                  @update:checked="autoSync = $event"
                >
                  Auto-Sync
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <collection-dropdown-view
            :active-view="listViewType"
            :collection="collectionName"
            :index="indexName"
            :mapping-attributes="mappingAttributes"
            @list="switchListView(LIST_VIEW_LIST)"
            @map="switchListView(LIST_VIEW_MAP)"
            @column="switchListView(LIST_VIEW_COLUMN)"
            @time-series="switchListView(LIST_VIEW_TIME_SERIES)"
          />
          <collection-dropdown-action
            :index-name="indexName"
            :collection-name="collectionName"
            @delete-collection-clicked="showDeleteCollectionModal"
            @clear="afterCollectionClear"
          />
        </div>
      </div>

      <list-not-allowed
        v-if="!canSearchDocument(indexName, collectionName) && index && collection"
      />
      <template v-else>
        <filters
          class="mb-3"
          :available-operands="searchFilterOperands"
          :collection="collectionName"
          :current-filter="currentFilter"
          :index="indexName"
          :mapping-attributes="mappingAttributes"
          @enter-pressed="navigateToDocument"
          @filters-updated="onFiltersUpdated"
          @submit="onFilterSubmit"
        />
        <template v-if="documents.length === 0">
          <div v-if="isFetching" class="mt-10 text-center">
            <Spinner label="Loading documents" />
          </div>
          <template v-else>
            <no-geopoint-field-state v-if="hasGeopoints" />
            <empty-state
              v-else
              :index="indexName"
              :collection="collectionName"
              :has-new-documents="hasNewDocuments"
            />
          </template>
        </template>
        <Card v-else>
          <CardContent>
            <List
              v-if="listViewType === LIST_VIEW_LIST"
              :all-checked="allChecked"
              :auto-sync="autoSync"
              :collection="collectionName"
              :current-page-size="paginationSize"
              :documents="documents"
              :date-fields="dateFields"
              :has-new-documents="hasNewDocuments"
              :index="indexName"
              :is-fetching="isFetching"
              :notifications="notificationsById"
              :selected-documents="selectedDocuments"
              :total-documents="totalDocuments"
              @bulk-delete="onBulkDeleteClicked"
              @change-page-size="changePaginationSize"
              @checkbox-click="toggleSelectDocuments"
              @delete="onDeleteClicked"
              @refresh="onRefresh"
              @toggle-all="onToggleAllClicked"
            />

            <Column
              v-if="listViewType === LIST_VIEW_COLUMN"
              :search-query="searchQuery"
              :all-checked="allChecked"
              :auto-sync="autoSync"
              :current-page-size="paginationSize"
              :collection="collectionName"
              :collection-settings="collectionSettings"
              :documents="documents"
              :has-new-documents="hasNewDocuments"
              :index="indexName"
              :is-fetching="isFetching"
              :mapping="collectionMapping"
              :notifications="notificationsById"
              :selected-documents="selectedDocuments"
              :total-documents="totalDocuments"
              @edit="onEditClicked"
              @delete="onDeleteClicked"
              @bulk-delete="onBulkDeleteClicked"
              @change-page-size="changePaginationSize"
              @checkbox-click="toggleSelectDocuments"
              @settings-updated="onSettingsUpdated"
              @refresh="onRefresh"
              @toggle-all="onToggleAllClicked"
            />

            <TimeSeries
              v-if="listViewType === LIST_VIEW_TIME_SERIES"
              :index="indexName"
              :collection="collectionName"
              :documents="documents"
              :mapping="collectionMapping"
              :current-page-size="paginationSize"
              :total-documents="totalDocuments"
              @change-page-size="changePaginationSize"
              @changeDisplayPagination="changeDisplayPagination"
            />

            <Map
              v-if="listViewType === LIST_VIEW_MAP"
              :selected-geopoint="selectedGeopoint"
              :selected-geoshape="selectedGeoshape"
              :current-page-size="paginationSize"
              :index="indexName"
              :geo-documents="geoDocuments"
              :shapes-documents="shapesDocuments"
              :collection="collectionName"
              :mapping-geopoints="mappingGeopoints"
              :mapping-geoshapes="mappingGeoshapes"
              @change-page-size="changePaginationSize"
              @on-select-geopoint="onSelectGeopoint"
              @on-select-geoshape="onSelectGeoshape"
              @edit="onEditClicked"
              @delete="onDeleteClicked"
            />

            <ListPagination
              v-show="totalDocuments > paginationSize && displayPagination"
              v-model:page="currentPage"
              class="mt-4"
              data-cy="DocumentList-pagination"
              :items-per-page="paginationSize"
              :total="totalDocuments"
            />

            <p
              v-if="totalDocuments > ES_RESULT_WINDOW_LIMIT"
              class="mt-2 text-center text-sm text-muted-foreground"
              data-cy="DocumentList-exceedESLimitMsg"
            >
              Due to limitations imposed by Elasticsearch, you won't be able to browse documents
              beyond {{ ES_RESULT_WINDOW_LIMIT }}.
            </p>
          </CardContent>
        </Card>
      </template>
      <DeleteCollectionModal
        v-model:open="deleteCollectionOpen"
        :index="index"
        :collection="collection"
        @delete-successful="afterDeleteCollection"
      />
      <delete-modal
        v-model:open="deleteModalIsOpen"
        :candidates-for-deletion="candidatesForDeletion"
        :is-loading="deleteModalIsLoading"
        @confirm="onDeleteConfirmed"
        @hide="resetCandidatesForDeletion"
      />
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import debounce from 'lodash/debounce';
import defaults from 'lodash/defaults';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import { mapState } from 'pinia';

import DeleteCollectionModal from '../Collections/DeleteCollectionModal.vue';
import CollectionDropdownAction from '../Collections/DropdownAction.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { flattenObjectMapping } from '@/services/collectionHelper';
import * as filterManager from '@/services/filterManager';
import {
  LIST_VIEW_COLUMN,
  LIST_VIEW_LIST,
  LIST_VIEW_TIME_SERIES,
  LIST_VIEW_MAP,
  loadSettingsForCollection,
  saveSettingsForCollection,
} from '@/services/localSettings';
import { extractAttributesFromMapping } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';

import Filters from '@/components/Common/Filters/Filters.vue';
import ListNotAllowed from '@/components/Common/ListNotAllowed.vue';
import ListPagination from '@/components/Common/ListPagination.vue';
import CollectionDropdownView from '@/components/Data/Collections/DropdownView.vue';
import Headline from '@/components/Materialize/Headline.vue';
import DeleteModal from './DeleteModal.vue';
import EmptyState from './EmptyState.vue';
import NoGeopointFieldState from './NoGeopointFieldState.vue';
import Column from './Views/Column/Column.vue';
import List from './Views/List.vue';
import Map from './Views/Map.vue';
import TimeSeries from './Views/TimeSeries.vue';

/*
 * Plafond de la fenêtre de résultats d'Elasticsearch (`index.max_result_window`).
 *
 * Au-delà, `from + size` est refusé : la barre de pagination continue
 * d'afficher des pages que le backend ne servira pas. Le message qui le dit à
 * l'utilisateur et le seuil qui le déclenche viennent maintenant de la même
 * constante.
 */
const ES_RESULT_WINDOW_LIMIT = 10000;

export default {
  name: 'DocumentsPage',
  components: {
    Button,
    Card,
    CardContent,
    CollectionDropdownView,
    CollectionDropdownAction,
    DeleteCollectionModal,
    DeleteModal,
    Column,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    Map,
    List,
    ListPagination,
    Spinner,
    TimeSeries,
    EmptyState,
    Headline,
    Filters,
    ListNotAllowed,
    NoGeopointFieldState,
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
      ES_RESULT_WINDOW_LIMIT,
      // Le composant passé à `as` n'a pas à être réactif. `markRaw` — que
      // Vue 2.7 fournit — et non `Object.freeze` : Vue met en cache le
      // constructeur sur les options du composant, et un objet gelé le lui
      // interdit (G-032).
      Button: markRaw(Button),
      searchQuery: null,
      subscribeRoomId: null,
      isFetching: false,
      loading: false,
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new filterManager.Filter(),
      collectionSettings: {},
      deleteModalIsOpen: false,
      deleteModalIsLoading: false,
      candidatesForDeletion: [],
      mappingGeopoints: [],
      selectedGeopoint: '',
      currentPage: 1,
      deleteCollectionOpen: false,
      displayPagination: true,
      notificationsById: {},
      newDocumentNotifications: [],
      hasNewDocuments: false,
      mappingGeoshapes: [],
      selectedGeoshape: '',
      handledGeoShapesTypes: ['circle', 'polygon', 'multipolygon'],
      handledNotificationActions: ['create', 'update', 'replace', 'delete'],
      displayRealtimeButton: [
        LIST_VIEW_LIST,
        LIST_VIEW_COLUMN,
        LIST_VIEW_TIME_SERIES,
        LIST_VIEW_MAP,
      ],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper', '$kuzzle']),
    ...mapState(useAuthStore, [
      'canSearchDocument',
      'canCreateDocument',
      'canDeleteDocument',
      'canEditDocument',
    ]),
    documentsIdxById() {
      if (!this.documents) {
        return {};
      }
      const r = {};
      this.documents.forEach((d, idx) => {
        r[d._id] = idx;
      });
      return r;
    },
    listViewType: {
      get: function () {
        if (!this.collectionSettings.listViewType) {
          return LIST_VIEW_LIST;
        }
        return this.collectionSettings.listViewType;
      },
      set: function (value) {
        this.$log.debug(`Setting listViewType to ${value}`);
        this.collectionSettings.listViewType = value;
      },
    },
    autoSync: {
      get: function () {
        if (!this.collectionSettings.autoSync) {
          return false;
        }
        return this.collectionSettings.autoSync;
      },
      set: function (value) {
        this.collectionSettings.autoSync = value;
      },
    },
    hasGeopoints() {
      return this.listViewType === LIST_VIEW_MAP && this.mappingGeopoints.length === 0;
    },
    hasGeoshapes() {
      return this.listViewType === LIST_VIEW_MAP && this.mappingGeoshapes.length === 0;
    },
    shapesDocuments() {
      return this.documents
        .filter((document) => {
          const shape = get(document._source, this.selectedGeoshape);
          return shape ? this.handledGeoShapesTypes.includes(shape.type) : false;
        })
        .map((d) => ({
          _id: d._id,
          content: get(d._source, this.selectedGeoshape),
          source: d._source,
        }));
    },
    geoDocuments() {
      return this.documents
        .filter((document) => {
          const [lat, lng] = this.getCoordinates(document._source);
          const latFloat = parseFloat(lat);
          const lngFloat = parseFloat(lng);

          return !isNaN(latFloat) && !isNaN(lngFloat);
        })
        .map((d) => ({
          coordinates: [get(d._source, this.latFieldPath), get(d._source, this.lngFieldPath)],
          _id: d._id,
          source: d._source,
        }));
    },
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
    collection() {
      return this.index
        ? this.storageIndexStore.getOneCollection(this.index, this.collectionName)
        : null;
    },
    collectionMapping() {
      return this.collection ? this.collection.mapping : null;
    },
    indexOrCollectionNotFound() {
      return !!(!this.index || !this.collection);
    },
    cannotCreateDocument() {
      return (
        this.indexOrCollectionNotFound ||
        !this.canCreateDocument(this.indexName, this.collectionName)
      );
    },
    mappingAttributes() {
      return this.collectionMapping
        ? this.extractAttributesFromMapping(this.collectionMapping)
        : null;
    },
    dateFields() {
      if (!this.collectionMapping) {
        return {};
      }
      return Object.keys(
        pickBy(flattenObjectMapping(this.collectionMapping), (value) => value === 'date'),
      );
    },
    latFieldPath() {
      return `${this.selectedGeopoint}.lat`;
    },
    lngFieldPath() {
      return `${this.selectedGeopoint}.lon`;
    },
    isCollectionGeo() {
      return this.mappingGeopoints.length > 0 || this.mappingGeoshapes > 0;
    },
    isDocumentListFiltered() {
      return this.currentFilter.active !== filterManager.NO_ACTIVE;
    },
    isCollectionEmpty() {
      return !this.isDocumentListFiltered && this.totalDocuments === 0;
    },
    allChecked() {
      if (!this.selectedDocuments || !this.documents) {
        return false;
      }

      return this.selectedDocuments.length === this.documents.length;
    },
    paginationFrom() {
      return parseInt(this.currentFilter.from) || 0;
    },
    paginationSize() {
      return parseInt(this.currentFilter.size) || 25;
    },
    isRealtimeCollection() {
      return this.collection ? this.collection.isRealtime() : false;
    },
  },
  watch: {
    async autoSync(newValue) {
      if (newValue === true) {
        await this.fetchDocuments();
      } else {
        this.resetNotifications();
      }
    },
    currentPage: {
      handler(value) {
        const from = (value - 1) * this.paginationSize;
        this.onFiltersUpdated(
          Object.assign(this.currentFilter, {
            from,
          }),
        );
        this.fetchDocuments();
      },
    },
    collectionName: {
      handler() {
        this.loadAllTheThings();
      },
    },
    indexName: {
      handler() {
        this.loadAllTheThings();
      },
    },
    collectionSettings: {
      deep: true,
      handler() {
        this.saveSettingsForCollection();
        this.setListViewTypeInRoute(this.listViewType);
      },
    },
  },
  async beforeUnmount() {
    await this.unsubscribeFromCurrentDocs();
  },
  created() {
    // Make constants available in the template
    this.LIST_VIEW_COLUMN = LIST_VIEW_COLUMN;
    this.LIST_VIEW_MAP = LIST_VIEW_MAP;
    this.LIST_VIEW_TIME_SERIES = LIST_VIEW_TIME_SERIES;
    this.LIST_VIEW_LIST = LIST_VIEW_LIST;

    this.debouncedFetchDocuments = debounce(this.fetchDocuments, 1000, {
      maxWait: 2500,
    });
  },
  async mounted() {
    await this.loadAllTheThings();
    await this.subscribeToCurrentDocs();

    if (this.paginationFrom) {
      this.setCurrentPage();
    }
  },
  methods: {
    formatMeta(_kuzzle_info) {
      return {
        author: _kuzzle_info.author === '-1' ? 'Anonymous (-1)' : _kuzzle_info.author,
        updater: _kuzzle_info.updater === '-1' ? 'Anonymous (-1)' : _kuzzle_info.updater,
        createdAt: _kuzzle_info.createdAt,
        updatedAt: _kuzzle_info.updatedAt,
      };
    },
    extractAttributesFromMapping,
    truncateName,
    // NOTIFICATIONS
    // =========================================================================
    async unsubscribeFromCurrentDocs() {
      if (this.subscribeRoomId) {
        await this.$kuzzle.realtime.unsubscribe(this.subscribeRoomId);
        this.subscribeRoomId = null;
      }
    },
    async subscribeToCurrentDocs() {
      try {
        await this.unsubscribeFromCurrentDocs();
        const roomId = await this.$kuzzle.realtime.subscribe(
          this.indexName,
          this.collectionName,
          // TODO -- The aim here is to use a Koncorde filter generated by
          // the user. Currently, the filters are all generated to ES DSL so,
          // we'll have a whole tech-story to migrate everything to Koncorde.
          {},
          this.handleNotification,
        );
        this.subscribeRoomId = roomId;
      } catch (error) {
        this.$log.error(error);
      }
    },
    handleNotification(notification) {
      if (!this.handledNotificationActions.includes(notification.action)) {
        return;
      }
      this.addNotification(notification);
      if (this.autoSync) {
        this.applyNotification(notification);
      }
    },
    applyNotification(notification) {
      if (notification.action === 'create') {
        this.newDocumentNotifications.push(notification);
        this.debouncedFetchDocuments();
        return;
      }
      if (isUndefined(this.documentsIdxById[notification.result._id])) {
        return;
      }
      const docIdx = this.documentsIdxById[notification.result._id];
      if (['update', 'replace'].includes(notification.action)) {
        this.documents[docIdx]._source = notification.result._source;
      }
      if (notification.action === 'delete') {
        /*
         * `splice` et non `$delete` : le `$delete` de `@vue/compat` est un
         * `delete target[key]` brut, là où celui de Vue 2 faisait un `splice`
         * sur un tableau. Sur un tableau, `delete` laisse un **trou** —
         * `undefined` à l'index — et le `v-for` rendait ensuite `doc._id` sur
         * cet `undefined` (G-046).
         */
        setTimeout(() => this.documents.splice(docIdx, 1), 500);

        this.debouncedFetchDocuments();
      }
    },
    addNotification(notification) {
      if (notification.action === 'create' && !this.autoSync) {
        this.hasNewDocuments = true;
        return;
      }
      if (isUndefined(this.documentsIdxById[notification.result._id])) {
        return;
      }
      this.notificationsById[notification.result._id] = notification;
    },
    addNewDocumentNotifications() {
      let notification = this.newDocumentNotifications.pop();
      while (notification) {
        this.addNotification(notification);
        notification = this.newDocumentNotifications.pop();
      }
    },
    resetNotifications() {
      this.notificationsById = mapValues(this.documentsIdxById, () => null);
      this.hasNewDocuments = false;
    },
    // VIEW MAP - GEOPOINTS
    // =========================================================================
    getCoordinates(document) {
      return [get(document, this.latFieldPath), get(document, this.lngFieldPath)];
    },
    onSelectGeopoint(selectedGeopoint) {
      this.selectedGeopoint = selectedGeopoint;
    },
    onSelectGeoshape(selectedGeoshape) {
      this.selectedGeoshape = selectedGeoshape;
    },
    listMappingGeopoints(mapping, path = []) {
      let attributes = [];
      for (const [attributeName, { type, properties }] of Object.entries(mapping)) {
        if (properties) {
          if (properties.lat && properties.lon) {
            attributes = attributes.concat(path.concat(attributeName).join('.'));
          }

          attributes = attributes.concat(
            this.listMappingGeopoints(properties, path.concat(attributeName)),
          );
        } else if (type === 'geo_point') {
          attributes = attributes.concat(path.concat(attributeName).join('.'));
        }
      }

      return attributes;
    },
    listMappingGeoshapes(mapping, path = []) {
      let attributes = [];
      for (const [attributeName, { type, properties }] of Object.entries(mapping)) {
        if (properties) {
          attributes = attributes.concat(
            this.listMappingGeoshapes(properties, path.concat(attributeName)),
          );
        } else if (type === 'geo_shape') {
          attributes = attributes.concat(path.concat(attributeName).join('.'));
        }
      }

      return attributes;
    },

    // CREATE
    // =========================================================================
    onCreateClicked() {
      this.$router.push({ name: 'CreateDocument' });
    },

    // DELETE
    // =========================================================================
    async onDeleteConfirmed(documentsToDelete) {
      this.deleteModalIsLoading = true;
      try {
        await this.wrapper.performDeleteDocuments(
          this.indexName,
          this.collectionName,
          documentsToDelete,
        );
        if (!this.autoSync) {
          this.fetchDocuments();
        }
        this.deleteModalIsOpen = false;
        this.resetCandidatesForDeletion();
      } catch (e) {
        this.$log.error(e);
        this.$toast.danger(
          'Ooops! Something went wrong while deleting the document(s).',
          'The complete error has been printed to the console.',
        );
      }
      this.deleteModalIsLoading = false;
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion.splice(0, this.candidatesForDeletion.length);
    },
    onBulkDeleteClicked() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(this.selectedDocuments);
      this.deleteModalIsOpen = true;
    },
    onDeleteClicked(id) {
      this.candidatesForDeletion.push(id);
      this.deleteModalIsOpen = true;
    },
    onEditClicked(id) {
      this.$router.push({
        name: 'UpdateDocument',
        params: { id },
      });
    },

    // DELETE COLLECTION
    // =========================================================================
    showDeleteCollectionModal() {
      this.deleteCollectionOpen = true;
    },
    afterDeleteCollection() {
      this.$router.push({
        name: 'Collections',
        params: { indexName: this.indexName },
      });
    },
    // LIST (FETCH & SEARCH)
    // =========================================================================
    async loadAllTheThings() {
      try {
        this.$emit('start-init');
        this.loadSettingsForCollection();
        this.saveSettingsForCollection();
        this.loadMappingInfo();

        this.currentFilter = filterManager.load(this.indexName, this.collectionName, this.$route);
        filterManager.save(this.currentFilter, this.$router, this.indexName, this.collectionName);
        this.displayPagination = true;
        this.$emit('end-init');
        await this.fetchDocuments();
      } catch (err) {
        this.$log.error(err);
        this.$toast.warning(
          'Ooops! Something went wrong.',
          'The complete error has been printed to console.',
        );
        this.$emit('end-init');
      }
    },
    navigateToDocument() {
      const document = this.documents[0];

      if (!document) {
        return;
      }

      this.$router.push({
        name: 'UpdateDocument',
        params: { id: document._id },
      });
    },
    async onRefresh() {
      await this.fetchDocuments();
    },
    async onFiltersUpdated(newFilters) {
      this.currentFilter = newFilters;
    },
    onFilterSubmit(saveToHistory = true) {
      if (saveToHistory) {
        filterManager.addNewHistoryItemAndSave(
          this.currentFilter,
          this.indexName,
          this.collectionName,
        );
      }
      this.fetchDocuments();
    },
    afterCollectionClear() {
      this.documents = [];
      this.totalDocuments = 0;
      this.currentFilter = new filterManager.Filter();
    },
    async fetchDocuments() {
      this.isFetching = true;
      this.$forceUpdate();
      this.selectedDocuments = [];
      this.notifications = [];

      const pagination = {
        from: this.paginationFrom,
        size: this.paginationSize,
      };

      filterManager.save(this.currentFilter, this.$router, this.indexName, this.collectionName);

      try {
        this.searchQuery = filterManager.toSearchQuery(
          this.currentFilter,
          this.mappingAttributes,
          this.wrapper,
        );

        if (!this.searchQuery) {
          this.searchQuery = {};
        }

        const sorting = filterManager.toSort(this.currentFilter);

        if (this.searchQuery.query) {
          this.searchQuery = this.searchQuery.query;
        }

        this.resetNotifications();

        const res = await this.$kuzzle.document.search(
          this.indexName,
          this.collectionName,
          {
            query: this.searchQuery,
            sort: sorting,
          },
          pagination,
        );

        this.documents = res.hits;
        this.totalDocuments = res.total;

        this.$nextTick(() => this.addNewDocumentNotifications());
      } catch (e) {
        this.$log.error(e);
        if (e.message.includes('failed to create query')) {
          this.$toast.warning(
            'Ooops! Something went wrong while fetching the documents.',
            'Your query is ill-formed. The complete error has been dumped to the console.',
          );
        } else {
          this.$toast.warning(
            'Ooops! Something went wrong while fetching the documents.',
            e.message,
          );
        }
      }
      this.isFetching = false;
    },

    // PAGINATION
    // =========================================================================
    changePaginationSize(size) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          size,
          currentPage: 0,
          from: 0,
        }),
      );
      this.fetchDocuments();
    },
    setCurrentPage() {
      this.currentPage = parseInt(this.paginationFrom / this.paginationSize + 1);
    },

    // SELECT ITEMS
    // =========================================================================
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedDocuments = [];
        return;
      }
      this.selectedDocuments = [];
      this.selectedDocuments = this.documents.map((document) => document._id);
    },
    toggleSelectDocuments(id) {
      const index = this.selectedDocuments.indexOf(id);

      if (index === -1) {
        this.selectedDocuments.push(id);
        return;
      }

      this.selectedDocuments.splice(index, 1);
    },

    // LIST VIEW TYPES
    // =========================================================================
    switchListView(listViewType) {
      this.listViewType = listViewType;
    },
    setListViewTypeInRoute(listViewType) {
      /*
       * Passe par `pushQuery` pour ne pas écraser le filtre : les deux
       * écritures reconstruisent la query entière, et `vue-router` 4 les
       * applique de façon asynchrone (G-042).
       */
      filterManager.pushQuery(this.$router, (query) =>
        query.listViewType === listViewType ? query : { ...query, listViewType },
      );
    },
    // Collection Metadata management
    // =========================================================================
    loadSettingsForCollection() {
      this.collectionSettings = defaults(
        {
          listViewType: this.$route.query.listViewType,
        },
        loadSettingsForCollection(this.indexName, this.collectionName),
      );
    },
    saveSettingsForCollection() {
      this.$log.debug('saveSettingsForCollection');
      return saveSettingsForCollection(
        this.indexName,
        this.collectionName,
        this.collectionSettings,
      );
    },
    onSettingsUpdated(newSettings) {
      this.collectionSettings = newSettings;
    },
    loadMappingInfo() {
      this.mappingGeopoints = this.listMappingGeopoints(this.collectionMapping);
      this.mappingGeoshapes = this.listMappingGeoshapes(this.collectionMapping);
      if (this.mappingGeopoints.length) {
        this.selectedGeopoint = this.mappingGeopoints[0];
      }
      if (this.mappingGeoshapes.length) {
        this.selectedGeoshape = this.mappingGeoshapes[0];
      }
    },
    changeDisplayPagination(value) {
      this.displayPagination = value;
    },
  },
};
</script>
