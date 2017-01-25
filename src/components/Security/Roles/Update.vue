<template>
  <create
  title="Update role"
  :content="content"
  :update-id="id"
  :error="error"
  @security-create::create="update"
  @security-create::cancel="cancel"
  :get-mapping="getMappingRoles">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingRoles } from '../../../services/kuzzleWrapper'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
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
      getMappingRoles,
      update (id, content) {
        if (!content || Object.keys(content).length === 0) {
          this.error = 'The profile must have a content'
          return
        }

        kuzzle
          .security
          .updateRolePromise(this.$route.params.id, content, {replaceIfExist: true})
          .then(() => {
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityRolesList'})
            }, 1000)
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: e.message})
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
        .fetchRolePromise(this.$route.params.id)
        .then((role) => {
          this.id = role.id
          this.content = role.content
        })
        .catch((e) => {
          this.$store.commit(SET_TOAST, {text: e.message})
          this.$router.push({name: 'SecurityRolesCreate'})
        })
    }
  }
</script>
