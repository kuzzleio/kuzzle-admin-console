<template>
  <create
  title="Create a role"
  :content="content"
  :error="error"
  @security-create::reset-error="error = ''"
  @security-create::create="create"
  @security-create::cancel="cancel">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'

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
            kuzzle.refreshIndex('%kuzzle')
            this.$router.push({name: 'SecurityRolesList'})
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