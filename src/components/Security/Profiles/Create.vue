<template>
  <create-or-update
  title="Create a profile"
  :content="content"
  :error="error"
  @document-create::reset-error="error = ''"
  @document-create::create="create"
  @document-create::cancel="cancel"
  @change-id="updateId"
  v-model="document">
  </create-or-update>
</template>

<script>
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingProfiles } from '../../../services/kuzzleWrapper'

  export default {
    name: 'ProfilesSecurityCreate',
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
      getMappingProfiles,
      create (profile) {
        this.error = ''

        if (!profile) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!this.id) {
          this.error = 'You must set an ID'
          return
        }

        kuzzle
          .security
          .createProfilePromise(this.id, profile, {replaceIfExist: true})
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
      },
      updateId (id) {
        this.id = id
      }
    }
  }
</script>
