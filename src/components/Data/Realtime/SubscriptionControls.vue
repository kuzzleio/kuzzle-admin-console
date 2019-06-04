<template>
  <div class="valign-center">
    <div class="col s5 m5 l4">
      <button
        v-title="{active: !canSubscribe(index, collection), title: 'You are not allowed to watch realtime messages on collection ' + collection + ' of index ' + index}"
        class="btn btn-small waves-effect waves-light"
        :class="{unauthorized: !canSubscribe(index, collection), 'tertiary': subscribed, 'primary': !subscribed}"
        @click.prevent="canSubscribe(index, collection) && toggleSubscription()"
      >
        <i
          :class="{'fa-play': !subscribed, 'fa-pause': subscribed}"
          class="fa left"
        />
        {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
      </button>
      <button
        class="btn-flat btn-small  waves-effect waves-grey "
        @click.prevent="clear()"
      >
        <i class="fa fa-trash-o left" />
        Clear messages
      </button>
    </div>

    <div class="col s4 m4 l6 right-align truncate">
      <i
        v-if="warning.message"
        :class="warning.info ? 'fa-info-circle blue-text' : 'fa-exclamation-triangle text-warning'"
        class="fa"
        aria-hidden="true"
      />
      <span
        v-if="warning.message"
        :class="warning.info ? 'blue-text' : 'text-warning'"
      >{{ warning.message }}</span>
      &nbsp;
    </div>

    <div class="col s3 m3 l2 right-align truncate">
      <label>
        <input
          id="filled-in-box"
          v-model="scrollDown"
          type="checkbox"
          class="filled-in"
        >
        <span>Scroll on new messages</span>
      </label>
    </div>
  </div>
</template>

<script>
import { canSubscribe } from '../../../services/userAuthorization'
import Title from '../../../directives/title.directive'

export default {
  name: 'SubscriptionControls',
  directives: {
    Title
  },
  props: {
    index: String,
    collection: String,
    warning: Object,
    subscribed: Boolean
  },
  data() {
    return {
      scrollDown: true
    }
  },
  watch: {
    scrollDown(value) {
      this.$emit('scroll-down', value)
    }
  },
  mounted() {
    this.$emit('scroll-down', this.scrollDown)
  },
  methods: {
    canSubscribe,
    toggleSubscription() {
      this.$emit('realtime-toggle-subscription')
    },
    clear() {
      this.$emit('realtime-clear-messages')
    }
  }
}
</script>
