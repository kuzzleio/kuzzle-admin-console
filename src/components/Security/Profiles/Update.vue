<template>
  <create-or-update
  title="Update profile"
  :update-id="id"
  :error="error"
  @document-create::create="update"
  @document-create::cancel="cancel"
  @document-create::error="setError"
  v-model="document"
  :hide-id="true">
  </create-or-update>
</template>

<script>
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingProfiles } from '../../../services/kuzzleWrapper'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'SecurityUpdate',
    components: {
      CreateOrUpdate
    },
    data () {
      return {
        document: {},
        error: '',
        id: null
      }
    },
    methods: {
      getMappingProfiles,
      update (profile) {
        this.error = ''

        if (!profile) {
          this.error = 'The document is invalid, please review it'
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
            this.$store.commit(SET_TOAST, {text: e.message})
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityProfilesList'})
        }
      },
      setError (payload) {
        this.error = payload
      }
    },
    mounted () {
      kuzzle
        .security
        .fetchProfilePromise(this.$route.params.id)
        .then((profile) => {
          this.id = profile.id
          this.document = profile.content
        })
        .catch((e) => {
          this.$store.commit(SET_TOAST, {text: e.message})
          this.$router.push({name: 'SecurityProfilesCreate'})
        })
    }
  }
</script>
