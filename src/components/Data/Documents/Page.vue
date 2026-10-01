<template>
  <div class="DocumentList mb-20">
    <div
      class="mx-auto w-full px-4 transition-[max-width] duration-500 motion-reduce:transition-none"
      :class="listViewType === LIST_VIEW_LIST ? 'max-w-6xl' : 'max-w-full'"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <headline>
          <span class="code" :title="collectionName">{{ truncateName(collectionName, 20) }}</span>
        </headline>

        <div class="flex flex-wrap items-center gap-2">
          <Button
            :as="cannotCreateDocument ? 'button' : RouterLink"
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
                  :model-value="autoSync"
                  data-cy="Autosync-toggle"
                  :disabled="!displayRealtimeButton.includes(listViewType)"
                  @update:model-value="autoSync = $event === true"
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
        v-if="!authStore.canSearchDocument(indexName, collectionName) && index && collection"
      />
      <template v-else>
        <filters
          class="mb-3"
          :available-operands="searchFilterOperands"
          :collection="collectionName"
          :current-filter="currentFilter"
          :index="indexName"
          :mapping-attributes="mappingAttributes"
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
        <Card v-else class="shadow-signature">
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

            <MapView
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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { DocumentNotification as SdkDocumentNotification } from 'kuzzle-sdk';
import type { LatLngTuple } from 'leaflet';
import debounce from 'lodash/debounce';
import defaults from 'lodash/defaults';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import { RouterLink, useRouter } from 'vue-router';

import DeleteCollectionModal from '../Collections/DeleteCollectionModal.vue';
import CollectionDropdownAction from '../Collections/DropdownAction.vue';
import type { SearchFilter } from '@/components/Common/Filters/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { flattenObjectMapping } from '@/services/collectionHelper';
import * as filterManager from '@/services/filterManager';
import {
  type CollectionSettings,
  type ListViewType,
  LIST_VIEW_COLUMN,
  LIST_VIEW_LIST,
  LIST_VIEW_TIME_SERIES,
  LIST_VIEW_MAP,
  loadSettingsForCollection as loadStoredSettings,
  saveSettingsForCollection as saveStoredSettings,
} from '@/services/localSettings';
import { extractAttributesFromMapping, type MappingAttributes } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';
import type {
  DocumentNotification,
  GeoDocument,
  GeoShape,
  KuzzleDocument,
  ShapeDocument,
} from './types';

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
import MapView from './Views/Map.vue';
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

/* Un champ du mapping, pour ce que la recherche des champs géographiques en lit. */
interface MappingField {
  properties?: Record<string, MappingField> & { lat?: unknown; lon?: unknown };
  type?: string;
}

const handledGeoShapesTypes = ['circle', 'polygon', 'multipolygon'];
const handledNotificationActions = ['create', 'update', 'replace', 'delete'];
const displayRealtimeButton: string[] = [
  LIST_VIEW_LIST,
  LIST_VIEW_COLUMN,
  LIST_VIEW_TIME_SERIES,
  LIST_VIEW_MAP,
];
const searchFilterOperands = filterManager.searchFilterOperands;

const props = defineProps<{
  collectionName: string;
  indexName: string;
}>();

// `Data/Layout.vue` affiche son chargement entre les deux.
const emit = defineEmits<{
  (e: 'end-init'): void;
  (e: 'start-init'): void;
}>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const storageIndexStore = useStorageIndexStore();

const searchQuery = ref<Record<string, unknown> | null>(null);
const isFetching = ref(false);
const selectedDocuments = ref<string[]>([]);
const documents = ref<KuzzleDocument[]>([]);
const totalDocuments = ref(0);
const currentFilter = ref<SearchFilter>(new filterManager.Filter());
const collectionSettings = ref<CollectionSettings>({});
const deleteModalIsOpen = ref(false);
const deleteModalIsLoading = ref(false);
const candidatesForDeletion = ref<string[]>([]);
const mappingGeopoints = ref<string[]>([]);
const selectedGeopoint = ref('');
const currentPage = ref(1);
const deleteCollectionOpen = ref(false);
const displayPagination = ref(true);
const notificationsById = ref<Record<string, DocumentNotification | undefined>>({});
const newDocumentNotifications: SdkDocumentNotification[] = [];
const hasNewDocuments = ref(false);
const mappingGeoshapes = ref<string[]>([]);
const selectedGeoshape = ref('');

