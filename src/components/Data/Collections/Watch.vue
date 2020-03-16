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
          <b-card class="Filters" :no-body="!advancedFiltersVisible">
            <template v-slot:header>
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
                    v-if="complexFilterActive && !advancedFiltersVisible"
                    data-cy="Watch-filtersPill"
                    pill
                    variant="warning"
                    class="ml-2 p-2"
                    >Filters are being applied</b-badge
                  >
                </b-col>
                <b-col class="text-right">
                  <b-button
                    class="ml-2 d-inline-block"
                    data-cy="Watch-subscribeBtn"
                    type="submit"
                    :variant="subscribed ? 'danger' : 'primary'"
                    @click.prevent="toggleSubscription"
                  >
                    <template v-if="!subscribed">
                      <i class="fa left fa-play mr-2" />Subscribe
                    </template>
                    <template v-else
                      ><i class="fa left fa-pause mr-2" />Unsubscribe</template
                    >
                  </b-button>
                  <b-button
                    class="ml-2 d-inline-block"
                    data-cy="QuickFilter-resetBtn"
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
              <raw-filter
                ref="rawFilter"
                submit-button-label="Subscribe"
                :sorting-enabled="false"
                :action-buttons-visible="false"
                :refresh-ace="advancedFiltersVisible"
                @change="onRawFilterChange"
            /></template>
          </b-card>
          <b-card class="mt-3">
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
            <template v-if="notifications.length">
              <b-row class="mb-3">
                <b-col cols="8" class="text-secondary vertical-align">
                  Received {{ notifications.length }} notifications
                </b-col>
                <b-col class="text-right"
                  ><b-button
                    title="Clear messages"
                    variant="outline-secondary"
                    @click="resetNotifications"
                    ><i class="fas fa-trash-alt mr-2"></i>Clear all
                    notifications</b-button
                  ></b-col
                ></b-row
              >

              <b-row>
                <b-col
                  cols="8"
                  id="notification-container"
                  ref="notificationContainer"
                  :style="notifStyle"
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
                    <b-card-body>
                      <b-badge
                        pill
                        variant="info"
                        class="mr-2"
                        title="controller : action"
                        >{{ lastNotification.controller }} :
                        {{ lastNotification.action }}</b-badge
                      >

                      <!-- <ul>
                        <li>
                          Controller:
                          <span class="code">
                            {{ lastNotification.controller }}</span
                          >
                        </li>
                        <li>
                          Action:
                          <span class="code">
                            {{ lastNotification.action }}</span
                          >
                        </li>
                        <li>
                          Index:
                          <span class="code">
                            {{ lastNotification.index }}</span
                          >
                        </li>
                        <li>
                          Collection:
                          <span class="code">
                            {{ lastNotification.collection }}</span
                          >
                        </li>
                      </ul> -->
                      <p
                        class="mt-3"
                        v-json-formatter="{
                          content: lastNotification.result,
                          open: true
                        }"
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
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import collapsible from '../../../directives/Materialize/collapsible.directive'
import Notification from '../Realtime/Notification'
import CollectionDropdown from '../Collections/Dropdown'
import RawFilter from '../../Common/Filters/RawFilter'
import * as filterManager from '../../../services/filterManager'
import { canSubscribe } from '../../../services/userAuthorization'
import { truncateName } from '@/utils'
import JsonFormatter from '../../../directives/json-formatter.directive'
import moment from 'moment'
import { isEqual } from 'lodash'

