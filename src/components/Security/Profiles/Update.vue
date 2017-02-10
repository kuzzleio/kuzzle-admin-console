<template>
  <create
  title="Update profile"
  :content="content"
  :update-id="id"
  :error="error"
  @security-create::create="update"
  @security-create::cancel="cancel"
  :document="document"
  :get-mapping="getMappingProfiles">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingProfiles } from '../../../services/kuzzleWrapper'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'SecurityUpdate',
    components: {
      Create
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
      update (id, json) {
        this.error = ''

        if (!json) {
          this.error = 'The document is invalid, please review it'
          return
        }

        kuzzle
          .security
          .updateProfilePromise(this.id, json, {replaceIfExist: true})
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
