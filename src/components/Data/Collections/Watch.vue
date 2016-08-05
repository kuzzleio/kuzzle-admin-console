<template>
  <div>
    <div class="wrapper">
      <headline>
        {{collection}} - Watch
        <collection-dropdown
          class="icon-medium icon-black"
          :index="index"
          :collection="collection">
        </collection-dropdown>
      </headline>

      <!-- subscription control bar fixed -->
      <div id="notification-controls-fixed" class="closed">
        <div class="row">
          <div class="col s3">
            <button class="btn waves-effect waves-light" :class="subscribed ? 'tertiary' : 'primary'" @click="manageSub()">
              <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa left"></i>
              {{subscribed ? 'Unsubscribe' : 'Subscribe'}}
            </button>
            <button class="btn-flat waves-effect waves-grey" @click="clear">
              <i class="fa fa-trash-o left"></i>
              Clear messages
            </button>
          </div>

          <div class="col s7 right-align">
            <i
              :class="warning.info ? 'fa-info-circle blue-text' : 'fa-exclamation-triangle deep-orange-text'"
              class="fa"
              v-if="warning.message"
              aria-hidden="true">
            </i>
            <span :class="warning.info ? 'blue-text' : 'deep-orange-text'" v-if="warning.message" >{{warning.message}}</span>
            &nbsp;
          </div>

          <div class="col s2 right-align">
            <input type="checkbox" v-model="scrollGlueActive" class="filled-in" id="filled-in-box-2" />
            <label for="filled-in-box-2">Scroll on new messages</label>
          </div>
        </div>
      </div>
      <!-- /subscription control bar fixed -->

      <div class="row">
        <!-- subscription controls in page flow -->
        <div class="col s3">
          <button class="btn waves-effect waves-light" :class="subscribed ? 'tertiary' : 'primary'" @click="manageSub()">
            <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa left"></i>
            {{subscribed ? 'Unsubscribe' : 'Subscribe'}}
          </button>
          <button class="btn-flat waves-effect waves-grey " @click="clear">
            <i class="fa fa-trash-o left"></i>
            Clear messages
          </button>
        </div>

        <div class="col s7 right-align">
          <i
            :class="warning.info ? 'fa-info-circle blue-text' : 'fa-exclamation-triangle deep-orange-text'"
            class="fa"
            v-if="warning.message"
            aria-hidden="true">
          </i>
          <span :class="warning.info ? 'blue-text' : 'deep-orange-text'" v-if="warning.message" >{{warning.message}}</span>
          &nbsp;
        </div>

        <div class="col s2 right-align">
          <input type="checkbox" v-model="scrollGlueActive" class="filled-in" id="filled-in-box" />
          <label for="filled-in-box">Scroll on new messages</label>
        </div>
        <!-- /subscription controls in page flow  -->

        <div class="col s12">
          <div v-if="!notifications.length" class="inline-alert grey lighten-3">
            You have not received any notification yet
          </div>
        </div>
      </div>
    </div>

    <div id="notification-container"
         v-if="notifications.length"
         v-scroll-glue:element-tag.body="{items: notifications, active: scrollGlueActive}">
      <ul class="collapsible" v-collapsible data-collapsible="expandable">
        <li v-for="notification in notifications">
          <notification
            :notification="notification">
          </notification>
        </li>
      </ul>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss" media="screen">
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

    z-index: 10;
    overflow: hidden;
    position: fixed;
    top: 100px;
    left: 240px;
    line-height: 40px;
    height: 65px;
    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.2);
    padding: 13px 5px;
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
      background-color: #f5f5f5;

      .collapsible-header {
        background-color: #f5f5f5;
      }
    }
  }

  .filter-preview {
    font-size: 0.8rem;
    margin-bottom: 0;
    border-top: solid 1px rgba(255, 255, 255, 0.4);
    padding-top: 10px;
  }

  button {
    &.btn-flat {
      &:focus {
        background-color: #EEE;
      }
    }
  }

  .collapsible {
    border-width: 0;
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import JsonFormatter from '../../../directives/json-formatter.directive'
  import ScrollGlue from '../../../directives/scroll-glue.directive'
  import jQueryCollapsible from '../../Materialize/collapsible'
  import Notification from '../Realtime/Notification'
  import CollectionDropdown from '../Collections/Dropdown'
  import kuzzle from '../../../services/kuzzle'

  let notificationToMessage = notification => {
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
  }

  export default {
    name: 'CollectionWatch',
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        subscribed: false,
        room: null,
        filter: {},
        subscribeOptions: {scope: 'all', users: 'all', state: 'all'},
        notifications: [],
        notificationsLengthLimit: 50,
        warning: {message: '', count: 0, lastTime: null, info: false},
        scrollGlueActive: true,
        scrollListener: null
      }
    },
    watch: {
      index: function () {
        // trigged when user changed the index of watch data page
        this.notifications = []
        this.warning.message = ''
        this.warning.count = 0

        if (this.subscribed) {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      },
      collection: function () {
        // trigged when user changed the collection of watch data page
        this.notifications = []
        this.warning.message = ''
        this.warning.count = 0

        if (this.subscribed) {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      }
    },
    ready () {
      // display the toolbar when user scroll (or when scroll glue is active)
      let scrolled = false
      let toolbar = document.getElementById('notification-controls-fixed')

      this.notifications = []

      window.onscroll = function () {
        scrolled = true
      }

      // delay position checking in an interval instead of onscroll event to reduce lags
      this.scrollListener = setInterval(function () {
        if (scrolled) {
          scrolled = false

          if (window.scrollY > 130 && toolbar.classList !== '') {
            toolbar.classList = ''
          } else if (toolbar.classList !== 'closed') {
            toolbar.classList = 'closed'
          }
        }
      }, 100)
    },
    destroyed () {
      // trigged when user leave watch data page
      if (this.scrollListener !== null) {
        clearInterval(this.scrollListener)
      }
      if (this.subscribed) {
        this.subscribed = false
        this.unsubscribe(this.room)
      }
    },
    directives: [
      jQueryCollapsible,
      JsonFormatter,
      ScrollGlue
    ],
    components: {
      Notification,
      CollectionDropdown,
      Headline
    },
    methods: {
      manageSub () {
        if (!this.subscribed) {
          this.subscribed = true
          this.room = this.subscribe(this.filter, this.index, this.collection)
        } else {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      },
      subscribe () {
        return kuzzle.dataCollectionFactory(this.collection, this.index)
          .subscribe(this.filter, this.subscribeOptions, (error, result) => {
            if (error) {
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

              // two shift to have a display effect on even:odd items
              this.notifications.shift()
              this.notifications.shift()
            }

            this.notifications.push(notificationToMessage(result))
          })
      },
      unsubscribe (room) {
        this.warning.message = ''
        this.warning.count = 0

        room.unsubscribe()
      },
      clear () {
        this.warning.message = ''
        this.notifications = []
      }
    }
  }
</script>
