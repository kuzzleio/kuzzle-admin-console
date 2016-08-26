<template>
  <div class="wrapper">
    <headline>
      User - Create
    </headline>

    <create-or-update
      @document-create::create="create"
      @document-create::cancel="cancel"
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
    methods: {
      create (viewState, json) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }

        console.log(this.newDocument)
        kuzzle
          .security
          .createUserPromise(this.newDocument._id, this.newDocument)
          .then(() => {
            kuzzle.refreshIndex('%kuzzle')
            this.$router.go({name: 'SecurityUsersList'})
          }).catch(err => {
            this.$dispatch('toast', err.message, 'error')
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
