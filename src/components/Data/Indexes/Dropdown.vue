<template>
  <span>
    <dropdown :id="'index-' + index" class="IndexDropdown" :myclass="myclass">
      <li v-if="!isList">
        <router-link :to="{ name: 'DataIndexSummary', params: { index } }"
          >Browse collections</router-link
        >
      </li>
      <li class="divider" />
      <li :class="{ unauthorized: !canDeleteIndex(index) }">
        <a
          class="IndexDropdown-delete"
          :class="{
            disabled: !canDeleteIndex(index),
            'red-text': canDeleteIndex(index)
          }"
          :disabled="!canDeleteIndex(index)"
          @click.prevent="openModal"
          >Delete</a
        >
      </li>
    </dropdown>

    <modal-delete
      :id="'index-delete-' + index"
      :index="index"
      :is-open="isOpen"
      :close="close"
    />
  </span>
</template>

<script>
import Dropdown from '../../Materialize/Dropdown'
import ModalDelete from './ModalDelete'
import { canDeleteIndex } from '../../../services/userAuthorization'

export default {
  name: 'IndexDropdown',
  components: {
    Dropdown,
    ModalDelete
  },
  props: {
    index: String,
    myclass: String
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    isList() {
      return this.$route.name === 'DataIndexSummary'
    }
  },
  methods: {
    canDeleteIndex,
    openModal() {
      if (this.canDeleteIndex(this.$props.index)) {
        this.isOpen = true
      }
    },
    close() {
      this.isOpen = false
    }
  }
}
</script>
