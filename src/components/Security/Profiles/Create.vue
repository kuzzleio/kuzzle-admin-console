<template>
  <create
  title="Create a profile"
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
          this.error = 'The profile identifier is required'
          return
        }
        if (!content || Object.keys(content).length === 0) {
          this.error = 'The profile must have a content'
          return
        }

        kuzzle
          .security
          .createProfilePromise(id, content, {replaceIfExist: true})
          .then(() => {
            kuzzle.refreshIndex('%kuzzle')
            this.$router.push({name: 'SecurityProfilesList'})
          })
          .catch((e) => {
            this.error = 'An error occurred while creating profile: <br />' + e.message
          })
      },
      cancel () {
        this.$router.push({name: 'SecurityProfilesList'})
      }
    }
  }
</script>