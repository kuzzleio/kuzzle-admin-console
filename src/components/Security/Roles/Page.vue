<template>
  <div class="RolesManagement">
    <headline title="Role Management" />

    <list-not-allowed v-if="!canSearchRole()" />

    <role-list
      v-if="canSearchRole()"
      item-name="RoleItem"
      :display-create="canCreateRole()"
      :perform-search="performSearchRoles"
      :perform-delete="performDeleteRoles"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
      @create-clicked="createRole"
    >
      <div
        slot="emptySet"
        class="card-panel"
      >
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i
              class="fa fa-6x fa-unlock-alt grey-text text-lighten-1"
              aria-hidden="true"
            />
          </div>
          <div class="col s10">
            <p>
              In this page, you'll be able to manage the <a href="https://docs.kuzzle.io/guide/1/essentials/security/#defining-roles">Security Roles</a>
              defined in your Kuzzle server.<br>
              <em>Currently, no Security Role is defined. You can create one by pushing the "Create" button above.</em>
            </p>
            <router-link
              :disabled="!canCreateRole()"
              :class="!canCreateRole() ? 'disabled' : ''"
              :title="!canCreateRole() ? 'You are not allowed to create new roles' : ''"
              :to="{name: 'SecurityRolesCreate'}"
              class="btn primary waves-effect waves-light"
            >
              <i class="fa fa-plus-circle left" />
              Create a role
            </router-link>
          </div>
        </div>
      </div>
    </role-list>
  </div>
</template>

<script>
import ListNotAllowed from '../../Common/ListNotAllowed'
import RoleList from './List'
import {
  canSearchRole,
  canCreateRole
} from '../../../services/userAuthorization'
import Headline from '../../Materialize/Headline'
import {
  performSearchRoles,
  performDeleteRoles
} from '../../../services/kuzzleWrapper'

export default {
  name: 'RolesManagement',
  components: {
    ListNotAllowed,
    RoleList,
    Headline
  },
  methods: {
    createRole() {
      this.$router.push({ name: 'SecurityRolesCreate' })
    },
    canSearchRole,
    canCreateRole,
    performSearchRoles,
    performDeleteRoles
  },
  route: {
    data() {
      this.$emit('crudl-refresh-search')
    }
  }
}
</script>
