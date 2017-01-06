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
  import {newDocument} from '../../../vuex/modules/data/getters'
  import {setNewDocument} from '../../../vuex/modules/data/actions'

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
          this.setNewDocument(json)
        }

        if (!this.newDocument._id) {
          this.error = 'The document identifier is required'
          return
        }

        return kuzzle
          .security
          .createUserPromise(this.newDocument._id, this.newDocument)
          .then(() => kuzzle.queryPromise({controller: 'index', action: 'refreshInternal'}, {}))
          .then(() => {
            this.$router.go({name: 'SecurityUsersList'})
          }).catch(err => {
            this.error = 'An error occurred while creating user: <br />' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'SecurityUsersList'})
        }
      }
    },
    vuex: {
      getters: {
        newDocument
      },
      actions: {
        setNewDocument
      }
    }
  }
</script>
