<template>
  <create-or-update
  title="Create a role"
  :content="content"
  :error="error"
  @document-create::reset-error="error = ''"
  @document-create::create="create"
  @document-create::cancel="cancel"
  @document-create::error="setError"
  @change-id="updateId"
  v-model="document">
  </create-or-update>
</template>

<script>
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingRoles } from '../../../services/kuzzleWrapper'

  export default {
    name: 'RolesSecurityCreate',
    components: {
      CreateOrUpdate
    },
    data () {
      return {
        error: '',
        document: {},
        id: null
      }
    },
    methods: {
      getMappingRoles,
      create (role) {
        this.error = ''

        if (!role) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!this.id) {
          this.error = 'You must set an ID'
          return
        }

        kuzzle
          .security
          .createRolePromise(this.id, role, {replaceIfExist: true})
          .then(() => {
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityRolesList'})
            }, 1000)
          })
          .catch((e) => {
            this.error = 'An error occurred while creating role: <br />' + e.message
          })
      },
      cancel () {
        this.$router.push({name: 'SecurityRolesList'})
      },
      updateId (id) {
        this.id = id
      },
      setError (payload) {
        this.error = payload
      }
    }
  }
</script>
