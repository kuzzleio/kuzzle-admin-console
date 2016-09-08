<template>
  <create
  title="Update profile"
  :content="content"
  :update-id="id"
  @security-create::create="update"
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
        content: {},
        id: null
      }
    },
    methods: {
      update (content) {
        if (!content || Object.keys(content).length === 0) {
          return
        }

        kuzzle
          .security
          .updateProfilePromise(this.$route.params.id, content, {replaceIfExist: true})
          .then(() => {
            this.$router.go({name: 'SecurityProfilesList'})
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'SecurityProfilesList'})
        }
      }
    },
    ready () {
      kuzzle
        .security
        .getProfilePromise(this.$route.params.id)
        .then((profile) => {
          this.id = profile.id
          this.content = profile.content
        })
        .catch((e) => {
          this.$dispatch('toast', e.message, 'error')
          this.$router.go({name: 'SecurityProfilesCreate'})
        })
    }
  }
</script>