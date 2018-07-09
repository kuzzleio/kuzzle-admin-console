<template>
  <span>
    <dropdown id="users-dropdown" :myclass="myclass">
      <li><router-link :to="{name: 'SecurityUsersEditCustomMapping'}">Edit data mapping</router-link></li>
    </dropdown>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown'

  export default {
    name: 'UsersDropdown',
    props: {
      'myclass': String
    },
    components: {
      Dropdown
    }
  }
</script>
