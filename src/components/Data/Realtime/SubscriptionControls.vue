<template>
  <div class="valign-center">
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
        :class="warning.info ? 'fa-info-circle blue-text' : 'fa-exclamation-triangle text-warning'"
        class="fa"
        v-if="warning.message"
        aria-hidden="true">
      </i>
      <span :class="warning.info ? 'blue-text' : 'text-warning'" v-if="warning.message">{{warning.message}}</span>
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
      subscribed: Boolean
    },
    data () {
      return {
        scrollGlueActive: true
      }
    },
    directives: {
      Title
    },
    methods: {
      canSubscribe,
      toggleSubscription () {
        this.$emit('realtime-toggle-subscription')
      },
      clear () {
        this.$emit('realtime-clear-messages')
      }
    },
    mounted () {
      this.$emit('realtime-scroll-glue', this.scrollGlueActive)
    },
    watch: {
      scrollGlueActive (value) {
        this.$emit('realtime-scroll-glue', value)
      }
    }
  }
</script>
