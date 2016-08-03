<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Watch
      <collection-dropdown
        class="icon-medium icon-black"
        :index="index"
        :collection="collection">
      </collection-dropdown>
    </headline>

    <div class="notification-container">
      <div class="row">
        <div class="col s12">
          <button class="btn waves-effect waves-light" @click="manageSub(index, collection)">
            <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa"></i>&nbsp;{{subscribed ? 'Unsubscribe' : 'Subscribe'}}
          </button>
          <button class="btn-flat waves-effect waves-grey" @click="clear">
            <i class="fa fa-trash"></i>&nbsp;Clear console
          </button>
        </div>

        <div class="col s12">

          <div class="inline-alert red lighten-4" v-if="!subscribed">
            <i class="fa fa-pause"></i>
            <span>You are not currently receiving realtime messages from kuzzle</span>
          </div>

          <div class="inline-alert green lighten-4" v-if="subscribed">
            <i class="fa fa-play"></i>
            <span>You are receiving realtime messages from kuzzle with filters: </span>
            <pre class="filter-preview">{{filter | json}}</pre>
          </div>

          <ul class="collapsible" v-collapsible data-collapsible="expandable">
            <li v-for="notification in notifications">
              <notification :notification="notification"></notification>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss" media="screen" scoped>
  .head {
    float: left;
    font-size: 2rem;
    margin-top: 0;
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

  .notification-container {
    padding-top: 10px;
  }

  .collapsible {
    border-width: 0;
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import JsonFormatter from '../../../directives/json-formatter.directive'
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
        filter: {foo: 'bar'},
        subscribed: false,
        room: null
      }
    },
    directives: [
      jQueryCollapsible,
      JsonFormatter
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
