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

    <Card v-if="!canSubscribe(indexName, collectionName)">
      <CardContent class="flex flex-wrap items-center gap-6">
        <i class="fa fa-6x fa-lock text-muted-foreground" aria-hidden="true" />
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-foreground">
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
              variant="secondary"
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
          <json-editor ref="filter" :content="rawFilter" @change="onFilterChanged" />
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
              <h2 class="text-xl font-semibold text-foreground">
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
              <h3 class="text-lg font-semibold text-foreground">
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
                  <Badge title="controller : action" variant="secondary">
                    {{ lastNotification.controller }} : {{ lastNotification.action }}
                  </Badge>
                  <p
                    v-json-formatter="{ content: lastNotification.result, open: true }"
                    class="mt-3"
                  />
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

<script>
import { isEqual } from 'lodash';
import moment from 'moment';
import { mapState } from 'pinia';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import Notification from '../Realtime/Notification.vue';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JsonFormatter from '@/directives/json-formatter.directive';
import * as filterManager from '@/services/filterManager';
import { extractAttributesFromMapping } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';

import DeleteCollectionModal from './DeleteCollectionModal.vue';
import CollectionDropdownAction from './DropdownAction.vue';
import CollectionDropdownView from './DropdownView.vue';

export default {
  name: 'CollectionWatch',
  directives: {
    JsonFormatter,
  },
  components: {
    Alert,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CollectionDropdownAction,
    CollectionDropdownView,
    DeleteCollectionModal,
    Headline,
    JsonEditor,
    Notification,
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
      advancedFiltersVisible: false,
      deleteCollectionOpen: false,
      rawFilter: '{}',
      room: null,
      notifications: [],
      notificationsLengthLimit: 50,
      subscribed: false,
      subscribeOptions: { scope: 'all', users: 'all', state: 'all' },
      warning: { message: '', count: 0, lastTime: null, info: false },
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['canSubscribe']),
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
    mappingAttributes() {
      return this.collectionMapping
        ? this.extractAttributesFromMapping(this.collectionMapping)
        : null;
    },
    hasFilter() {
      return !!this.realtimeQuery && !isEqual(this.realtimeQuery, {}) && this.isFilterValid;
    },
    lastNotification() {
      if (this.notifications.length) {
        return this.notifications[0];
      }
      return {};
    },
    lastNotificationTime() {
      if (!this.notifications.length) {
        return null;
      }
      return moment(this.lastNotification.timestamp).format('H:mm:ss');
    },
    realtimeQuery() {
      try {
        return JSON.parse(this.rawFilter);
      } catch (error) {
        return {};
      }
    },
    isFilterValid() {
      if (!this.rawFilter) {
        return true;
      }
      try {
        JSON.parse(this.rawFilter);
        return true;
      } catch (error) {
        return false;
      }
    },
    isRealtimeCollection() {
      return this.collection ? this.collection.isRealtime() : false;
    },
  },
  watch: {
    index() {
      this.reset();
    },
    collection() {
      this.reset();
    },
    $route() {
      this.reset();
      this.currentFilter = filterManager.loadFromRoute(this.$route);
    },
  },
  async unmounted() {
    this.reset();
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room);
    }
  },
  methods: {
    truncateName,
    extractAttributesFromMapping,
    goToDocumentList(listViewType) {
      this.$router.push({ name: 'DocumentList', query: { listViewType } });
    },
    afterDeleteCollection() {
      this.$router.push({
        name: 'Collections',
        params: { indexName: this.indexName },
      });
    },
    onFilterChanged(value) {
      this.rawFilter = value;
    },
    async toggleSubscription() {
      if (!this.subscribed) {
        await this.subscribe();
      } else {
        await this.unsubscribe(this.room);
      }
    },
    handleNotification(result) {
      if (this.notifications.length > this.notificationsLengthLimit) {
        if (this.warning.message === '') {
          this.warning.info = true;
          this.warning.message =
            'Older notifications are discarded due to the amount of items displayed';
        }

        if (Date.now() - this.warning.lastTime < 50) {
          this.warning.count++;
        }

        this.warning.lastTime = Date.now();

        if (this.warning.count >= 100) {
          this.warning.info = false;
          this.warning.message =
            'You are receiving too many messages, try to add more filters to reduce the amount of messages';
        }

        // two shift instead of one to have a visual effect on items in the view
        this.notifications.shift();
        this.notifications.shift();
      }

      this.notifications.unshift(result);
    },
    async subscribe() {
      try {
        if (!this.isFilterValid) {
          throw new Error('Realtime filter seems to be invalid');
        }
        const room = await this.$kuzzle.realtime.subscribe(
          this.indexName,
          this.collectionName,
          this.realtimeQuery,
          this.handleNotification,
          this.subscribeOptions,
        );
        this.subscribed = true;
        this.room = room;
      } catch (err) {
        this.room = null;
        this.subscribed = false;
        this.$log.error(err);
        this.$toast.warning(
          'Ooops! Something went wrong while subscribing to the collection.',
          err.message,
        );
      }
    },
    async unsubscribe(room) {
      this.warning.message = '';
      this.warning.count = 0;

      await this.$kuzzle.realtime.unsubscribe(room);
      this.subscribed = false;
      this.room = null;
    },
    resetFilters() {
      if (this.subscribed) {
        this.subscribed = false;
        this.unsubscribe(this.room);
      }
      if (this.$refs.filter) {
        this.$refs.filter.setContent('{}');
      }
    },
    resetNotifications() {
      this.notifications = [];
      this.warning.message = '';
      this.warning.count = 0;
    },
    reset() {
      // trigged when user changed the collection of watch data page
      this.resetFilters();
      this.resetNotifications();
    },
  },
};
</script>