export default {
  name: 'CollectionWatch',
  directives: {
    collapsible,
    JsonFormatter
  },
  components: {
    Notification,
    CollectionDropdown,
    RawFilter,
    Headline
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      advancedFiltersVisible: false,
      subscribed: false,
      room: null,
      currentFilter: new filterManager.Filter(),
      // realtimeFilterOperands: filterManager.realtimeFilterOperands,
      subscribeOptions: { scope: 'all', users: 'all', state: 'all' },
      notifications: [],
      notificationsLengthLimit: 50,
      warning: { message: '', count: 0, lastTime: null, info: false },
      notifStyle: {}
      // scrollDown: true,
      // collectionMapping: {}
    }
  },
  computed: {
    complexFilterActive() {
      return this.currentFilter.raw && !isEqual(this.currentFilter.raw, {})
    },
    lastNotification() {
      if (this.notifications.length) {
        return this.notifications[0]
      }
      return {}
    },
    lastNotificationTime() {
      if (!this.notifications.length) {
        return null
      }
      return moment(this.lastNotification.timestamp).format('H:mm:ss')
    },
    realtimeQuery() {
      return filterManager.toRealtimeQuery(this.currentFilter)
    }
  },
  methods: {
    canSubscribe,
    truncateName,
    onRawFilterChange(content) {
      this.$log.debug('Raw filter changed', content)
      if (content) {
        this.currentFilter.active = filterManager.ACTIVE_RAW
        this.currentFilter.raw = content
      }
    },
    // onFiltersUpdated(newFilters) {
    //   this.currentFilter = newFilters
    //   filterManager.saveToRouter(
    //     filterManager.stripDefaultValuesFromFilter(newFilters),
    //     this.$router
    //   )
    //   this.toggleSubscription()
    // },
    async toggleSubscription() {
      if (!this.subscribed) {
        await this.subscribe()
      } else {
        await this.unsubscribe(this.room)
      }
    },
    // makeAutoScroll() {
    //   // Auto scroll
    //   if (this.scrollDown) {
    //     const div = this.$refs.notificationContainer
    //     setTimeout(() => {
    //       div.scrollTop = div.scrollHeight
    //     }, 0)
    //   }
    // },
    handleNotification(result) {
      if (this.notifications.length > this.notificationsLengthLimit) {
        if (this.warning.message === '') {
          this.warning.info = true
          this.warning.message =
            'Older notifications are discarded due to the amount of items displayed'
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

      this.notifications.unshift(result) //this.notificationToMessage(result)
      // this.handleWebNotification(
      //   this.notifications[this.notifications.length - 1].text
      // )
      // this.lastNotification = this.notifications[this.notifications.length - 1]

      // this.makeAutoScroll()
    },
    async subscribe() {
      try {
        const room = await this.$kuzzle.realtime.subscribe(
          this.index,
          this.collection,
          this.realtimeQuery,
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
    resetFilters() {
      if (this.subscribed) {
        this.subscribed = false
        this.unsubscribe(this.room)
      }
      if (this.$refs.rawFilter) {
        this.$refs.rawFilter.resetSearch()
      }
    },
    resetNotifications() {
      this.notifications = []
      this.warning.message = ''
      this.warning.count = 0
    },
    reset() {
      // trigged when user changed the collection of watch data page
      this.resetFilters()
      this.resetNotifications()
    },
    computeNotifHeight() {
      // Vue.nextTick(() => {
      //   const mainNavHeight = document.getElementById('mainnav').offsetHeight
      //   const searchFilter = document.getElementsByClassName('Filters')[0]
      //     .offsetHeight
      //   const subCtrl = this.$refs.subscribeControl.offsetHeight
      //   const notifHeight =
      //     document.body.offsetHeight - (mainNavHeight + searchFilter + subCtrl)
      //   this.notifStyle = { maxHeight: notifHeight + 'px', overflowY: 'auto' }
      // })
    }
    // setScrollDown(v) {
    //   this.scrollDown = v
    // }
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
    }
    // subscribed() {
    //   this.computeNotifHeight()
    // }
  },
  // created() {
  //   window.addEventListener('scroll', this.handleScroll)
  // },
  async mounted() {
    // this.notifications = []
  },
  async destroyed() {
    this.reset()
    if (this.room) {
      await this.$kuzzle.realtime.unsubscribe(this.room)
    }
    // window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.Watch {
  margin-bottom: 3em;
}

.Notification {
  border-radius: 0;
  border-width: 0 1px 0 1px;
  & .card-header {
    border-radius: 0;
  }

  &:first-child {
    border-radius: 0.25rem 0.25rem 0 0;
    border-width: 1px 1px 0 1px;
  }
  &:last-child {
    border-radius: 0 0 0.25rem 0.25rem;
    border-width: 0 1px 1px 1px;
  }
  &:only-child {
    border-radius: 0.25rem 0.25rem 0.25rem 0.25rem;
    border-width: 1px 1px 1px 1px;
  }
}
</style>
