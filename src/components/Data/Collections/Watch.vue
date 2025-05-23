<template>
  <div class="Watch">
    <b-container>
      <div class="Watch-flexContainer">
        <b-row>
          <b-col cols="10">
            <headline>
              <span class="code" :title="collectionName">{{
                truncateName(collectionName, 20)
              }}</span>
            </headline>
          </b-col>
          <b-col class="text-right">
            <collection-dropdown-view
              active-view="realtime"
              class="icon-medium icon-black mr-2"
              :index="indexName"
              :collection="collectionName"
              :mapping-attributes="mappingAttributes"
              @list="
                $router.push({
                  name: 'DocumentList',
                  query: { listViewType: 'list' },
                })
              "
              @column="
                $router.push({
                  name: 'DocumentList',
                  query: { listViewType: 'column' },
                })
              "
              @time-series="
                $router.push({
                  name: 'DocumentList',
                  query: { listViewType: 'time-series' },
                })
              "
              @map="
                $router.push({
                  name: 'DocumentList',
                  query: { listViewType: 'map' },
                })
              "
            />
            <b-button
              v-if="isRealtimeCollection"
              data-cy="Watch-deleteCollectionBtn"
              title="Delete this collection"
              @click="onDeleteCollectionClicked"
            >
              <i class="fa fa-trash" />
            </b-button>
            <collection-dropdown-action
              v-else
              class="icon-medium icon-black"
              :index-name="indexName"
              :collection-name="collectionName"
              @delete-collection-clicked="showDeleteCollectionModal"
            />
          </b-col>
        </b-row>
        <b-card v-if="!canSubscribe(indexName, collectionName)">
          <b-row>
            <b-col cols="2">
              <i class="fa fa-6x fa-lock text-secondary" aria-hidden="true" />
            </b-col>
            <b-col cols="10">
              <h2>
                You are not allowed to watch realtime messages on collection
                <strong>{{ collectionName }}</strong> of index <strong>{{ indexName }}</strong
                ><br />
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
            </b-col>
          </b-row>
        </b-card>

        <div v-else class="Watch-container">
          <b-card class="Filters" :no-body="!advancedFiltersVisible">
            <template #header>
              <b-row>
                <b-col cols="8">
                  <b-button
                    data-cy="Watch-toggleFiltersBtn"
                    variant="outline-info"
                    @click="advancedFiltersVisible = !advancedFiltersVisible"
                  >
                    <i class="fa left fa-filter mr-2" />{{
                      advancedFiltersVisible ? 'Hide filters' : 'Show filters'
                    }}</b-button
                  >
                  <b-badge
                    v-if="hasFilter && !advancedFiltersVisible"
                    data-cy="Watch-filterAppliedPill"
                    pill
                    variant="info"
                    class="ml-2 py-2 px-3"
                    >Filters are being applied</b-badge
                  >
                  <b-badge
                    v-if="!isFilterValid && !advancedFiltersVisible"
                    data-cy="Watch-filterErrorPill"
                    pill
                    variant="warning"
                    class="ml-2 py-2 px-3"
                    >Filter contains errors</b-badge
                  >
                </b-col>
                <b-col class="text-right">
                  <b-button
                    class="ml-2 d-inline-block"
                    data-cy="Watch-subscribeBtn"
                    type="submit"
                    :disabled="!isFilterValid"
                    :variant="subscribed ? 'danger' : 'primary'"
                    @click.prevent="toggleSubscription"
                  >
                    <template v-if="!subscribed">
                      <i class="fa left fa-play mr-2" />Subscribe
                    </template>
                    <template v-else><i class="fa left fa-pause mr-2" />Unsubscribe</template>
                  </b-button>
                  <b-button
                    class="ml-2 d-inline-block"
                    data-cy="Watch-resetBtn"
                    title="Reset filters and unsubscribe"
                    variant="outline-primary"
                    @click="resetFilters"
                  >
                    Reset filters
                  </b-button>
                </b-col>
              </b-row>
            </template>
            <template v-if="advancedFiltersVisible">
              <json-editor ref="filter" :content="rawFilter" @change="onFilterChanged"
            /></template>
          </b-card>
          <b-card class="mt-3">
            <b-row v-if="!subscribed && !notifications.length">
              <b-col cols="4" class="text-center">
                <i class="fa fa-5x fa-paper-plane text-secondary mt-3" aria-hidden="true" />
              </b-col>
              <b-col cols="6">
                <h3>
                  You did not subscribe yet to the collection
                  <strong>{{ collectionName }}</strong
                  ><br />
                </h3>
                <p>
                  <em
                    >Learn more about real-time filtering syntax on
                    <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Koncorde</a></em
                  >
                </p>
                <br />
                <b-button variant="primary" @click="toggleSubscription()">
                  <i class="fa left fa-play mr-2" />
                  Subscribe
                </b-button>
              </b-col>
            </b-row>

            <b-row v-if="subscribed && !notifications.length">
              <b-col cols="4" class="text-center">
                <i class="fa fa-5x fa-hourglass-half text-secondary" aria-hidden="true" />
              </b-col>
              <b-col cols="6"
                ><h2>Waiting for notifications matching your filters ...</h2>
                <p>
                  <em
                    >Learn more about real-time filtering syntax on
                    <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Koncorde</a></em
                  >
                </p></b-col
              >
            </b-row>

            <b-alert data-cy="Watch-alert" variant="warning" :show="!!warning.message">{{
              warning.message
            }}</b-alert>
            <template v-if="notifications.length">
              <b-row class="mb-3">
                <b-col cols="8" class="text-secondary vertical-align">
                  Received {{ notifications.length }} notifications
                </b-col>
                <b-col class="text-right"
                  ><b-button
                    data-cy="Watch-clearNotifications"
                    title="Clear messages"
                    variant="outline-secondary"
                    @click="resetNotifications"
                    ><i class="fas fa-trash-alt mr-2" />Clear all notifications</b-button
                  ></b-col
                ></b-row
              >

              <b-row>
                <b-col
                  id="notification-container"
                  ref="notificationContainer"
                  cols="8"
                  class="Watch--notifications pr-1"
                >
                  <notification
                    v-for="(notification, i) in notifications"
                    :key="i"
                    :notification="notification"
                  />
                </b-col>
                <b-col cols="4">
                  <b-card data-cy="Watch-latestNotification" no-body>
                    <b-card-header>
                      Latest notification ({{ lastNotificationTime }})
                    </b-card-header>
                    <b-card-body class="overflow-auto">
                      <b-badge pill variant="info" class="mr-2" title="controller : action"
                        >{{ lastNotification.controller }} : {{ lastNotification.action }}</b-badge
                      >
                      <p
                        v-json-formatter="{
                          content: lastNotification.result,
                          open: true,
                        }"
                        class="mt-3"
                      />
                    </b-card-body>
                  </b-card>
                </b-col>
              </b-row>
            </template>
          </b-card>
        </div>
      </div>
    </b-container>
    <DeleteCollectionModal
      :index="index"
      :collection="collection"
      :modal-id="modalDeleteId"
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
      modalDeleteId: 'modal-collection-delete',
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
  async destroyed() {
    this.reset();
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room);
    }
  },
  methods: {
    truncateName,
    extractAttributesFromMapping,
    showDeleteCollectionModal() {
      this.$bvModal.show(this.modalDeleteId);
    },
    onDeleteCollectionClicked() {
      this.$bvModal.show(this.modalDeleteId);
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
        this.$bvToast.toast(err.message, {
          title: 'Ooops! Something went wrong while subscribing to the collection.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
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

<style rel="stylesheet/scss" lang="scss" scoped>
.Watch {
  margin-bottom: 3em;
}
</style>
