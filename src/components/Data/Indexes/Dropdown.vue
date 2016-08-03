<template>
  <dropdown :id="id" :class="class">
    <li><a href="#!">Browse collections</a></li>
    <li><a href="#!">View profiles</a></li>
    <li class="divider"></li>
    <li><a href="#!">Edit</a></li>
    <li><a href="#!">Clone</a></li>
    <li><a href="#!">Duplicate</a></li>
    <li><a href="#!">Rename</a></li>
    <li><a href="#!" class="red-text">Truncate</a></li>
    <li><a href="#!" class="red-text">Delete</a></li>
  </dropdown>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown.vue'

  export default {
    name: 'IndexDropdown',
    props: ['id', 'class'],
    components: {
      Dropdown
    }
  }
</script>
