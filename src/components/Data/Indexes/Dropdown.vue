<template>
  <span>
    <dropdown :id="index" :myclass="myclass">
      <li><router-link to="{name: 'DataIndexSummary', params: {index: index}}">Browse collections</router-link></li>
      <li class="divider"></li>
      <li><a href="#!" @click.prevent="$emit('modal-open', 'index-delete-' + index)" class="red-text">Delete</a></li>
    </dropdown>

    <modal-delete :id="'index-delete-' + index" :index="index"></modal-delete>
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
    components: {
      Dropdown,
      ModalDelete
    }
  }
</script>
