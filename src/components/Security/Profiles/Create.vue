<template>
  <div>
    <Headline>Profile - Create</Headline>
    <Notice />
    <create-or-update
      v-model="document"
      title="Create a profile"
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

export default {
  name: 'ProfilesSecurityCreate',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  data() {
    return {
      error: '',
      document: {
        policies: [
          {
            roleId: 'yourRoleId'
          }
        ]
      },
      id: null,
      submitted: false
    }
  },
  methods: {
    async create(profile) {
      this.error = ''

      if (!profile) {
        this.error = 'The document is invalid, please review it'
        return
      }
      if (!this.id) {
        this.error = 'You must set an ID'
        return
      }

      this.submitted = true

      try {
        await this.$kuzzle.security
          .createProfile(this.id, { policies: profile.policies }, {
            refresh: 'wait_for'
          })
        setTimeout(() => {
          // we can't perform refresh index on %kuzzle
          this.$router.push({ name: 'SecurityRolesList' })
        }, 1000)
      } catch (e) {
        this.error =
          'An error occurred while creating profile: <br />' + e.message
        this.submitted = false
      }
    },
    cancel() {
      this.$router.push({ name: 'SecurityProfilesList' })
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
