<template>
  <create
  title="Create a role"
  :content="content"
  :error="error"
  @security-create::reset-error="error = ''"
  @security-create::create="create"
  @security-create::cancel="cancel"
  :get-mapping="getMappingRoles">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingRoles } from '../../../services/kuzzleWrapper'

  export default {
    components: {
      Create
    },
    data () {
      return {
        error: '',
        content: {}
      }
    },
    methods: {
      getMappingRoles,
      create (id, content) {
        if (!id) {
          this.error = 'The role identifier is required'
          return
        }
        if (!content || Object.keys(content).length === 0) {
          this.error = 'The role must have a content'
          return
        }

        kuzzle
          .security
          .createRolePromise(id, content, {replaceIfExist: true})
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
      }
    }
  }
</script>