<template>
  <create
  title="Update role"
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
          .updateRolePromise(this.$route.params.id, content, {replaceIfExist: true})
          .then(() => {
            this.$router.go({name: 'SecurityRolesList'})
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      cancel () {
        this.$router.go({name: 'SecurityRolesList'})
      }
    },
    ready () {
      kuzzle
        .security
        .getRolePromise(this.$route.params.id)
        .then((role) => {
          this.id = role.id
          this.content = role.content
        })
        .catch((e) => {
          this.$dispatch('toast', e.message, 'error')
          this.$router.go({name: 'SecurityRolesCreate'})
        })
    }
  }
</script>