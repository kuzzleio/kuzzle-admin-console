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
      index="%kuzzle"
      collection="users"
      :document="document"
      :get-mapping="getMappingUsers">
    </create-or-update>
  </div>
</template>


<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import { getMappingUsers } from '../../../services/kuzzleWrapper'

  export default {
    name: 'UserCreate',
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
        document: {}
      }
    },
    methods: {
      getMappingUsers,
      create (json) {
        this.error = ''

        if (!json) {
          this.error = 'The document is invalid, please review it'
          return
        }
        if (!json._id) {
          this.error = 'The document must have an id'
          return
        }

        let document = {...json}
        let id = null

        if (document._id) {
          id = document._id
          delete document._id
        }

        kuzzle
          .security
          .createUserPromise(id, document)
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
      }
    }
  }
</script>
