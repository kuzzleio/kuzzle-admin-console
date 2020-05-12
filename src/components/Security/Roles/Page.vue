<template>
  <b-container class="RolesManagement">
    <b-row>
      <b-col cols="8">
        <headline>Roles</headline>
      </b-col>
      <b-col class="text-right mt-3">
        <b-button
          class="mr-2"
          data-cy="RolesManagement-createBtn"
          variant="primary"
          :disabled="!canCreateRole()"
          :to="{ name: 'SecurityRolesCreate' }"
          >Create Role</b-button
        >
      </b-col>
    </b-row>

    <list-not-allowed v-if="!canSearchRole()" />

    <role-list
      v-if="canSearchRole()"
      item-name="RoleItem"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
    >
      <b-card class="EmptyState text-center" slot="emptySet">
        <i class="text-secondary fas fa-unlock-alt fa-6x mb-3"></i>
        <h2 class="text-secondary font-weight-bold">
          No role is defined
        </h2>
        <p class="text-secondary" v-if="canCreateRole()">
          You can create a new role by hitting the button above
        </p>
      </b-card>
    </role-list>
  </b-container>
</template>

<script>
import ListNotAllowed from '../../Common/ListNotAllowed'
import RoleList from './List'
import {
  canSearchRole,
  canCreateRole
} from '../../../services/userAuthorization'
import Headline from '../../Materialize/Headline'

export default {
  name: 'RolesManagement',
  components: {
    ListNotAllowed,
    RoleList,
    Headline
  },
  methods: {
    canSearchRole,
    canCreateRole
  }
}
</script>
