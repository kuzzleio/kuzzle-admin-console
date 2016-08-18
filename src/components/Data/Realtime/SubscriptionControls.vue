<template>
  <div>
    <div class="col s5 m5 l4">
      <button
        class="btn btn-small waves-effect waves-light"
        v-title="{active: !canSubscribe(index, collection), title: 'You are not allowed to watch realtime messages on collection ' + collection + ' of index ' + index}"
        :class="{unauthorized: !canSubscribe(index, collection), 'tertiary': subscribed, 'primary': !subscribed}"
        @click.prevent="canSubscribe(index, collection) && toggleSubscription()">
        <i :class="{'fa-play': !subscribed, 'fa-pause': subscribed}" class="fa left"></i>
        {{subscribed ? 'Unsubscribe' : 'Subscribe'}}
      </button>
      <button class="btn-flat btn-small  waves-effect waves-grey " @click.prevent="clear()">
        <i class="fa fa-trash-o left"></i>
        Clear messages
      </button>
    </div>

    <div class="col s4 m4 l6 right-align truncate">
      <i
        :class="warning.info ? 'fa-info-circle blue-text' : 'fa-exclamation-triangle deep-orange-text'"
        class="fa"
        v-if="warning.message"
        aria-hidden="true">
      </i>
      <span :class="warning.info ? 'blue-text' : 'deep-orange-text'" v-if="warning.message">{{warning.message}}</span>
      &nbsp;
    </div>

    <div class="col s3 m3 l2 right-align truncate">
      <input type="checkbox" v-model="scrollGlueActive" class="filled-in" id="filled-in-box" />
      <label for="filled-in-box">Scroll on new messages</label>
    </div>
  </div>
</template>


<script>
  import {canSubscribe} from '../../../services/userAuthorization'
  import Title from '../../../directives/title.directive'

  export default {
    name: 'SubscriptionControls',
    props: {
      index: String,
      collection: String,
      warning: Object,
      subscribed: Boolean,
      scrollGlueActive: Boolean
    },
    directives: {
      Title
    },
    methods: {
      canSubscribe,
      toggleSubscription () {
        this.$dispatch('realtime-toggle-subscription')
      },
      clear () {
        this.$dispatch('realtime-clear-messages')
      }
    },
    ready () {
      this.$dispatch('realtime-scroll-glue', this.scrollGlueActive)
    },
    watch: {
      scrollGlueActive: function (value) {
        this.$dispatch('realtime-scroll-glue', value)
      }
    }
  }
</script>