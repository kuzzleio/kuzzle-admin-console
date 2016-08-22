<template>
  <create
  title="Create a profile"
  :content="content"
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
        content: {}
      }
    },
    methods: {
      create (id, content) {
        if (!id || !content || Object.keys(content).length === 0) {
          return
        }

        kuzzle
          .security
          .createProfilePromise(id, content, {replaceIfExist: true})
          .then(() => {
            kuzzle.refreshIndex('%kuzzle')
            this.$router.go({name: 'SecurityProfilesList'})
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      cancel () {
        this.$router.go({name: 'SecurityProfilesList'})
      }
    }
  }
</script>