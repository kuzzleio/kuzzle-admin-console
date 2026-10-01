<template>
  <div class="Watch mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>
        <span class="code" :title="collectionName">{{ truncateName(collectionName, 20) }}</span>
      </headline>

      <div class="flex items-center gap-2">
        <collection-dropdown-view
          active-view="realtime"
          :index="indexName"
          :collection="collectionName"
          :mapping-attributes="mappingAttributes"
          @list="goToDocumentList('list')"
          @column="goToDocumentList('column')"
          @time-series="goToDocumentList('time-series')"
          @map="goToDocumentList('map')"
        />
        <Button
          v-if="isRealtimeCollection"
          data-cy="Watch-deleteCollectionBtn"
          size="icon"
          title="Delete this collection"
          variant="outline"
          @click="deleteCollectionOpen = true"
        >
          <i aria-hidden="true" class="fa fa-trash" />
        </Button>
        <collection-dropdown-action
          v-else
          :index-name="indexName"
          :collection-name="collectionName"
          @delete-collection-clicked="deleteCollectionOpen = true"
        />
      </div>
    </div>

    <Card v-if="!authStore.canSubscribe(indexName, collectionName)">
      <CardContent class="flex flex-wrap items-center gap-6">
        <i class="fa fa-6x fa-lock text-muted-foreground" aria-hidden="true" />
        <div class="flex-1">
          <h2 class="font-heading text-headline font-extrabold text-foreground">
            You are not allowed to watch realtime messages on collection
            <strong>{{ collectionName }}</strong> of index <strong>{{ indexName }}</strong>
          </h2>
          <p>
            <em
              >Learn more about security &amp; permissions on
              <a
                href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/"
                target="_blank"
                >Kuzzle guide</a
              ></em
            >
          </p>
        </div>
      </CardContent>
    </Card>

    <div v-else class="flex flex-col gap-3">
      <Card>
        <CardHeader class="flex flex-row flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <Button
              data-cy="Watch-toggleFiltersBtn"
              variant="outline"
              @click="advancedFiltersVisible = !advancedFiltersVisible"
            >
              <i aria-hidden="true" class="fa fa-filter" />
              {{ advancedFiltersVisible ? 'Hide filters' : 'Show filters' }}
            </Button>
            <Badge
              v-if="hasFilter && !advancedFiltersVisible"
              data-cy="Watch-filterAppliedPill"
              variant="info"
            >
              Filters are being applied
            </Badge>
            <Badge
              v-if="!isFilterValid && !advancedFiltersVisible"
              data-cy="Watch-filterErrorPill"
              variant="warning"
            >
              Filter contains errors
            </Badge>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              data-cy="Watch-subscribeBtn"
              :disabled="!isFilterValid"
              type="submit"
              :variant="subscribed ? 'destructive' : 'default'"
              @click.prevent="toggleSubscription"
            >
              <i aria-hidden="true" :class="['fa', subscribed ? 'fa-pause' : 'fa-play']" />
              {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
            </Button>
            <Button
              data-cy="Watch-resetBtn"
              title="Reset filters and unsubscribe"
              variant="outline"
              @click="resetFilters"
            >
              Reset filters
            </Button>
          </div>
        </CardHeader>
        <CardContent v-if="advancedFiltersVisible">
          <json-editor ref="filterEditor" :content="rawFilter" @change="onFilterChanged" />
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col gap-3">
          <div v-if="!notifications.length" class="flex flex-wrap items-center gap-6">
            <i
              aria-hidden="true"
              class="fa fa-5x text-muted-foreground"
              :class="subscribed ? 'fa-hourglass-half' : 'fa-paper-plane'"
            />
            <div v-if="subscribed" class="flex-1">
              <h2 class="font-heading text-headline font-extrabold text-foreground">
                Waiting for notifications matching your filters ...
              </h2>
              <p>
                <em
                  >Learn more about real-time filtering syntax on
                  <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Koncorde</a></em
                >
              </p>
            </div>
            <div v-else class="flex-1">
              <h3 class="text-title font-bold text-foreground">
                You did not subscribe yet to the collection
                <strong>{{ collectionName }}</strong>
              </h3>
              <p>
                <em
                  >Learn more about real-time filtering syntax on
                  <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Koncorde</a></em
                >
              </p>
              <Button class="mt-3" @click="toggleSubscription">
                <i aria-hidden="true" class="fa fa-play" />
                Subscribe
              </Button>
            </div>
          </div>

          <Alert v-if="warning.message" data-cy="Watch-alert" variant="warning">
            {{ warning.message }}
          </Alert>

          <template v-if="notifications.length">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-sm text-muted-foreground">
                Received {{ notifications.length }} notifications
              </span>
              <Button
                data-cy="Watch-clearNotifications"
                title="Clear messages"
                variant="outline"
                @click="resetNotifications"
              >
                <i aria-hidden="true" class="fas fa-trash-alt" />
                Clear all notifications
              </Button>
            </div>

            <div class="grid gap-4 lg:grid-cols-3">
              <div class="lg:col-span-2">
                <notification
                  v-for="(notification, i) in notifications"
                  :key="i"
                  :notification="notification"
                />
              </div>
              <Card data-cy="Watch-latestNotification" class="h-fit gap-0 py-0">
                <CardHeader class="border-b border-border px-3 py-2">
                  <CardTitle class="text-sm">
                    Latest notification ({{ lastNotificationTime }})
                  </CardTitle>
                </CardHeader>
                <CardContent class="overflow-auto px-3 py-3">
                  <Badge title="controller : action" variant="info">
                    {{ lastNotification?.controller }} : {{ lastNotification?.action }}
                  </Badge>
                  <JsonTree class="mt-3" :value="lastNotificationResult" />
                </CardContent>
              </Card>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <DeleteCollectionModal
      v-model:open="deleteCollectionOpen"
      :index="index"
      :collection="collection"
      @delete-successful="afterDeleteCollection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, useTemplateRef, watch } from 'vue';
import {
  type ArgsRealtimeControllerSubscribe,
  type Notification as RealtimeNotification,
  ScopeOption,
  UserOption,
} from 'kuzzle-sdk-v7';
import { isEqual } from 'lodash';
import { useRoute, useRouter } from 'vue-router';

import Notification from '../Realtime/Notification.vue';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/composables/useToast';
import { formatClockTime } from '@/lib/date';
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { extractAttributesFromMapping } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';

import JsonEditor from '@/components/Common/JsonEditor.vue';
import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';
import Headline from '@/components/Materialize/Headline.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';
import CollectionDropdownAction from './DropdownAction.vue';
import CollectionDropdownView from './DropdownView.vue';

const NOTIFICATIONS_LENGTH_LIMIT = 50;
const SUBSCRIBE_OPTIONS: ArgsRealtimeControllerSubscribe = {
  scope: ScopeOption.all,
  users: UserOption.all,
  state: 'all',
};

const props = defineProps<{
  collectionName: string;
  indexName: string;
}>();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const storageIndexStore = useStorageIndexStore();

// `ref="filter"` devient `filterEditor` : en `<script setup>`, la référence
// se lie à la variable du même nom.
const filterEditor = useTemplateRef<InstanceType<typeof JsonEditor>>('filterEditor');

const advancedFiltersVisible = ref(false);
const deleteCollectionOpen = ref(false);
const rawFilter = ref('{}');
const room = ref<string | null>(null);
const notifications = ref<RealtimeNotification[]>([]);
const subscribed = ref(false);
interface Warning {
  message: string;
  count: number;
  lastTime: number | null;
  info: boolean;
}

const warning = reactive<Warning>({ message: '', count: 0, lastTime: null, info: false });

function kuzzle() {
  const instance = kuzzleStore.$kuzzle;
  if (instance === null) {
    throw new Error('Kuzzle is not initialized');
  }
  return instance;
}

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collection = computed(() =>
  index.value ? storageIndexStore.getOneCollection(index.value, props.collectionName) : null,
);

const collectionMapping = computed(() => (collection.value ? collection.value.mapping : null));

const mappingAttributes = computed(() =>
  collectionMapping.value ? extractAttributesFromMapping(collectionMapping.value) : null,
);

const realtimeQuery = computed(() => {
  try {
    return JSON.parse(rawFilter.value);
  } catch (error) {
    return {};
  }
});

const isFilterValid = computed((): boolean => {
  if (!rawFilter.value) {
    return true;
  }
  try {
    JSON.parse(rawFilter.value);
    return true;
  } catch (error) {
    return false;
  }
});

const hasFilter = computed(
  (): boolean => !!realtimeQuery.value && !isEqual(realtimeQuery.value, {}) && isFilterValid.value,
);

// Lue seulement quand la liste n'est pas vide.
const lastNotification = computed((): RealtimeNotification | undefined => notifications.value[0]);

const lastNotificationResult = computed(() => {
  const notification = lastNotification.value;
  return notification && 'result' in notification ? notification.result : undefined;
});

const lastNotificationTime = computed((): string | null => {
  if (!notifications.value.length) {
    return null;
  }
  return formatClockTime(lastNotification.value?.timestamp);
});

const isRealtimeCollection = computed((): boolean =>
  collection.value ? collection.value.isRealtime() : false,
);

watch(index, () => {
  reset();
});

watch(collection, () => {
  reset();
});

watch(
  () => route.fullPath,
  () => {
    reset();
  },
);

onUnmounted(async () => {
  reset();
  if (room.value) {
    await kuzzle().realtime.unsubscribe(room.value);
  }
});

function goToDocumentList(listViewType: string): void {
  router.push({ name: 'DocumentList', query: { listViewType } });
}

function afterDeleteCollection(): void {
  router.push({
    name: 'Collections',
    params: { indexName: props.indexName },
  });
}

function onFilterChanged(value: string): void {
  rawFilter.value = value;
}

async function toggleSubscription(): Promise<void> {
  if (!subscribed.value) {
    await subscribe();
  } else {
    await unsubscribe(room.value);
  }
}

function handleNotification(result: RealtimeNotification): void {
  if (notifications.value.length > NOTIFICATIONS_LENGTH_LIMIT) {
    if (warning.message === '') {
      warning.info = true;
      warning.message = 'Older notifications are discarded due to the amount of items displayed';
    }

    // `lastTime` vaut `null` avant le premier dépassement : `Date.now() - null`
    // donnait `Date.now()`, jamais sous 50.
    if (Date.now() - (warning.lastTime ?? 0) < 50) {
      warning.count++;
    }

    warning.lastTime = Date.now();

    if (warning.count >= 100) {
      warning.info = false;
      warning.message =
        'You are receiving too many messages, try to add more filters to reduce the amount of messages';
    }

    // two shift instead of one to have a visual effect on items in the view
    notifications.value.shift();
    notifications.value.shift();
  }

  notifications.value.unshift(result);
}

async function subscribe(): Promise<void> {
  try {
    if (!isFilterValid.value) {
      throw new Error('Realtime filter seems to be invalid');
    }
    const newRoom = await kuzzle().realtime.subscribe(
      props.indexName,
      props.collectionName,
      realtimeQuery.value,
      handleNotification,
      SUBSCRIBE_OPTIONS,
    );
    subscribed.value = true;
    room.value = newRoom;
  } catch (err) {
    room.value = null;
    subscribed.value = false;
    logger.error(err);
    toast.warning(
      'Ooops! Something went wrong while subscribing to the collection.',
      caught(err).message,
    );
  }
}

async function unsubscribe(currentRoom: string | null): Promise<void> {
  warning.message = '';
  warning.count = 0;

  // `room` n'est `null` que hors souscription, et on ne se désabonne
  // qu'abonné.
  if (currentRoom !== null) {
    await kuzzle().realtime.unsubscribe(currentRoom);
  }
  subscribed.value = false;
  room.value = null;
}

function resetFilters(): void {
  if (subscribed.value) {
    subscribed.value = false;
    unsubscribe(room.value);
  }
  if (filterEditor.value) {
    filterEditor.value.setContent('{}');
  }
}

function resetNotifications(): void {
  notifications.value = [];
  warning.message = '';
  warning.count = 0;
}

function reset(): void {
  // trigged when user changed the collection of watch data page
  resetFilters();
  resetNotifications();
}
</script>
