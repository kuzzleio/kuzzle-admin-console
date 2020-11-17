<template>
  <b-container class="RolesManagement">
    <b-row>
      <b-col cols="8">
        <headline>Roles</headline>
      </b-col>
      <b-col class="text-right mt-3">
        <b-button
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
        Do you want to revoke the rights of the annonymous role ?
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
    ...mapGetters('auth', ['canSearchRole', 'canCreateRole'])
  }
}
</script>
