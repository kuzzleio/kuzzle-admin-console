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
          <button class="btn waves-effect waves-light" @click="clear">
            <i class="fa fa-trash"></i>&nbsp;Clear console
          </button>
        </div>
        <div class="col s12">
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

<style type="text/css" media="screen" scoped>
  .head {
    float: left;
    font-size: 2rem;
    margin-top: 0;
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
        subscribed: false,
        room: null
      }
    },
    directives: [
      jQueryCollapsible
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
          this.room = this.subscribe(index, collection)
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