// L'identifiant de la souscription n'est pas affiché : il n'a pas à être réactif.
let subscribeRoomId: string | null = null;

const documentsIdxById = computed((): Record<string, number> => {
  const r: Record<string, number> = {};
  documents.value.forEach((d, idx) => {
    r[d._id] = idx;
  });
  return r;
});

const listViewType = computed({
  get(): string {
    if (!collectionSettings.value.listViewType) {
      return LIST_VIEW_LIST;
    }
    return collectionSettings.value.listViewType;
  },
  set(value: string) {
    logger.debug(`Setting listViewType to ${value}`);
    collectionSettings.value.listViewType = value as ListViewType;
  },
});

const autoSync = computed({
  get(): boolean {
    if (!collectionSettings.value.autoSync) {
      return false;
    }
    return collectionSettings.value.autoSync;
  },
  set(value: boolean) {
    collectionSettings.value.autoSync = value;
  },
});

const hasGeopoints = computed(
  (): boolean => listViewType.value === LIST_VIEW_MAP && mappingGeopoints.value.length === 0,
);

const shapesDocuments = computed((): ShapeDocument[] =>
  documents.value
    .filter((document) => {
      const shape = get(document._source, selectedGeoshape.value) as { type?: string } | undefined;
      return shape ? handledGeoShapesTypes.includes(shape.type as string) : false;
    })
    .map((d) => ({
      _id: d._id,
      content: get(d._source, selectedGeoshape.value) as GeoShape,
      source: d._source,
    })),
);

const latFieldPath = computed((): string => `${selectedGeopoint.value}.lat`);

const lngFieldPath = computed((): string => `${selectedGeopoint.value}.lon`);

const geoDocuments = computed((): GeoDocument[] =>
  documents.value
    .filter((document) => {
      const [lat, lng] = getCoordinates(document._source);
      const latFloat = parseFloat(lat as string);
      const lngFloat = parseFloat(lng as string);

      return !isNaN(latFloat) && !isNaN(lngFloat);
    })
    .map((d) => ({
      // Les valeurs du document, telles quelles : `parseFloat` n'a servi qu'au filtre.
      coordinates: getCoordinates(d._source) as LatLngTuple,
      _id: d._id,
      source: d._source,
    })),
);

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collection = computed(() =>
  index.value ? storageIndexStore.getOneCollection(index.value, props.collectionName) : null,
);

/*
 * `undefined` et non plus `null` sans collection : les vues ne sont rendues
 * qu'avec des documents, donc avec une collection, et les autres lecteurs
 * testent seulement la présence du mapping.
 */
const collectionMapping = computed(() => collection.value?.mapping);

const indexOrCollectionNotFound = computed((): boolean => !index.value || !collection.value);

const cannotCreateDocument = computed(
  (): boolean =>
    indexOrCollectionNotFound.value ||
    !authStore.canCreateDocument(props.indexName, props.collectionName),
);

/*
 * `{}` sans mapping, et non plus `null` : `BasicFilter` fait un `Object.keys`
 * dessus, et `DropdownView` le ramenait déjà à `{}`.
 */
const mappingAttributes = computed(
  (): MappingAttributes => extractAttributesFromMapping(collectionMapping.value),
);

/*
 * Un tableau vide sans mapping, et non plus `{}` : `DocumentListItem` fait un
 * `forEach` dessus, qu'un objet n'a pas.
 */
const dateFields = computed((): string[] => {
  if (!collectionMapping.value) {
    return [];
  }
  return Object.keys(
    pickBy(flattenObjectMapping(collectionMapping.value), (value) => value === 'date'),
  );
});

const allChecked = computed(
  (): boolean => selectedDocuments.value.length === documents.value.length,
);

const paginationFrom = computed((): number => parseInt(String(currentFilter.value.from)) || 0);

const paginationSize = computed((): number => parseInt(String(currentFilter.value.size)) || 25);

const debouncedFetchDocuments = debounce(() => fetchDocuments(), 1000, {
  maxWait: 2500,
});

watch(autoSync, async (newValue) => {
  if (newValue === true) {
    await fetchDocuments();
  } else {
    resetNotifications();
  }
});

