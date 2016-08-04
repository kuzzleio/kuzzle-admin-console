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

      <div id="notification-controls-fixed" class="closed">
        <div class="row">
          <div class="col s10">
            <button class="btn waves-effect waves-light" :class="subscribed ? 'tertiary' : 'primary'" @click="manageSub(index, collection)">
              <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa left"></i>
              {{subscribed ? 'Unsubscribe' : 'Subscribe'}}
            </button>
            <button class="btn-flat waves-effect waves-grey" @click="clear">
              <i class="fa fa-trash-o left"></i>
              Clear messages
            </button>
          </div>

          <div class="col s2 right-align">
            <input type="checkbox" v-model="scrollGlueActive" class="filled-in" id="filled-in-box-2" />
            <label for="filled-in-box-2">Scroll on new messages</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="subscription-controls">
          <div class="col s10">
            <button class="btn waves-effect waves-light" :class="subscribed ? 'tertiary' : 'primary'" @click="manageSub(index, collection)">
              <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa left"></i>
              {{subscribed ? 'Unsubscribe' : 'Subscribe'}}
            </button>
            <button class="btn-flat waves-effect waves-grey " @click="clear">
              <i class="fa fa-trash-o left"></i>
              Clear messages
            </button>
          </div>

          <div class="col s2 right-align">
            <input type="checkbox" v-model="scrollGlueActive" class="filled-in" id="filled-in-box" />
            <label for="filled-in-box">Scroll on new messages</label>
          </div>
        </div>

        <div class="col s12">
          <div v-if="!notifications.length" class="inline-alert grey lighten-3">
            You have not received any notification yet
          </div>
        </div>
      </div>
    </div>

    <div id="notification-container" v-scroll-glue:element-tag.body="{items: notifications, active: scrollGlueActive}">

      <ul class="collapsible" v-collapsible data-collapsible="expandable" v-if="notifications.length">
        <li v-for="notification in notifications">
          <notification :notification="notification" v-if="notification.index === index && notification.collection === collection"></notification>
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
    transition: all .1s;
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
  import { subscribe, unsubscribe, clear } from '../../../vuex/modules/data/actions'
  import { notifications } from '../../../vuex/modules/data/getters'
  import Notification from '../Realtime/Notification'
  import CollectionDropdown from '../Collections/Dropdown'

  export default {
    name: 'CollectionWatch',
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        filter: {},
        scrollGlueActive: true,
        subscribed: false,
        room: null,
        scrollListener: null
      }
    },
    ready () {
      let scrolled = false
      let toolbar = document.getElementById('notification-controls-fixed')

      window.onscroll = function () {
        scrolled = true
      }

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
      if (this.scrollListener !== null) {
        clearInterval(this.scrollListener)
      }
      if (this.subscribed) {
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
      manageSub (index, collection) {
        if (!this.subscribed) {
          this.subscribed = true
          this.room = this.subscribe(this.filter, index, collection)
        } else {
          this.subscribed = false
          this.unsubscribe(this.room)
        }
      }
    },
    vuex: {
      actions: {
        subscribe,
        unsubscribe,
        clear
      },
      getters: {
        notifications
      }
    }
  }
</script>
