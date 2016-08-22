<template>
  <div>
    <div class="wrapper">
      <headline>
        {{collection}}
        <collection-dropdown
          class="icon-medium icon-black"
          :index="index"
          :collection="collection">
        </collection-dropdown>
      </headline>

      <!-- subscription control bar fixed -->
      <div id="notification-controls-fixed" class="closed" v-scroll-glue="{spy: notifications, height: 290, active: scrollGlueActive}">
        <div class="row">
          <subscription-controls
            @realtime-toggle-subscription="toggleSubscription"
            @realtime-scroll-glue="setScrollGlue"
            @realtime-clear-messages="clear"
            :index="index"
            :collection="collection"
            :subscribed="subscribed"
            :scroll-glue-active="scrollGlueActive"
            :warning="warning">
          </subscription-controls>
        </div>
      </div>
      <!-- /subscription control bar fixed -->

      <collection-tabs></collection-tabs>

      <div class="card-panel" v-if="!canSubscribe(index, collection)">
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
            <p>
              You are not allowed to watch realtime messages on collection <strong>{{collection}}</strong> of index <strong>{{index}}</strong><br>
            </p>
            <p>
              <em>Learn more about security & permissions on <a href="http://kuzzle.io/guide/#permissions" target="_blank">http://kuzzle.io/guide</a></em>
            </p>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="card-panel card-header row-margin-bottom-0">
          <filters
            @filters-basic-search="basicSearch"
            @filters-raw-search="rawSearch"
            @filters-refresh-search="refreshSearch"
            label-search-button="Apply filters"
            label-complex-query="Quick search disabled, click to open filter builder"
            :available-filters="availableFilters"
            :quick-filter-enabled="false"
            :sorting-enabled="false"
            :raw-filter="rawFilter"
            :basic-filter="basicFilter"
            :format-from-basic-search="formatFromBasicSearch"
            :format-sort="formatSort"
            :set-basic-filter="setBasicFilter"
            :basic-filter-form="basicFilterForm">
          </filters>
        </div>

        <div class="card-panel card-body" v-show="subscribed || notifications.length">
          <div class="row realtime margin-bottom-0">
            <!-- subscription controls in page flow -->
            <subscription-controls
              @realtime-toggle-subscription="toggleSubscription"
              @realtime-scroll-glue="setScrollGlue"
              @realtime-clear-messages="clear"
              :index="index"
              :collection="collection"
              :subscribed="subscribed"
              :scroll-glue-active="scrollGlueActive"
              :warning="warning">
            </subscription-controls>
            <!-- /subscription controls in page flow  -->
          </div>
        </div>

        <div class="card-panel card-body" v-show="canSubscribe(index, collection) && !subscribed && !notifications.length">
          <div class="row valign-bottom empty-set">
            <div class="col s1 offset-s1">
              <i class="fa fa-6x fa-paper-plane grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s10">
              <p>
                You have not subscribed yet to the collection <strong>{{collection}}</strong><br>
                <em>Learn more about filtering syntax & real-time on <a href="http://kuzzle.io/guide/#filtering-syntax" target="_blank">http://kuzzle.io/guide</a></em>
              </p>
              <button class="btn btn-small primary waves-effect waves-light" @click="toggleSubscription()">
                <i class="fa left fa-play"></i>
                subscribe
              </button>
            </div>
          </div>
        </div>

        <div class="card-panel" v-show="canSubscribe(index, collection) && subscribed && !notifications.length">
          <div class="row valign-center empty-set empty-set-condensed">
            <div class="col s1 offset-s1">
              <i class="fa fa-5x fa-hourglass-half grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s10">
              <p>
                Waiting for notification matching your filters ...
              </p>
              <p>
                <em>Learn more about filtering syntax & real-time on <a href="http://kuzzle.io/guide/#filtering-syntax" target="_blank">http://kuzzle.io/guide</a></em>
              </p>
            </div>
          </div>
        </div>

        <div id="notification-container" v-if="notifications.length">
          <ul class="collapsible" v-collapsible data-collapsible="expandable">
            <li v-for="notification in notifications">
              <notification
                :notification="notification">
              </notification>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
  .head {
    float: left;
    font-size: 2rem;
    margin-top: 0;
  }

  .wrapper {
    position: relative;
  }

  #notification-controls-fixed {
    &.closed {
      padding: 0;
      height: 0;
      box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0);
      border-bottom-left-radius: 100%;
      border-bottom-right-radius: 100%;
    }

    z-index: 200;
    overflow: hidden;
    position: fixed;
    top: 50px;
    left: 240px;
    line-height: 20px;
    height: 50px;
    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.2);
    padding: 10px 5px;
    right: 0;
    background-color: #FFF;
    transition: all .3s;
  }

  #notification-container {
    li {
      font-family: monospace;
      font-size: 0.8rem;
    }
    li:nth-child(odd) {
      background-color: #F5F5F5;

      .collapsible-header {
        background-color: #F5F5F5;
      }
    }
  }

  .collapsible {
    border-width: 0;
  }
