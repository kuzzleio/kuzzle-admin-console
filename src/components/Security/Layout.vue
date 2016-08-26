<template>

  <aside>
    <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityUsersList', activeClass: 'active'}" class="waves-effect">
          <i class="fa fa-user" aria-hidden="true"></i>
          <span>Users</span>
        </a>
      </li>
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityProfilesList', activeClass: 'active'}" class="waves-effect">
          <i class="fa fa-users" aria-hidden="true"></i>
          <span>Profiles</span>
        </a>
      </li>
      <li v-link-active class="bold">
        <a v-link="{name: 'SecurityRolesList', activeClass: 'active'}" class="waves-effect">
          <i class="fa fa-unlock-alt" aria-hidden="true"></i>
          <span>Roles</span>
        </a>
      </li>
    </ul>
  </aside>

  <section class="view">
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </section>

</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .side-nav {
    a {
      i.fa {
        color: #646464
      }
      height: 54px;
      line-height: 54px;
    }
  }
  aside {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    a {
      padding: 0 20px;
    }
    .fa {
      width: 18px;
    }
  }
</style>

<script>
  export default {
    name: 'SecurityLayout'
  }
</script>
