<template>
  <div class="Watch">
    <div class="wrapper">
      <headline>
        {{collection}}
        <collection-dropdown
          class="icon-medium icon-black"
          :index="index"
          :collection="collection">
        </collection-dropdown>
      </headline>

      <collection-tabs></collection-tabs>

      <div class="card-panel" v-if="!canSubscribe(index, collection)">
        <div class="row valign-bottom empty-set">
          <div class="col s1">
            <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
            <p>
              You are not allowed to watch realtime messages on collection <strong>{{collection}}</strong> of index <strong>{{index}}</strong><br>
            </p>
            <p>
              <em>Learn more about security &amp; permissions on <a href="https://docs.kuzzle.io/guide/1/essentials/security/" target="_blank">Kuzzle guide</a></em>
            </p>
          </div>
        </div>
      </div>

      <div class="Watch-container" v-else>
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
          >
        </filters>

        <div class="card-panel card-body" v-show="subscribed || notifications.length" ref="subscribeControl">
          <!-- subscription controls in page flow -->
          <subscription-controls
            @realtime-toggle-subscription="toggleSubscription"
            @realtime-clear-messages="clear"
            :index="index"
            :collection="collection"
            :subscribed="subscribed"
            :warning="warning"
            @scroll-down="setScrollDown">
          </subscription-controls>
          <!-- /subscription controls in page flow  -->
        </div>

        <div class="card-panel card-body" v-show="!subscribed && !notifications.length">
          <div class="row valign-bottom empty-set">
            <div class="col s1">
              <i class="fa fa-6x fa-paper-plane grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s8 m9 l10">
              <p>
                You did not subscribe yet to the collection <strong>{{collection}}</strong><br>
                <em>Learn more about real-time filtering syntax on <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Kuzzle DSL</a></em>
              </p>
              <button class="btn primary waves-effect waves-light" @click="toggleSubscription()">
                <i class="fa left fa-play"></i>
                subscribe
              </button>
            </div>
          </div>
        </div>

        <div class="card-panel" v-show="subscribed && !notifications.length" id="wait-for-notif">
          <div class="row valign-center empty-set empty-set-condensed">
            <div class="col s1">
              <i class="fa fa-5x fa-hourglass-half grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s10">
              <p>
                Waiting for notifications matching your filters ...
              </p>
              <p>
                <em>Learn more about real-time filtering syntax on <a href="https://docs.kuzzle.io/koncorde/" target="_blank">Kuzzle DSL</a></em>
              </p>
            </div>
          </div>
        </div>

        <div class="row">
          <div :style="notifStyle" id="notification-container" ref="notificationContainer" class="col s8">
            <div v-if="notifications.length">
              <ul class="collapsible" v-collapsible data-collapsible="expandable">
                <notification
                  v-for="(notification, i) in notifications"
                  :key="i"
                  :notification="notification">
                </notification>
              </ul>
            </div>
          </div>

          <LastNotification
            v-if="notifications.length"
            :lastNotification="lastNotification">
          </LastNotification>

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
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      subscribed: false,
      room: null,
      filters: {},
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
  created() {
    window.addEventListener('scroll', this.handleScroll)
  },
  async mounted() {
    this.notifications = []
    const response = await getMappingDocument(this.collection, this.index)
    this.collectionMapping = response[this.index].mappings[this.collection].properties
  },
  async destroyed() {
    this.reset()
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room)
    }
    window.removeEventListener('scroll', this.handleScroll)
  },
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
  methods: {
    canSubscribe,
    onFiltersUpdated(newFilters) {
      filterManager.saveToRouter(
        filterManager.stripDefaultValuesFromFilter(newFilters),
        this.$router
      )
      this.toggleSubscription()
    },
    // basicSearch(filters) {
    //   if (!filters) {
    //     this.$router.push({ query: { basicFilter: '' } })
    //     return
    //   }

    //   let basicFilter = JSON.stringify(filters)
    //   this.$router.push({ query: { basicFilter } })
    // },
    // rawSearch(filters) {
    //   if (!filters) {
    //     this.$router.push({ query: { rawFilter: '' } })
    //     return
    //   }

    //   let rawFilter = JSON.stringify(filters)
    //   this.$router.push({ query: { rawFilter } })
    // },
    // refreshSearch() {
    //   this.$router.push({ query: { ...this.$route.query } })
    // },
    toggleSubscription() {
      if (!this.subscribed) {
        window.Notification.requestPermission()
        this.subscribe()
      } else {
        this.subscribed = false
        this.unsubscribe(this.room)
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
        const room = await this.$kuzzle
          .realtime
          .subscribe(
            this.index,
            this.collection,
            filterManager.toRealtimeQuery(this.filters),
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
