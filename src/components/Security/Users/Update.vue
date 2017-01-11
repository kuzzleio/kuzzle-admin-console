<template>
  <div class="wrapper">
    <headline>
      Edit user - <span class="bold">{{decodeURIComponent($store.state.route.params.id)}}</span>
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
  import {newDocument} from '../../../vuex/modules/data/getters'
  import {setNewDocument} from '../../../vuex/modules/data/actions'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

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
            this.$store.commit(SET_TOAST, {text: 'Invalid document'})
            return
          }
          this.setNewDocument(json)
        }

        kuzzle
          .security
          .updateUserPromise(decodeURIComponent(this.$store.state.route.params.id), this.newDocument)
          .then(() => {
            kuzzle.refreshIndex('%kuzzle')
            this.$router.push({name: 'SecurityUsersList'})
          })
          .catch((err) => {
            if (err) {
              this.$store.commit(SET_TOAST, {text: err.message})
            }
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'SecurityUsersList'})
        }
      }
    },
    vuex: {
      actions: {
        setNewDocument
      },
      getters: {
        newDocument
      }
    },
    mounted () {
      kuzzle
        .security
        .getUserPromise(decodeURIComponent(this.$store.state.route.params.id))
        .then((res) => {
          this.setNewDocument(res.content)
          this.$emit('document-create::fill', res.content)
          return null
        })
        .catch(err => {
          this.$store.commit(SET_TOAST, {text: err.message})
        })
    }
  }
</script>
