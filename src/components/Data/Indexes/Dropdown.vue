<template>
  <span>
    <dropdown :id="index" :myclass="myclass">
      <li v-if="!isList"><router-link :to="{name: 'DataIndexSummary', params: {index: index}}">Browse collections</router-link></li>
      <li class="divider"></li>
      <li><a @click.prevent="openModal" class="red-text">Delete</a></li>
    </dropdown>

    <modal-delete :id="'index-delete-' + index" :index="index" :is-open="isOpen" :close="close"></modal-delete>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown'
  import ModalDelete from './ModalDelete'

  export default {
    name: 'IndexDropdown',
    props: {
      index: String,
      myclass: String
    },
    data () {
      return {
        isOpen: false
      }
    },
    components: {
      Dropdown,
      ModalDelete
    },
    methods: {
      openModal () {
        this.isOpen = true
      },
      close () {
        this.isOpen = false
      }
    },
    computed: {
      isList () {
        return this.$route.name === 'DataIndexSummary'
      }
    }
  }
</script>
