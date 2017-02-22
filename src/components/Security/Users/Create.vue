<template>
  <div>
    <headline>
      User - Create
    </headline>

    <create-or-update
      @document-create::create="create"
      @document-create::cancel="cancel"
      @document-create::reset-error="error = ''"
      :mandatory-id="true"
      :error="error"
      collection="users"
      v-model="document"
      @change-id="updateId">
    </create-or-update>
  </div>
</template>


<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import { getMappingUsers } from '../../../services/kuzzleWrapper'

  export default {
    name: 'UsersSecurityCreate',
    components: {
      Headline,
      CreateOrUpdate
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        error: '',
        document: {},
        id: null
      }
    },
    methods: {
      getMappingUsers,
      create (user) {
        this.error = ''

        if (!user) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!this.id) {
          this.error = 'You must set an ID'
          return
        }

        kuzzle
          .security
          .createUserPromise(this.id, user)
          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
          .then(() => this.$router.push({name: 'SecurityUsersList'}))
          .catch(err => {
            this.error = 'An error occurred while creating user: <br />' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      },
      updateId (id) {
        this.id = id
      }
    }
  }
</script>
