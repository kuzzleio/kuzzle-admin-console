<template>
  <div class="Watch">
    <b-container>
      <div class="Watch-flexContainer">
        <b-row>
          <b-col cols="10">
            <headline>
              <span class="code" :title="collection">{{
                truncateName(collection, 20)
              }}</span>
            </headline>
          </b-col>
          <b-col class="text-right">
            <collection-dropdown
              active-view="realtime"
              class="icon-medium icon-black"
              :index="index"
              :collection="collection"
              @list="$router.push({ name: 'DocumentList' })"
              @column="$router.push({ name: 'DocumentList' })"
            />
          </b-col>
        </b-row>
        <!--  -->
        <b-card v-if="!canSubscribe(index, collection)">
          <b-row>
            <b-col cols="2">
              <i class="fa fa-6x fa-lock text-secondary" aria-hidden="true" />
            </b-col>
            <b-col cols="10">
              <h2>
                You are not allowed to watch realtime messages on collection
                <strong>{{ collection }}</strong> of index
                <strong>{{ index }}</strong
                ><br />
              </h2>
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
            </b-col>
          </b-row>
        </b-card>

        <div v-else class="Watch-container">
          <filters
            submit-button-label="Subscribe"
            advanced-query-label="Click to open the filter builder"
            :current-filter="currentFilter"
            :available-operands="realtimeFilterOperands"
            :quick-filter-enabled="false"
            :sorting-enabled="false"
            :toggle-auto-complete="false"
            :collection-mapping="collectionMapping"
            @filters-updated="onFiltersUpdated"
            @reset="onReset"
          />
          <b-card class="mt-3">
            <template v-slot:header>
              <b-button
                class="mr-2"
                :variant="subscribed ? 'outline-primary' : 'primary'"
                @click="toggleSubscription"
              >
                <i
                  :class="{ 'fa-play': !subscribed, 'fa-pause': subscribed }"
                  class="fa mr-2"
                />
                {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
              </b-button>
              <b-button class="mr-2" variant="outline-secondary" @click="clear"
                ><i class="far fa-trash-alt mr-2" />Clear messages</b-button
              >
            </template>

            <b-row v-if="!subscribed && !notifications.length">
              <b-col cols="4" class="text-center">
                <i
                  class="fa fa-5x fa-paper-plane text-secondary mt-3"
                  aria-hidden="true"
                />
              </b-col>
              <b-col cols="6">
                <h3>
                  You did not subscribe yet to the collection
                  <strong>{{ collection }}</strong
                  ><br />
                </h3>
                <p>
                  <em
                    >Learn more about real-time filtering syntax on
                    <a href="https://docs.kuzzle.io/koncorde/" target="_blank"
                      >Koncorde</a
                    ></em
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
                <i
                  class="fa fa-5x fa-hourglass-half text-secondary"
                  aria-hidden="true"
                />
              </b-col>
              <b-col cols="6"
                ><h2>
                  Waiting for notifications matching your filters ...
                </h2>
                <p>
                  <em
                    >Learn more about real-time filtering syntax on
                    <a href="https://docs.kuzzle.io/koncorde/" target="_blank"
                      >Koncorde</a
                    ></em
                  >
                </p></b-col
              >
            </b-row>

            <b-alert variant="warning" :show="!!warning.message">{{
              warning.message
            }}</b-alert>

            <b-row v-if="notifications.length">
              <b-col
                cols="8"
                id="notification-container"
                ref="notificationContainer"
                :style="notifStyle"
                class="Watch--notifications col s8"
              >
                <div v-if="notifications.length">
                  <notification
                    v-for="(notification, i) in notifications"
                    :key="i"
                    :notification="notification"
                  />
                </div>
              </b-col>
              <b-col>
                <h5>Latest notification :</h5>
                <div class="lastNotification-body">
                  <p
                    v-json-formatter="{
                      content: {
                        id: lastNotification.source.id,
                        body: lastNotification.source.body,
                        meta: lastNotification.source.meta,
                        volatile: lastNotification.source.volatile
                      },
                      open: true
                    }"
                  />
                </div>
              </b-col>
            </b-row>
          </b-card>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import collapsible from '../../../directives/Materialize/collapsible.directive'
import Notification from '../Realtime/Notification'
import CollectionDropdown from '../Collections/Dropdown'
import Filters from '../../Common/Filters/Filters'
import * as filterManager from '../../../services/filterManager'
import { canSubscribe } from '../../../services/userAuthorization'
import { truncateName } from '@/utils'
import JsonFormatter from '../../../directives/json-formatter.directive'

import Vue from 'vue'

export default {
  name: 'CollectionWatch',
  directives: {
    collapsible,
    JsonFormatter
  },
  components: {
    Notification,
    CollectionDropdown,
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
      notifications: [
        {
          text: 'Received volatile message',
          icon: 'send',
          class: 'message-volatile',
          source: {
            meta: { author: '-1', createdAt: 1583854413073 },
            body: {
              lol: 'this is a message',
              _kuzzle_info: { author: '-1', createdAt: 1583854413073 }
            }
          },
          expanded: false,
          empty: false,
          timestamp: 1583854413071
        }
      ],
      notificationsLengthLimit: 50,
      warning: { message: '', count: 0, lastTime: null, info: false },
      notifStyle: {},
      scrollDown: true,
      collectionMapping: {}
    }
  },
  computed: {
    lastNotification() {
      if (this.notifications.length) {
        return this.notifications[this.notifications.length - 1]
      }
      return {
        source: {
          id: null,
          body: null,
          meta: null,
          volatile: null
        }
      }
    }
  },
  methods: {
    canSubscribe,
    truncateName,
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
          notification.result._source &&
          notification.result._source._kuzzle_info &&
          Object.keys(notification.result._source._kuzzle_info).length > 0
        ) {
          messageItem.source.meta = notification.result._source._kuzzle_info
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
    handleNotification(result) {
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

      this.notifications.unshift(this.notificationToMessage(result))
      // this.handleWebNotification(
      //   this.notifications[this.notifications.length - 1].text
      // )
      // this.lastNotification = this.notifications[this.notifications.length - 1]

      // this.makeAutoScroll()
    },
    async subscribe() {
      try {
        const realtimeQuery = filterManager.toRealtimeQuery(this.currentFilter)
        const room = await this.$kuzzle.realtime.subscribe(
          this.index,
          this.collection,
          realtimeQuery,
          this.handleNotification,
          this.subscribeOptions
        )
        this.subscribed = true
        this.room = room
      } catch (err) {
        this.room = null
        this.subscribed = false
        this.$store.direct.commit.toaster.setToast({ text: err.message })
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
    }
    // handleWebNotification(text) {
    //   const notif = new window.Notification('Kuzzle Admin Console', {
    //     body: text + ' in ' + this.index + ' ' + this.collection,
    //     icon: '/static/favicon/favicon-32x32.png'
    //   })
    //   setTimeout(notif.close.bind(notif), 5000)
    // }
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
    // this.notifications = []
  },
  async destroyed() {
    this.reset()
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room)
    }
    window.removeEventListener('scroll', this.handleScroll)
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
