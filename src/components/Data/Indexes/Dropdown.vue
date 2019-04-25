<template>
  <span>
    <dropdown class="IndexDropdown" :id="'index-' + index" :myclass="myclass">
      <li v-if="!isList"><router-link :to="{name: 'DataIndexSummary', params: {index}}">Browse collections</router-link></li>
      <li class="divider"></li>
      <li v-if="canDeleteIndex(index)"><a @click.prevent="openModal" class="IndexDropdown-delete red-text">Delete</a></li>
    </dropdown>

    <modal-delete :id="'index-delete-' + index" :index="index" :is-open="isOpen" :close="close"></modal-delete>
  </span>
</template>


<script>
import Dropdown from '../../Materialize/Dropdown'
import ModalDelete from './ModalDelete'
import {
  canDeleteIndex
} from '../../../services/userAuthorization'

export default {
  name: 'IndexDropdown',
  props: {
    index: String,
    myclass: String
  },
  data() {
    return {
      isOpen: false
    }
  },
  components: {
    Dropdown,
    ModalDelete
  },
  methods: {
    canDeleteIndex,
    openModal() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    }
  },
  computed: {
    isList() {
      return this.$route.name === 'DataIndexSummary'
    }
  }
}
</script>