watch(currentPage, (value) => {
  const from = (value - 1) * paginationSize.value;
  onFiltersUpdated(
    Object.assign(currentFilter.value, {
      from,
    }),
  );
  fetchDocuments();
});

// Deux watchers, comme avant : changer l'index et la collection recharge deux fois.
watch(
  () => props.collectionName,
  () => {
    loadAllTheThings();
  },
);

watch(
  () => props.indexName,
  () => {
    loadAllTheThings();
  },
);

watch(
  collectionSettings,
  () => {
    saveSettingsForCollection();
    setListViewTypeInRoute(listViewType.value);
  },
  { deep: true },
);

onBeforeUnmount(async () => {
  await unsubscribeFromCurrentDocs();
});

onMounted(async () => {
  await loadAllTheThings();
  await subscribeToCurrentDocs();

  if (paginationFrom.value) {
    setCurrentPage();
  }
});

/* Le SDK de la connexion courante. Appelé dans un `try` : son absence y est
   une erreur comme une autre. */
function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

/*
 * L'index d'un document notifié dans la page. Un message temps réel n'a pas
 * d'`_id` : il n'en désigne aucun.
 */
function notifiedDocumentIdx(notification: SdkDocumentNotification): number | undefined {
  const id = notification.result._id;
  return id === null ? undefined : documentsIdxById.value[id];
}

// NOTIFICATIONS
// =========================================================================
async function unsubscribeFromCurrentDocs(): Promise<void> {
  if (subscribeRoomId) {
    await sdk().realtime.unsubscribe(subscribeRoomId);
    subscribeRoomId = null;
  }
}

async function subscribeToCurrentDocs(): Promise<void> {
  try {
    await unsubscribeFromCurrentDocs();
    const roomId = await sdk().realtime.subscribe(
      props.indexName,
      props.collectionName,
      // TODO -- The aim here is to use a Koncorde filter generated by
      // the user. Currently, the filters are all generated to ES DSL so,
      // we'll have a whole tech-story to migrate everything to Koncorde.
      {},
      (notification) => handleNotification(notification as SdkDocumentNotification),
    );
    subscribeRoomId = roomId;
  } catch (error) {
    logger.error(error);
  }
}

function handleNotification(notification: SdkDocumentNotification): void {
  if (!handledNotificationActions.includes(notification.action)) {
    return;
  }
  addNotification(notification);
  if (autoSync.value) {
    applyNotification(notification);
  }
}

function applyNotification(notification: SdkDocumentNotification): void {
  if (notification.action === 'create') {
    newDocumentNotifications.push(notification);
    debouncedFetchDocuments();
    return;
  }
  const docIdx = notifiedDocumentIdx(notification);
  if (docIdx === undefined) {
    return;
  }
  if (['update', 'replace'].includes(notification.action)) {
    documents.value[docIdx]._source = notification.result._source;
  }
  if (notification.action === 'delete') {
    /*
     * `splice` et non `$delete` : le `$delete` de `@vue/compat` est un
     * `delete target[key]` brut, là où celui de Vue 2 faisait un `splice`
     * sur un tableau. Sur un tableau, `delete` laisse un **trou** —
     * `undefined` à l'index — et le `v-for` rendait ensuite `doc._id` sur
     * cet `undefined` (G-046).
     */
    setTimeout(() => documents.value.splice(docIdx, 1), 500);

    debouncedFetchDocuments();
  }
}

function addNotification(notification: SdkDocumentNotification): void {
  if (notification.action === 'create' && !autoSync.value) {
    hasNewDocuments.value = true;
    return;
  }
  const id = notification.result._id;
  if (id === null || isUndefined(documentsIdxById.value[id])) {
    return;
  }
  notificationsById.value[id] = notification;
}

function addNewDocumentNotifications(): void {
  let notification = newDocumentNotifications.pop();
  while (notification) {
    addNotification(notification);
    notification = newDocumentNotifications.pop();
  }
}

// `undefined` et non plus `null` : les vues ne testent que la présence.
function resetNotifications(): void {
  notificationsById.value = mapValues(documentsIdxById.value, () => undefined);
  hasNewDocuments.value = false;
}

