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
          .updateRolePromise(this.$route.params.id, content, {replaceIfExist: true})
          .then(() => {
            this.$router.push({name: 'SecurityRolesList'})
          })
          .catch((e) => {
            this.$emit('toast', e.message, 'error')
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.push(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityRolesList'})
        }
      }
    },
    mounted () {
      kuzzle
        .security
        .getRolePromise(this.$route.params.id)
        .then((role) => {
          this.id = role.id
          this.content = role.content
        })
        .catch((e) => {
          this.$emit('toast', e.message, 'error')
          this.$router.push({name: 'SecurityRolesCreate'})
        })
    }
  }
</script>