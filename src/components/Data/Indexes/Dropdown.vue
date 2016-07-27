<template>
  <dropdown id="test" class="icon-small icon-black">
    <li><a href="#!">Browse collections</a></li>
    <li><a href="#!">View profiles</a></li>
    <li class="divider"></li>
    <li><a href="#!">Edit</a></li>
    <li><a href="#!">Clone</a></li>
    <li><a href="#!">Duplicate</a></li>
    <li><a href="#!">Truncate</a></li>
    <li><a href="#!">Rename</a></li>
    <li><a href="#!">Delete</a></li>
  </dropdown>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown.vue'

  export default {
    name: 'IndexDropdown',
    props: ['id'],
    components: {
      Dropdown
    }
  }
</script>