</style>

<script>
  import CollectionTabs from './Tabs'
  import Headline from '../../Materialize/Headline'
  import JsonFormatter from '../../../directives/json-formatter.directive'
  import ScrollGlue from '../../../directives/scroll-glue.directive'
  import jQueryCollapsible from '../../../directives/collapsible.directive'
  import Notification from '../Realtime/Notification'
  import SubscriptionControls from '../Realtime/SubscriptionControls'
  import CollectionDropdown from '../Collections/Dropdown'
  import Filters from '../../Common/Filters/Filters'
  import kuzzle from '../../../services/kuzzle'
  import { setBasicFilter } from '../../../vuex/modules/common/crudlDocument/actions'
  import { rawFilter, basicFilter, basicFilterForm } from '../../../vuex/modules/common/crudlDocument/getters'
  import { availableFilters, formatFromBasicSearch } from '../../../services/filterFormatRealtime'
  import {canSubscribe} from '../../../services/userAuthorization'

  export default {
    name: 'CollectionWatch',
    props: {
      index: String,
      collection: String
    },
    vuex: {
      actions: {
        setBasicFilter
      },
      getters: {
        rawFilter,
        basicFilter,
        basicFilterForm
      }
    },
    data () {
      return {
        subscribed: false,
        room: null,
        filters: {},
        availableFilters,
        formatFromBasicSearch,
        subscribeOptions: {scope: 'all', users: 'all', state: 'all'},
        notifications: [],
        notificationsLengthLimit: 50,
        warning: {message: '', count: 0, lastTime: null, info: false},
        scrollGlueActive: true,
        scrollListener: null
      }
    },
    watch: {
      index () {
        this.reset()
      },
      collection () {
        this.reset()
      }
    },
    ready () {
      this.notifications = []
    },
    destroyed () {
      // trigged when user leave watch data page
      if (this.scrollListener !== null) {
        clearInterval(this.scrollListener)
      }
      this.reset()
    },
    directives: [
      jQueryCollapsible,
      JsonFormatter,
      ScrollGlue
    ],
    components: {
      CollectionTabs,
      Notification,
      CollectionDropdown,
      SubscriptionControls,
      Filters,
      Headline
    },
    methods: {
      canSubscribe,
      basicSearch (filters) {
        if (!filters) {
          this.$router.go({query: {basicFilter: ''}})
          return
        }

        let basicFilter = JSON.stringify(filters)
        this.$router.go({query: {basicFilter}})
      },
      rawSearch (filters) {
        if (!filters) {
          this.$router.go({query: {rawFilter: ''}})
          return
        }

        let rawFilter = JSON.stringify(filters)
        this.$router.go({query: {rawFilter}})
      },
      refreshSearch () {
        this.$router.go({query: {...this.$route.query}})
      },
      setScrollGlue (value) {
        this.scrollGlueActive = value
      },
      toggleSubscription () {
        if (!this.subscribed) {
          this.subscribed = true
          this.room = this.subscribe(this.filters, this.index, this.collection)
        } else {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      },
      notificationToMessage (notification) {
        var messageItem = {
          id: notification.result._id,
          text: '',
          icon: 'file',
          index: notification.index || '',
          collection: notification.collection || '',
          'class': '',
          source: {
            source: notification.result._source,
            metadata: notification.metadata
          },
          expanded: false,
          canEdit: true
        }

        switch (notification.action) {
          case 'publish':
            messageItem.text = 'Received volatile message'
            messageItem.icon = 'send'
            messageItem.class = 'message-volatile'
            messageItem.canEdit = false
            break
          case 'create':
          case 'createOrReplace':
            messageItem.icon = 'file'

            if (notification.state === 'done') {
              messageItem.text = 'Created new document'
              messageItem.class = 'message-created-updated-doc'
            } else if (notification.state === 'pending') {
              messageItem.text = 'Creating new document'
              messageItem.class = 'message-pending'
            }
            break

          case 'update':
            messageItem.text = 'Updated document'
            messageItem.icon = 'file'
            messageItem.class = 'message-created-updated-doc'
            break

          case 'delete':
            messageItem.icon = 'remove'
            messageItem.canEdit = false
            if (notification.state === 'done') {
              messageItem.text = 'Deleted document'
              messageItem.class = 'message-deleted-doc'
            } else if (notification.state === 'pending') {
              messageItem.text = 'Deleting document'
              messageItem.class = 'message-pending'
            }
            break

          case 'on':
            messageItem.text = 'A new user is listening to this room'
            messageItem.icon = 'user'
            messageItem.class = 'message-user'
            messageItem.canEdit = false
            messageItem.source = notification.metadata
            break

          case 'off':
            messageItem.text = 'A user exited this room'
            messageItem.icon = 'user'
            messageItem.class = 'message-user'
            messageItem.source = notification.metadata
            messageItem.canEdit = false
            break
        }

        messageItem.timestamp = notification.timestamp
        return messageItem
      },
      handleMessage (error, result) {
        if (error) {
          this.warning.message = error.message
          return
        }

        if (this.notifications.length > this.notificationsLengthLimit) {
          if (this.warning.message === '') {
            this.warning.info = true
            this.warning.message = 'Older notifications are discarded due to huge amount of items displayed'
          }

          if (Date.now() - this.warning.lastTime < 50) {
            this.warning.count++
          }

          this.warning.lastTime = Date.now()

          if (this.warning.count >= 100) {
            this.warning.info = false
            this.warning.message = 'You are receiving too many messages, try to specify a filter to reduce the amount of messages'
          }

          // two shift instead of one to have a visual effect on items in the view
          this.notifications.shift()
          this.notifications.shift()
        }

        this.notifications.push(this.notificationToMessage(result))
      },
      subscribe () {
        return kuzzle
          .dataCollectionFactory(this.collection, this.index)
          .subscribe(this.filters, this.subscribeOptions, this.handleMessage)
      },
      unsubscribe (room) {
        this.warning.message = ''
        this.warning.count = 0

        room.unsubscribe()
      },
      reset () {
        // trigged when user changed the collection of watch data page
        this.notifications = []
        this.warning.message = ''
        this.warning.count = 0

        if (this.subscribed) {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      },
      clear () {
        this.warning.message = ''
        this.notifications = []
      }
    },
    route: {
      data () {
        let filters = {}

        if (this.basicFilter) {
          filters = formatFromBasicSearch(this.basicFilter)
        } else if (this.rawFilter) {
          filters = this.rawFilter
        }

        this.filters = filters
      }
    }
  }
</script>
