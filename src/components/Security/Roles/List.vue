<template>
  <div class="roles">
    <headline title="Role Management"></headline>

    <list-not-allowed v-if="!canSearchRole()"></list-not-allowed>

    <common-list
      v-if="canSearchRole()"
      item-name="RoleItem"
      @create-clicked="createRole"
      :display-create="canCreateRole()"
      :perform-search="performSearchRoles"
      :perform-delete="performDeleteRoles"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate">

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
            <router-link :disabled="!canCreateRole()"
                    :class="!canCreateRole() ? 'disabled' : ''"
                    :title="!canCreateRole() ? 'You are not allowed to create new roles' : ''"
                    :to="{name: 'SecurityRolesCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a role
            </router-link>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import ListNotAllowed from '../../Common/ListNotAllowed'
  import CommonList from './CommonList'
  import { canSearchRole, canCreateRole } from '../../../services/userAuthorization'
  import Headline from '../../Materialize/Headline'
  import { performSearchRoles, performDeleteRoles } from '../../../services/kuzzleWrapper'

  export default {
    name: 'RolesList',
    components: {
      ListNotAllowed,
      CommonList,
      Headline
    },
    methods: {
      createRole () {
        this.$router.push({name: 'SecurityRolesCreate'})
      },
      canSearchRole,
      canCreateRole,
      performSearchRoles,
      performDeleteRoles
    },
    route: {
      data () {
        this.$emit('crudl-refresh-search')
      }
    }
  }
</script>
