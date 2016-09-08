<template>
  <div>
    <headline title="Roles Management"></headline>
    <common-list
      item-name="RoleItem"
      collection="roles"
      index="%kuzzle"
      @create-clicked="createRole">

      <div slot="emptySet" class="card-panel">
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-unlock-alt grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
            <p>
              Here you'll see the kuzzle's roles<br/>
              <em>Currently there is no role.</em>
            </p>
            <button v-link="{name: 'SecurityRolesCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a role
            </button>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'RolesList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createRole () {
        this.$router.go({name: 'SecurityRolesCreate'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
