<template>
  <span>
    <dropdown :id="collection" :class="class">
      <li v-if="!isRealtime"><a href="#!">Browse documents</a></li>
      <li><a href="#!">Watch messages</a></li>
      <li v-if="!isRealtime"><a href="#!">Summary</a></li>
      <li><a href="#!">View profiles</a></li>
      <li class="divider"></li>
      <li v-if="isRealtime"><a href="#!">Persist</a></li>
      <li v-if="!isRealtime"><a href="#!">Edit</a></li>
      <li v-if="!isRealtime"><a href="#!">Clone</a></li>
      <li v-if="!isRealtime"><a href="#!">Duplicate</a></li>
      <li v-if="!isRealtime"><a href="#!">Rename</a></li>
      <li v-if="!isRealtime"><a href="#!" class="red-text">Truncate</a></li>
    </dropdown>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown.vue'

  export default {
    name: 'CollectionDropdown',
    props: {
      index: String,
      collection: String,
      isRealtime: Boolean,
      'class': String
    },
    components: {
      Dropdown
    }
  }
</script>
