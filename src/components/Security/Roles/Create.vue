<template>
  <div>
    <Headline>Role - Create</Headline>
    <Notice />
    <create-or-update
      v-model="document"
      title="Create a role"
      :error="error"
      :submitted="submitted"
      :mandatory-id="true"
      @document-create::reset-error="error = ''"
      @document-create::create="create"
      @document-create::cancel="cancel"
      @document-create::error="setError"
      @change-id="updateId"
    />
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
import Notice from '../Common/Notice'
import { getMappingRoles } from '../../../services/kuzzleWrapper'

export default {
  name: 'RolesSecurityCreate',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  data() {
    return {
      error: '',
      document: {
        controllers: {
          yourController: {
            actions: {
              yourAction: true
            }
          }
        }
      },
      id: null,
      submitted: false
    }
  },
  methods: {
    getMappingRoles,
    async create(role) {
      this.error = ''

      if (!role) {
        this.error = 'The document is invalid, please review it'
        return
      }
      if (!this.id) {
        this.error = 'You must set an ID'
        return
      }

      this.submitted = true

      try {
        await this.$kuzzle.security.createRole(this.id, role)
        setTimeout(() => {
          // we can't perform refresh index on %kuzzle
          this.$router.push({ name: 'SecurityRolesList' })
        }, 1000)
      } catch (e) {
        this.error = 'An error occurred while creating role: <br />' + e.message
        this.submitted = false
      }
    },
    cancel() {
      this.$router.push({ name: 'SecurityRolesList' })
    },
    updateId(id) {
      this.id = id
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
