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
      collection="users">
    </create-or-update>
  </div>
</template>


<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import {SET_NEW_DOCUMENT} from '../../../vuex/modules/data/mutation-types'

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
        error: ''
      }
    },
    methods: {
      create (viewState, json) {
        this.error = ''

        if (viewState === 'code') {
          if (!json) {
            this.error = 'The document is invalid, please review it'
            return
          }
          if (!json._id) {
            this.error = 'The document must have a field "_id"'
            return
          }
          this.$store.commit(SET_NEW_DOCUMENT, json)
        }

        if (!this.$store.state.data.newDocument._id) {
          this.error = 'The document identifier is required'
          return
        }

        kuzzle
          .security
          .createUserPromise(this.$store.state.data.newDocument._id, this.$store.state.data.newDocument)
          .then(() => {
            setTimeout(() => { // we can't perform refresh index on %kuzzle
              this.$router.push({name: 'SecurityUsersList'})
            }, 1000)
          })
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
