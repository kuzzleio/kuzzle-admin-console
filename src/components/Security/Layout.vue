<template>

  <aside>
    <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityUsersList', activeClass: 'active'}" class="waves-effect waves-teal">Users</a>
      </li>
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityProfilesList', activeClass: 'active'}" class="waves-effect waves-teal">Profiles</a>
      </li>
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityRolesList', activeClass: 'active'}" class="waves-effect waves-teal">Roles</a>
      </li>
    </ul>
  </aside>

  <section class="view">
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </section>

</template>

<script>
  export default {
    name: 'SecurityLayout'
  }
</script>
