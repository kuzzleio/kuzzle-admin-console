<template>
  <div>
    <Headline>
      Edit role - <span class="bold">{{ $route.params.id }}</span>
    </Headline>
    <Notice />
    <create-or-update
      v-model="document"
      title="Update role"
      :update-id="id"
      :error="error"
      :hide-id="true"
      :submitted="submitted"
      @document-create::create="update"
      @document-create::cancel="cancel"
      @document-create::error="setError"
    />
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
import Notice from '../Common/Notice'
import { getMappingRoles } from '../../../services/kuzzleWrapper'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'RolesUpdate',
  components: {
    Headline,
    CreateOrUpdate,
    Notice
  },
  data() {
    return {
      error: '',
      id: null,
      document: {},
      submitted: false
    }
  },
  async mounted() {
    try {
      const role = await this.$kuzzle.security
        .getRole(this.$route.params.id)
      this.id = role._id
      this.document = { controllers: role.controllers }
    } catch (e) {
      this.$store.commit(SET_TOAST, { text: e.message })
    }
  },
  methods: {
    getMappingRoles,
    async update(role, replace) {
      this.error = ''
      console.log(replace)
      if (!role) {
        this.error = 'The document is invalid, please review it'
        return
      }

      this.submitted = true

      try {
        if (replace) {
          this.$kuzzle.security.createOrReplaceRole(this.id, role)
        } else {
          this.$kuzzle.security.updateRole(this.id, role)
        }
        setTimeout(() => {
          // we can't perform refresh index on %kuzzle
          this.$router.push({ name: 'SecurityRolesList' })
        }, 1000)
      } catch (e) {
        this.$store.commit(SET_TOAST, { text: e.message })
        this.submitted = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityRolesList' })
      }
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
