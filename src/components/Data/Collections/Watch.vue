<template>
  <div class="Watch">
    <div class="wrapper">
      <headline>
        {{ collection }}
        <collection-dropdown
          class="icon-medium icon-black"
          :index="index"
          :collection="collection"
        />
      </headline>

      <collection-tabs />

      <div v-if="!canSubscribe(index, collection)" class="card-panel">
        <div class="row valign-bottom empty-set">
          <div class="col s1">
            <i
              class="fa fa-6x fa-lock grey-text text-lighten-1"
              aria-hidden="true"
            />
          </div>
          <div class="col s10">
            <p>
              You are not allowed to watch realtime messages on collection
              <strong>{{ collection }}</strong> of index
              <strong>{{ index }}</strong
              ><br />
            </p>
            <p>
              <em
                >Learn more about security &amp; permissions on
                <a
                  href="https://docs.kuzzle.io/guide/1/essentials/security/"
                  target="_blank"
                  >Kuzzle guide</a
                ></em
              >
            </p>
          </div>
        </div>
      </div>

      <div v-else class="Watch-container">
        <filters
          submit-button-label="Subscribe"
          advanced-query-label="Click to open the filter builder"
          :action-buttons-visible="!subscribed"
          :current-filter="currentFilter"
          :available-operands="realtimeFilterOperands"
          :quick-filter-enabled="false"
          :sorting-enabled="false"
          :collection-mapping="collectionMapping"
          @filters-updated="onFiltersUpdated"
          @reset="onReset"
        />
        <div
          v-show="subscribed || notifications.length"
          ref="subscribeControl"
          class="card-panel card-body"
        >
          <!-- subscription controls in page flow -->
          <subscription-controls
            :index="index"
            :collection="collection"
            :subscribed="subscribed"
            :warning="warning"
            @realtime-toggle-subscription="toggleSubscription"
            @realtime-clear-messages="clear"
            @scroll-down="setScrollDown"
          />
          <!-- /subscription controls in page flow  -->
        </div>

        <div
          v-show="!subscribed && !notifications.length"
          class="card-panel card-body"
        >
          <div class="row valign-bottom empty-set">
            <div class="col s1">
              <i
                class="fa fa-6x fa-paper-plane grey-text text-lighten-1"
                aria-hidden="true"
              />
            </div>
            <div class="col s8 m9 l10">
              <p>
                You did not subscribe yet to the collection
                <strong>{{ collection }}</strong
                ><br />
                <em
                  >Learn more about real-time filtering syntax on
                  <a href="https://docs.kuzzle.io/koncorde/" target="_blank"
                    >Koncorde</a
                  ></em
                >
              </p>
              <button
                class="btn primary waves-effect waves-light"
                @click="toggleSubscription()"
              >
                <i class="fa left fa-play" />
                subscribe
              </button>
            </div>
          </div>
        </div>

        <div
          v-show="subscribed && !notifications.length"
          id="wait-for-notif"
          class="card-panel"
        >
          <div class="row valign-center empty-set empty-set-condensed">
            <div class="col s1">
              <i
                class="fa fa-5x fa-hourglass-half grey-text text-lighten-1"
                aria-hidden="true"
              />
            </div>
            <div class="col s10">
              <p>
                Waiting for notifications matching your filters ...
              </p>
              <p>
                <em
                  >Learn more about real-time filtering syntax on
                  <a href="https://docs.kuzzle.io/koncorde/" target="_blank"
                    >Koncorde</a
                  ></em
                >
              </p>
            </div>
          </div>
        </div>

        <div class="row">
          <div
            id="notification-container"
            ref="notificationContainer"
            :style="notifStyle"
            class="Watch--notifications col s8"
          >
            <div v-if="notifications.length">
              <ul
                v-collapsible
                class="collapsible"
                data-collapsible="expandable"
              >
                <notification
                  v-for="(notification, i) in notifications"
                  :key="i"
                  :notification="notification"
                />
              </ul>
            </div>
          </div>

          <LastNotification
            v-if="notifications.length"
            :last-notification="lastNotification"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CollectionTabs from './Tabs'
