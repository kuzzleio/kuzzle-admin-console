<template>
  <create
  title="Create a profile"
  :content="content"
  :error="error"
  @security-create::reset-error="error = ''"
  @security-create::create="create"
  @security-create::cancel="cancel"
  :get-mapping="getMappingProfiles">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingProfiles } from '../../../services/kuzzleWrapper'

  export default {
    name: 'SecurityCreate',
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
      getMappingProfiles,
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
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityProfilesList'})
            }, 1000)
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
