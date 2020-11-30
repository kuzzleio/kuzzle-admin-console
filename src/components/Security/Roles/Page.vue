<template>
  <b-container class="RolesManagement">
    <b-row>
      <b-col cols="8">
        <headline>Roles</headline>
      </b-col>
      <b-col class="text-right mt-3">
        <b-button
          :disabled="!displayRevokeAnonymous"
          :title="displayRevokeAnonymous ? 'Reduce anonymous rights to the minimum' : 'You cannot revoke anonymous rights either because you don\'t have the permissions to do it or because there is no administrator user yet in the system.'
          class="mr-2"
          data-cy="RolesManagement-revokeAnonymous"
          variant="primary"
          v-b-modal.modal-revokeAnonymous
          >Revoke anonymous rights</b-button
        >
        <b-button
          class="mr-2"
          data-cy="RolesManagement-createBtn"
          variant="primary"
          :disabled="!canCreateRole"
          :to="{ name: 'SecurityRolesCreate' }"
          >Create Role</b-button
        >
      </b-col>
    </b-row>

    <list-not-allowed v-if="!canSearchRole" />

    <role-list
      v-if="canSearchRole"
      item-name="RoleItem"
      route-create="SecurityRolesCreate"
      route-update="SecurityRolesUpdate"
    >
      <b-card class="EmptyState text-center" slot="emptySet">
        <i class="text-secondary fas fa-unlock-alt fa-6x mb-3"></i>
        <h2 class="text-secondary font-weight-bold">No role is defined</h2>
        <p class="text-secondary" v-if="canCreateRole">
          You can create a new role by hitting the button above
        </p>
      </b-card>
    </role-list>
    <b-modal
      id="modal-revokeAnonymous"
      title="Revoke anonymous rights"
      @ok="revokeAnonymous"
    >
      <p class="my-4">
        The anonymous users will only be able to perform some basic authentication actions, like logging-in, see their rights and see their user ID. You will still be able to add more rights if needed.
      </p>
    </b-modal>
  </b-container>
</template>

<script>
import ListNotAllowed from '../../Common/ListNotAllowed'
import RoleList from './List'
import Headline from '../../Materialize/Headline'
import { mapGetters } from 'vuex'

export default {
  name: 'RolesManagement',
  components: {
    ListNotAllowed,
    RoleList,
    Headline
  },
  methods: {
    revokeAnonymous () {
      this.$kuzzle.security.updateRole('anonymous', {
        controllers: {
          "*": {
            "actions": {
              "*": false
            }
          },
          auth: {
            actions: {
              checkToken: true,
              getCurrentUser: true,
              getMyRights: true,
              login: true
            }
          },
          server: {
            actions: {
              publicApi: true,
              openapi: true
            }
          }
        }
      });
      this.$kuzzle.security.updateRole('default', {
        controllers: {
          "*": {
            "actions": {
              "*": false
            }
          },
          auth: {
            actions: {
              checkToken: true,
              getCurrentUser: true,
              getMyRights: true,
              logout: true,
              updateSelf: true
            }
          },
          server: {
            actions: {
              publicApi: true
            }
          }
        }
      });
      this.$router.go(this.$router.currentRoute)
    },
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
    ...mapGetters('auth', ['canSearchRole', 'canCreateRole']),
    displayRevokeAnonymous () {
      return (this.$store.direct.getters.auth.adminAlreadyExists &&
      this.$store.direct.getters.auth.canEditRole &&
      this.$store.direct.getters.auth.canManageRoles)
    }
  }
}
</script>