// VIEW MAP - GEOPOINTS
// =========================================================================
function getCoordinates(document: Record<string, unknown>): [unknown, unknown] {
  return [get(document, latFieldPath.value), get(document, lngFieldPath.value)];
}

function onSelectGeopoint(geopoint: string): void {
  selectedGeopoint.value = geopoint;
}

function onSelectGeoshape(geoshape: string): void {
  selectedGeoshape.value = geoshape;
}

function listMappingGeopoints(
  mapping: Record<string, MappingField>,
  path: string[] = [],
): string[] {
  let attributes: string[] = [];
  for (const [attributeName, { type, properties }] of Object.entries(mapping)) {
    if (properties) {
      if (properties.lat && properties.lon) {
        attributes = attributes.concat(path.concat(attributeName).join('.'));
      }

      attributes = attributes.concat(listMappingGeopoints(properties, path.concat(attributeName)));
    } else if (type === 'geo_point') {
      attributes = attributes.concat(path.concat(attributeName).join('.'));
    }
  }

  return attributes;
}

function listMappingGeoshapes(
  mapping: Record<string, MappingField>,
  path: string[] = [],
): string[] {
  let attributes: string[] = [];
  for (const [attributeName, { type, properties }] of Object.entries(mapping)) {
    if (properties) {
      attributes = attributes.concat(listMappingGeoshapes(properties, path.concat(attributeName)));
    } else if (type === 'geo_shape') {
      attributes = attributes.concat(path.concat(attributeName).join('.'));
    }
  }

  return attributes;
}

// DELETE
// =========================================================================
async function onDeleteConfirmed(documentsToDelete: string[]): Promise<void> {
  deleteModalIsLoading.value = true;
  try {
    const wrapper = kuzzleStore.wrapper;
    if (!wrapper) {
      throw new Error('No Kuzzle wrapper for the current environment');
    }
    await wrapper.performDeleteDocuments(props.indexName, props.collectionName, documentsToDelete);
    if (!autoSync.value) {
      fetchDocuments();
    }
    deleteModalIsOpen.value = false;
    resetCandidatesForDeletion();
  } catch (e) {
    logger.error(e);
    toast.danger(
      'Ooops! Something went wrong while deleting the document(s).',
      'The complete error has been printed to the console.',
    );
  }
  deleteModalIsLoading.value = false;
}

function resetCandidatesForDeletion(): void {
  candidatesForDeletion.value.splice(0, candidatesForDeletion.value.length);
}

function onBulkDeleteClicked(): void {
  candidatesForDeletion.value = candidatesForDeletion.value.concat(selectedDocuments.value);
  deleteModalIsOpen.value = true;
}

function onDeleteClicked(id: string): void {
  candidatesForDeletion.value.push(id);
  deleteModalIsOpen.value = true;
}

function onEditClicked(id: string): void {
  router.push({
    name: 'UpdateDocument',
    params: { id },
  });
}

// DELETE COLLECTION
// =========================================================================
function showDeleteCollectionModal(): void {
  deleteCollectionOpen.value = true;
}

function afterDeleteCollection(): void {
  router.push({
    name: 'Collections',
    params: { indexName: props.indexName },
  });
}

// LIST (FETCH & SEARCH)
// =========================================================================
async function loadAllTheThings(): Promise<void> {
  try {
    emit('start-init');
    loadSettingsForCollection();
    saveSettingsForCollection();
    loadMappingInfo();

    currentFilter.value = filterManager.load(
      props.indexName,
      props.collectionName,
      router.currentRoute.value,
    );
    filterManager.save(currentFilter.value, router, props.indexName, props.collectionName);
    displayPagination.value = true;
    emit('end-init');
    await fetchDocuments();
  } catch (err) {
    logger.error(err);
    toast.warning(
      'Ooops! Something went wrong.',
      'The complete error has been printed to console.',
    );
    emit('end-init');
  }
}

async function onRefresh(): Promise<void> {
  await fetchDocuments();
}

function onFiltersUpdated(newFilters: SearchFilter): void {
  currentFilter.value = newFilters;
}

function onFilterSubmit(saveToHistory = true): void {
  if (saveToHistory) {
    filterManager.addNewHistoryItemAndSave(
      currentFilter.value,
      props.indexName,
      props.collectionName,
    );
  }
  fetchDocuments();
}

