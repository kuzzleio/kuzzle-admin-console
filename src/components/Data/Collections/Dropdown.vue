<template>
  <span>
    <dropdown :id="'collection-' + collection" :myclass="myclass">
      <li><router-link
        :class="{disabled: !canEditCollection(index, collection)}"
        :to="canEditCollection(index, collection) ? {name: 'DataCollectionEdit', params: {collection, index}} : ''"
        >Edit collection</router-link>
      </li>
      <li v-if="isRealtime"><a class="remove" @click="removeRealtimeCollection">Remove collection</a></li>
      <li class="divider"></li>
      <li v-if="!isRealtime && !isList"><router-link :to="{name: 'DataDocumentsList', params: {collection: collection, index: index}}">Browse documents</router-link></li>
      <li><router-link
        :class="{disabled: !canSubscribe(index, collection)}"
        :to="canSubscribe(index, collection) ? {name: 'DataCollectionWatch', params: {collection, index}}: ''"
        >Watch messages</router-link>
      </li>
      <li class="divider"></li>
      <li v-if="!isRealtime && isList"><a
        @click.prevent="openModal"
        :class="{'red-text': canTruncateCollection(index, collection), disabled: !canTruncateCollection(index, collection)}"
        >Clear documents</a>
      </li>
    </dropdown>

    <modal-clear :id="'collection-clear-' + collection" :index="index" :collection="collection" :is-open="isOpen" :close="close"></modal-clear>
  </span>
</template>


<script>
import Dropdown from '../../Materialize/Dropdown'
import { REMOVE_REALTIME_COLLECTION } from '../../../vuex/modules/index/mutation-types'
import ModalClear from './ModalClear.vue'
import {
  canEditCollection,
  canSubscribe,
  canTruncateCollection
} from '../../../services/userAuthorization'

export default {
  name: 'CollectionDropdown',
  props: {
    index: String,
    collection: String,
    isRealtime: Boolean,
    myclass: String
  },
  data() {
    return {
      isOpen: false
    }
  },
  components: {
    Dropdown,
    ModalClear
  },
  computed: {
    isList() {
      return this.$route.name === 'DataDocumentsList'
    }
  },
  methods: {
    canEditCollection,
    canSubscribe,
    canTruncateCollection,
    removeRealtimeCollection() {
      this.$store.dispatch(REMOVE_REALTIME_COLLECTION, {
        index: this.index,
        collection: this.collection
      })
    },
    openModal() {
      if (this.canTruncateCollection(this.$props.index, this.$props.collection)) {
        this.isOpen = true
      }
    },
    close() {
      this.isOpen = false
    }
  }
}
</script>
