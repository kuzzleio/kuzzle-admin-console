<template>
  <create
  title="Update role"
  :content="content"
  :update-id="id"
  :error="error"
  @security-create::create="update"
  @security-create::cancel="cancel"
  :document="document"
  :get-mapping="getMappingRoles">
  </create>
</template>

<script>
  import Create from '../Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingRoles } from '../../../services/kuzzleWrapper'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'RolesUpdate',
    components: {
      Create
    },
    data () {
      return {
        error: '',
        id: null,
        document: {}
      }
    },
    methods: {
      getMappingRoles,
      update (id, json) {
        this.error = ''

        if (!json) {
          this.error = 'The document is invalid, please review it'
          return
        }

        kuzzle
          .security
          .createRolePromise(this.id, json, {replaceIfExist: true})
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
          this.document = role.content
        })
        .catch((e) => {
          this.$store.commit(SET_TOAST, {text: e.message})
          this.$router.push({name: 'SecurityRolesCreate'})
        })
    }
  }
</script>
