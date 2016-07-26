<template>
  <div class="row">
    <div class="col s12">
      <p class="head">{{$route.params.collection}} - Watch </p>
    </div>
  </div>

  <div class="notification-container">
    <div class="row">
      <div class="col s12">
        <button class="btn waves-effect waves-light" @click="manageSub($route.params.index, $route.params.collection)">
          <i v-bind:class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa"></i>&nbsp;{{subscribed ? 'Unsubscribe' : 'Subscribe'}}
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
  import jQueryCollapsible from '../../Materialize/collapsible'
  import { subscribe, unsubscribe, clear } from '../../../vuex/modules/data/actions'
  import { notifications } from '../../../vuex/modules/data/getters'
  import Notification from './Notification'

  export default {
    data () {
      return {
        subscribed: false
      }
    },
    directives: [
      jQueryCollapsible
    ],
    components: {
      Notification
    },
    methods: {
      manageSub (index, collection) {
        if (!this.subscribed) {
          this.subscribed = true
          this.subscribe(index, collection)
        } else {
          this.subscribed = false
          this.unsubscribe()
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