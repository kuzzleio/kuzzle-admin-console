<template>
  <div>
    <Headline>
       Edit role - <span class="bold">{{decodeURIComponent($route.params.id)}}</span>
    </Headline>
    <create-or-update
      title="Update role"
      :update-id="id"
      :error="error"
      @document-create::create="update"
      @document-create::cancel="cancel"
      @document-create::error="setError"
      v-model="document"
      :hide-id="true"
      :submitted="submitted">
    </create-or-update>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingRoles } from '../../../services/kuzzleWrapper'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'RolesUpdate',
    components: {
      Headline,
      CreateOrUpdate
    },
    data () {
      return {
        error: '',
        id: null,
        document: {},
        submitted: false
      }
    },
    methods: {
      getMappingRoles,
      update (role) {
        this.error = ''

        if (!role) {
          this.error = 'The document is invalid, please review it'
          return
        }

        this.submitted = true

        kuzzle
          .security
          .createRolePromise(this.id, role, {replaceIfExist: true})
          .then(() => {
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityRolesList'})
            }, 1000)
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: e.message})
            this.submitted = false
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.push(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityRolesList'})
        }
      },
      setError (payload) {
        this.error = payload
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