function afterCollectionClear(): void {
  documents.value = [];
  totalDocuments.value = 0;
  currentFilter.value = new filterManager.Filter();
}

/*
 * L'ancien `$forceUpdate()` en tête ne servait à rien : `isFetching` est
 * réactif, et le rendu suit.
 */
async function fetchDocuments(): Promise<void> {
  isFetching.value = true;
  selectedDocuments.value = [];

  const pagination = {
    from: paginationFrom.value,
    size: paginationSize.value,
  };

  filterManager.save(currentFilter.value, router, props.indexName, props.collectionName);

  try {
    searchQuery.value = filterManager.toSearchQuery(
      currentFilter.value,
      mappingAttributes.value,
      kuzzleStore.wrapper,
    );

    if (!searchQuery.value) {
      searchQuery.value = {};
    }

    const sorting = filterManager.toSort(currentFilter.value);

    if (searchQuery.value.query) {
      searchQuery.value = searchQuery.value.query as Record<string, unknown>;
    }

    resetNotifications();

    const res = await sdk().document.search(
      props.indexName,
      props.collectionName,
      {
        query: searchQuery.value,
        sort: sorting,
      },
      pagination,
    );

    documents.value = res.hits as KuzzleDocument[];
    totalDocuments.value = res.total;

    nextTick(() => addNewDocumentNotifications());
  } catch (e) {
    logger.error(e);
    if ((e as Error).message.includes('failed to create query')) {
      toast.warning(
        'Ooops! Something went wrong while fetching the documents.',
        'Your query is ill-formed. The complete error has been dumped to the console.',
      );
    } else {
      toast.warning(
        'Ooops! Something went wrong while fetching the documents.',
        (e as Error).message,
      );
    }
  }
  isFetching.value = false;
}

// PAGINATION
// =========================================================================
function changePaginationSize(size: number): void {
  onFiltersUpdated(
    Object.assign(currentFilter.value, {
      size,
      currentPage: 0,
      from: 0,
    }),
  );
  fetchDocuments();
}

function setCurrentPage(): void {
  currentPage.value = Math.floor(paginationFrom.value / paginationSize.value + 1);
}

// SELECT ITEMS
// =========================================================================
function onToggleAllClicked(): void {
  if (allChecked.value) {
    selectedDocuments.value = [];
    return;
  }
  selectedDocuments.value = documents.value.map((document) => document._id);
}

function toggleSelectDocuments(id: string): void {
  const idx = selectedDocuments.value.indexOf(id);

  if (idx === -1) {
    selectedDocuments.value.push(id);
    return;
  }

  selectedDocuments.value.splice(idx, 1);
}

// LIST VIEW TYPES
// =========================================================================
function switchListView(type: string): void {
  listViewType.value = type;
}

function setListViewTypeInRoute(type: string): void {
  /*
   * Passe par `pushQuery` pour ne pas écraser le filtre : les deux
   * écritures reconstruisent la query entière, et `vue-router` 4 les
   * applique de façon asynchrone (G-042).
   */
  filterManager.pushQuery(router, (query) =>
    query.listViewType === type ? query : { ...query, listViewType: type },
  );
}

// Collection Metadata management
// =========================================================================
function loadSettingsForCollection(): void {
  collectionSettings.value = defaults(
    {
      listViewType: router.currentRoute.value.query.listViewType as ListViewType | undefined,
    },
    loadStoredSettings(props.indexName, props.collectionName),
  );
}

function saveSettingsForCollection(): void {
  logger.debug('saveSettingsForCollection');
  saveStoredSettings(props.indexName, props.collectionName, collectionSettings.value);
}

function onSettingsUpdated(newSettings: CollectionSettings): void {
  collectionSettings.value = newSettings;
}

function loadMappingInfo(): void {
  const mapping = collectionMapping.value as Record<string, MappingField>;
  mappingGeopoints.value = listMappingGeopoints(mapping);
  mappingGeoshapes.value = listMappingGeoshapes(mapping);
  if (mappingGeopoints.value.length) {
    selectedGeopoint.value = mappingGeopoints.value[0];
  }
  if (mappingGeoshapes.value.length) {
    selectedGeoshape.value = mappingGeoshapes.value[0];
  }
}

function changeDisplayPagination(value: boolean): void {
  displayPagination.value = value;
}
</script>
