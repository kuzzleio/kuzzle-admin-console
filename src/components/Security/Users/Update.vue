<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{documentToEditId}}</span>
    </headline>

    <create-or-update
      @document-create::create="update"
      @document-create::cancel="cancel"
      index="%kuzzle"
      collection="users"
      :hide-id="true">
    </create-or-update>
  </div>
</template>

<style scoped>
  .bold {
    font-weight: normal;
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import CreateOrUpdate from '../../Data/Documents/Common/CreateOrUpdate'
  import {newDocument, documentToEditId} from '../../../vuex/modules/data/getters'
  import {setNewDocument} from '../../../vuex/modules/data/actions'

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      Headline,
      CreateOrUpdate
    },
    props: {
      index: String,
      collection: String
    },
    methods: {
      update (viewState, json) {
        if (viewState === 'code') {
          if (!json) {
            this.$dispatch('toast', 'Invalid document', 'error')
            return
          }
          this.setNewDocument(json)
        }

        kuzzle
          .security
          .updateUserPromise(this.documentToEditId, this.newDocument)
          .then(() => {
            kuzzle.refreshIndex('%kuzzle')
            this.$router.go({name: 'SecurityUsersList'})
          })
          .catch((err) => {
            if (err) {
              this.$dispatch('toast', err.message, 'error')
            }
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
      actions: {
        setNewDocument
      },
      getters: {
        newDocument,
        documentToEditId
      }
    },
    ready () {
      kuzzle
        .security
        .getUserPromise(this.documentToEditId)
        .then((res) => {
          this.setNewDocument(res.content)
          this.$broadcast('document-create::fill', res.content)
        })
        .catch(err => {
          this.$dispatch('toast', err.message, 'error')
        })
    }
  }
</script>
