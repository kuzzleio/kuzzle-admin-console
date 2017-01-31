<template>
  <create
  title="Create a profile"
  :content="content"
  :error="error"
  @security-create::reset-error="error = ''"
  @security-create::create="create"
  @security-create::cancel="cancel"
  :document="document"
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
        document: {}
      }
    },
    methods: {
      getMappingProfiles,
      create (id, json) {
        this.error = ''

        if (!json) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!id) {
          this.error = 'The document must have an id'
          return
        }

        kuzzle
          .security
          .createProfilePromise(id, json, {replaceIfExist: true})
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
