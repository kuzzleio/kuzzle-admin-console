<template>
  <create
  title="Update profile"
  :content="content"
  :update-id="id"
  :error="error"
  @security-create::create="update"
  @security-create::cancel="cancel">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'SecurityUpdate',
    components: {
      Create
    },
    data () {
      return {
        content: {},
        error: '',
        id: null
      }
    },
    methods: {
      update (id, content) {
        if (!content || Object.keys(content).length === 0) {
          this.error = 'The profile must have a content'
          return
        }

        kuzzle
          .security
          .updateProfilePromise(this.$route.params.id, content, {replaceIfExist: true})
          .then(() => {
            this.$router.push({name: 'SecurityProfilesList'})
          })
          .catch((e) => {
            this.$emit('toast', e.message, 'error')
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
        .getProfilePromise(this.$route.params.id)
        .then((profile) => {
          this.id = profile.id
          this.content = profile.content
        })
        .catch((e) => {
          this.$store.commit(SET_TOAST, {text: e.message})
          this.$router.push({name: 'SecurityProfilesCreate'})
        })
    }
  }
</script>
