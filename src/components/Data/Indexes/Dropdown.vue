<template>
  <span>
    <dropdown :id="index" :class="class">
      <li><a v-link="{name: 'DataIndexSummary', params: {index: index}}">Browse collections</a></li>
      <!--<li><a href="#!">View profiles</a></li>-->
      <!--<li class="divider"></li>-->
      <!--<li><a href="#!">Edit</a></li>-->
      <!--<li><a href="#!">Clone</a></li>-->
      <!--<li><a href="#!">Duplicate</a></li>-->
      <!--<li><a href="#!">Rename</a></li>-->
      <!--<li><a href="#!" class="red-text">Truncate</a></li>-->
      <!--<li><a href="#!" class="red-text">Delete</a></li>-->
    </dropdown>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown.vue'

  export default {
    name: 'IndexDropdown',
    props: {
      index: String,
      'class': String
    },
    components: {
      Dropdown
    }
  }
</script>
