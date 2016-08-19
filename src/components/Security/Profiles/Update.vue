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
  import Create from '../Common/Create'
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
        this.$router.go({name: 'SecurityProfilesList'})
      }
    },
    ready () {
      kuzzle
        .security
        .getProfilePromise(this.$route.params.id)
        .then((role) => {
          this.id = role.id
          this.content = role.content
        })
        .catch((e) => {
          this.$dispatch('toast', e.message, 'error')
          this.$router.go({name: 'SecurityProfilesCreate'})
        })
    }
  }
</script>