import Headline from '../../Materialize/Headline'
import collapsible from '../../../directives/Materialize/collapsible.directive'
import Notification from '../Realtime/Notification'
import LastNotification from '../Realtime/LastNotification'
import SubscriptionControls from '../Realtime/SubscriptionControls'
import CollectionDropdown from '../Collections/Dropdown'
import Filters from '../../Common/Filters/Filters'
import * as filterManager from '../../../services/filterManager'
import { canSubscribe } from '../../../services/userAuthorization'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'
import { getMappingDocument } from '../../../services/kuzzleWrapper'

import Vue from 'vue'

export default {
  name: 'CollectionWatch',
  directives: {
    collapsible
  },
  components: {
    CollectionTabs,
    Notification,
    LastNotification,
    CollectionDropdown,
    SubscriptionControls,
    Filters,
    Headline
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      subscribed: false,
      room: null,
      currentFilter: new filterManager.Filter(),
      realtimeFilterOperands: filterManager.realtimeFilterOperands,
      subscribeOptions: { scope: 'all', users: 'all', state: 'all' },
      notifications: [],
      notificationsLengthLimit: 50,
      warning: { message: '', count: 0, lastTime: null, info: false },
      notifStyle: {},
      scrollDown: true,
      lastNotification: {},
      collectionMapping: {}
    }
  },
  watch: {
    index() {
      this.reset()
    },
    collection() {
      this.reset()
    },
    $route() {
      this.reset()
      this.currentFilter = filterManager.loadFromRoute(this.$route)
    },
    subscribed() {
      this.computeNotifHeight()
    }
  },
  created() {
    window.addEventListener('scroll', this.handleScroll)
  },
  async mounted() {
    this.notifications = []
    const response = await getMappingDocument(this.collection, this.index)
    this.collectionMapping =
      response[this.index].mappings[this.collection].properties
  },
  async destroyed() {
    this.reset()
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room)
    }
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    canSubscribe,
    onFiltersUpdated(newFilters) {
      this.currentFilter = newFilters
      filterManager.saveToRouter(
        filterManager.stripDefaultValuesFromFilter(newFilters),
        this.$router
      )
      this.toggleSubscription()
    },
    async toggleSubscription() {
      if (!this.subscribed) {
        window.Notification.requestPermission()
        await this.subscribe()
      } else {
        await this.unsubscribe(this.room)
      }
    },
    notificationToMessage(notification) {
      const idText =
        notification.type === 'document' && notification.result._id
          ? `(${notification.result._id})`
          : ''
      const messageItem = {
        text: '',
        icon: 'file',
        class: '',
        source: {},
        expanded: false
      }

      if (
        notification.volatile &&
        Object.keys(notification.volatile).length > 0
      ) {
        messageItem.source.volatile = notification.volatile
      }

      if (notification.type === 'document') {
        if (notification.result._id) {
          messageItem.source.id = notification.result._id
        }

        if (
          notification.result._meta &&
          Object.keys(notification.result._meta).length > 0
        ) {
          messageItem.source.meta = notification.result._meta
        }

        if (
          notification.result._source &&
          Object.keys(notification.result._source).length > 0
        ) {
          messageItem.source.body = notification.result._source
        }
      } else {
        messageItem.source.users = notification.user.count
      }

      messageItem.empty = Object.keys(messageItem.source).length === 0

      switch (notification.action) {
        case 'publish':
          messageItem.text = 'Received volatile message'
          messageItem.icon = 'send'
          messageItem.class = 'message-volatile'
          break
        case 'create':
        case 'createOrReplace':
        case 'replace':
          messageItem.icon = 'file'

          if (notification.state === 'done') {
            messageItem.text = `New document created ${idText}`
            messageItem.class = 'message-created-updated-doc'
          } else if (notification.state === 'pending') {
            messageItem.text = `Pending document creation ${idText}`
            messageItem.class = 'message-pending'
          }
          break

        case 'update':
          messageItem.text = `Document updated ${idText}`
          messageItem.icon = 'file'
          messageItem.class = 'message-created-updated-doc'
          break

        case 'delete':
          messageItem.icon = 'remove'
          if (notification.state === 'done') {
            messageItem.text = `Document deleted ${idText}`
            messageItem.class = 'message-deleted-doc'
          } else if (notification.state === 'pending') {
            messageItem.text = `Pending document deletion ${idText}`
            messageItem.class = 'message-pending'
          }
          break

        case 'subscribe':
          messageItem.text = 'A new user is listening to this room'
          messageItem.icon = 'user'
          messageItem.class = 'message-user'
          break

        case 'unsubscribe':
          messageItem.text = 'A user exited this room'
          messageItem.icon = 'user'
          messageItem.class = 'message-user'
          break
      }

      messageItem.timestamp = notification.timestamp
      return messageItem
    },
    makeAutoScroll() {
      // Auto scroll
      if (this.scrollDown) {
        const div = this.$refs.notificationContainer
        setTimeout(() => {
          div.scrollTop = div.scrollHeight
        }, 0)
      }
    },
    handleMessage(result) {
      if (this.notifications.length > this.notificationsLengthLimit) {
        if (this.warning.message === '') {
          this.warning.info = true
          this.warning.message =
            'Older notifications are discarded due to huge amount of items displayed'
        }

        if (Date.now() - this.warning.lastTime < 50) {
          this.warning.count++
        }

        this.warning.lastTime = Date.now()

        if (this.warning.count >= 100) {
          this.warning.info = false
          this.warning.message =
            'You are receiving too many messages, try to add more filters to reduce the amount of messages'
        }

        // two shift instead of one to have a visual effect on items in the view
        this.notifications.shift()
        this.notifications.shift()
      }

      this.notifications.push(this.notificationToMessage(result))
      this.handleWebNotification(
        this.notifications[this.notifications.length - 1].text
      )
      this.lastNotification = this.notifications[this.notifications.length - 1]

      this.makeAutoScroll()
    },
    async subscribe() {
      try {
        const realtimeQuery = filterManager.toRealtimeQuery(this.currentFilter)
        const room = await this.$kuzzle.realtime.subscribe(
          this.index,
          this.collection,
          realtimeQuery,
          this.handleMessage,
          this.subscribeOptions
        )
        this.subscribed = true
        this.room = room
      } catch (err) {
        this.room = null
        this.subscribed = false
        this.$store.commit(SET_TOAST, { text: err.message })
      }
    },
    async unsubscribe(room) {
      this.warning.message = ''
      this.warning.count = 0

      await this.$kuzzle.realtime.unsubscribe(room)
      this.subscribed = false
      this.room = null
    },
    onReset(newFilters) {
      filterManager.saveToRouter(
        filterManager.stripDefaultValuesFromFilter(newFilters),
        this.$router
      )
      this.reset()
    },
    reset() {
      // trigged when user changed the collection of watch data page
      this.notifications = []
      this.warning.message = ''
      this.warning.count = 0

      if (this.subscribed) {
        this.subscribed = false
        this.unsubscribe(this.room)
      }
    },
    clear() {
      this.warning.message = ''
      this.notifications = []
    },
    computeNotifHeight() {
      Vue.nextTick(() => {
        const mainNavHeight = document.getElementById('mainnav').offsetHeight
        const searchFilter = document.getElementsByClassName('Filters')[0]
          .offsetHeight
        const subCtrl = this.$refs.subscribeControl.offsetHeight
        const notifHeight =
          document.body.offsetHeight - (mainNavHeight + searchFilter + subCtrl)

        this.notifStyle = { maxHeight: notifHeight + 'px', overflowY: 'auto' }
      })
    },
    setScrollDown(v) {
      this.scrollDown = v
    },
    handleWebNotification(text) {
      const notif = new window.Notification('Kuzzle Admin Console', {
        body: text + ' in ' + this.index + ' ' + this.collection,
        icon: '/static/favicon/favicon-32x32.png'
      })
      setTimeout(notif.close.bind(notif), 5000)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.Watch {
  // @TODO temoirarily reverted
  // max-width: 1080px;
  // margin: auto;

  .head {
    float: left;
    font-size: 2rem;
    margin-top: 0;
  }

  .fixed {
    position: fixed;
  }

  .Watch-container {
    max-width: $container-width;
  }

  .wrapper {
    position: relative;
  }

  .sticky {
    position: fixed;
    top: 50px;
    left: 260px;
    line-height: 20px;
    padding: 10px 5px;
    right: 20px;
    z-index: 200;
    background-color: #fff;
    transition: all 0.3s;
    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.2);
  }

  #notification-container {
    margin-left: -10px;
    ul {
      margin: 0;
      li {
        font-family: monospace;
        font-size: 0.8rem;
      }
      li:nth-child(odd) {
        background-color: #f5f5f5;

        .collapsible-header {
          background-color: #f5f5f5;
        }
      }
    }
  }

  .collapsible {
    border-width: 0;
  }
}
</style>
